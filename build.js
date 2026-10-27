import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import RSS from 'rss';

const outputDir = 'build';

// 1. Configure Nunjucks environment & custom 'url' filter
const env = nunjucks.configure('src', { autoescape: true });

env.addFilter('url', function (pathStr) {
	if (!pathStr) return '';
	const siteConfig = JSON.parse(fs.readFileSync('src/site.json', 'utf-8'));
	let base = siteConfig.baseUrl || '/';
	if (!base.endsWith('/')) base += '/';
	const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;
	return base + cleanPath;
});

// 2. Clean and recreate output directories
if (fs.existsSync(outputDir)) {
	fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(outputDir, 'css'), { recursive: true });
fs.mkdirSync(path.join(outputDir, 'js'), { recursive: true });
fs.mkdirSync(path.join(outputDir, 'posts'), { recursive: true });

try {
	// 3. Read site configuration
	const siteConfig = JSON.parse(fs.readFileSync('src/site.json', 'utf-8'));

	// 4. Initialize RSS Feed Generator
	const feed = new RSS({
		title: siteConfig.title,
		description: siteConfig.description,
		feed_url: `${siteConfig.siteUrl || 'https://example.com'}/rss.xml`,
		site_url: siteConfig.siteUrl || 'https://example.com',
		author: siteConfig.author,
		language: 'en'
	});

	// 5. Read all Markdown posts from src/posts/
	const postsDir = 'src/posts';
	if (!fs.existsSync(postsDir)) {
		fs.mkdirSync(postsDir, { recursive: true });
	}

	const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'));

	const postsData = files.map((filename) => {
		const filePath = path.join(postsDir, filename);
		const rawFile = fs.readFileSync(filePath, 'utf-8');

		const { data: frontMatter, content: markdownBody } = matter(rawFile);
		const htmlContent = marked.parse(markdownBody);
		const slug = filename.replace('.md', '.html');
		const postUrl = `${siteConfig.siteUrl || 'https://example.com'}/posts/${slug}`;

		// Add post entry to RSS feed instance
		feed.item({
			title: frontMatter.title || slug,
			description: frontMatter.description || htmlContent,
			url: postUrl,
			date: frontMatter.date || new Date(),
			author: frontMatter.author || siteConfig.author,
			categories: frontMatter.tags || []
		});

		// Render individual post page
		const postHtml = env.render('post-template.njk', {
			site: siteConfig,
			meta: frontMatter,
			content: htmlContent
		});

		fs.writeFileSync(path.join(outputDir, 'posts', slug), postHtml);

		return {
			meta: frontMatter,
			url: `posts/${slug}`,
			content: htmlContent
		};
	});

	// 6. Sort posts by publication date (newest first)
	postsData.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

	// 7. Render index.html page
	const indexHtml = env.render('index.njk', {
		site: siteConfig,
		posts: postsData
	});
	fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);

	// 8. Write RSS XML feed to build/rss.xml
	fs.writeFileSync(path.join(outputDir, 'rss.xml'), feed.xml({ indent: true }));

	// 9. Copy static assets
	if (fs.existsSync('src/css/style.css')) {
		fs.copyFileSync('src/css/style.css', path.join(outputDir, 'css', 'style.css'));
	}
	if (fs.existsSync('src/js/script.js')) {
		fs.copyFileSync('src/js/script.js', path.join(outputDir, 'js', 'script.js'));
	}

	console.log('✅ Production static build completed successfully!');
	console.log('📡 Generated RSS feed: ./build/rss.xml');
} catch (err) {
	console.error('❌ Build failed:', err.message);
	process.exit(1);
}