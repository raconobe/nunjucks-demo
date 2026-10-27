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



  GNU nano 8.4                                                                  /home/rco/.ssh/config                                                                           
# Work GitHub Account (rco)
Host github.com-rco
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_rco
    IdentitiesOnly yes

# Personal GitHub Account (raco)
Host github.com-raco
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_raco
    IdentitiesOnly yes

ssh -T git@github.com-raco


git remote add origin git@github.com-raco:raconobe/nunjucks-demo.git
git push -u origin main