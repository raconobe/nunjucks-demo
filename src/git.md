# 1. Add all project files and commit locally
git add .
git commit -m "Complete Nunjucks generator with RSS and GitHub Actions setup"

# 2. Rename the default branch to main
git branch -M main

# 3. Connect your local folder to your remote GitHub repository
# (Replace YOUR-USERNAME and YOUR-REPO-NAME with your GitHub details)
git remote add origin https://github.com/raconobe/nunjucks-demo.git

# 4. Push your code to GitHub
git push -u origin main