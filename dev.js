import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import browserSync from 'browser-sync';

const bs = browserSync.create();

// Configure Nunjucks environment with noCache: true for instant live-reload updates
const env = nunjucks.configure('src', {
	autoescape: true,
	noCache: true
});

// Add custom 'url' filter
env.addFilter('url', function (pathStr) {
	if (!pathStr) return '';
	const siteConfig = JSON.parse(fs.readFileSync('src/site.json', 'utf-8'));
	let base = siteConfig.baseUrl || '/';
	if (!base.endsWith('/')) base += '/';
	const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;
	return base + cleanPath;
});

function buildSite() {
	try {
		// Ensure output build folders exist
		fs.mkdirSync('build/css', { recursive: true });
		fs.mkdirSync('build/js', { recursive: true });
		fs.mkdirSync('build/posts', { recursive: true });

		const siteConfig = JSON.parse(fs.readFileSync('src/site.json', 'utf-8'));
		const postsDir = 'src/posts';

		if (!fs.existsSync(postsDir)) {
			fs.mkdirSync(postsDir, { recursive: true });
		}

		const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

		const postsData = files.map((filename) => {
			const filePath = path.join(postsDir, filename);
			const rawFile = fs.readFileSync(filePath, 'utf-8');

			const { data: frontMatter, content: markdownBody } = matter(rawFile);
			const htmlContent = marked.parse(markdownBody);
			const slug = filename.replace('.md', '.html');

			const postHtml = env.render('post-template.njk', {
				site: siteConfig,
				meta: frontMatter,
				content: htmlContent
			});
			
			fs.writeFileSync(path.join('build', 'posts', slug), postHtml);

			return {
				meta: frontMatter,
				url: `posts/${slug}`,
				content: htmlContent
			};
		});

		// Sort posts by date (newest first)
		postsData.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

		// Render main index page
		const indexHtml = env.render('index.njk', {
			site: siteConfig,
			posts: postsData
		});
		fs.writeFileSync(path.join('build', 'index.html'), indexHtml);

		// Copy static assets
		if (fs.existsSync('src/css/style.css')) {
			fs.copyFileSync('src/css/style.css', 'build/css/style.css');
		}
		if (fs.existsSync('src/js/script.js')) {
			fs.copyFileSync('src/js/script.js', 'build/js/script.js');
		}

		console.log('⚡ Site rebuilt successfully at', new Date().toLocaleTimeString());
	} catch (err) {
		console.error('Build Error:', err.message);
	}
}

// Initial Build Execution
buildSite();

// Start Live Server
bs.init({
	server: 'build',
	index: 'index.html',
	open: true,
	notify: false
});

// Watch src/ folder for file changes and trigger auto-reload
bs.watch('src/**/*.*').on('change', () => {
	buildSite();
	bs.reload();
});