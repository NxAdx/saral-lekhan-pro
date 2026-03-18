# Git Command Guide

A comprehensive reference for version control operations in the **Saral Lekhan Plus** repository.

## 🧱 The Basics

- `git status`: Check the current state of your workspace.
- `git add .`: Stage all changes for the next commit.
- `git commit -m "feat: your message"`: Record your changes. Follow conventional commits (feat, fix, chore, logic).
- `git push origin main`: Upload your local commits to the remote repository.
- `git pull origin main`: Fetch and merge changes from the remote repository.

---

## 🌿 Branching & Merging

- `git branch`: List all local branches.
- `git checkout -b <branch-name>`: Create and switch to a new branch.
- `git checkout <branch-name>`: Switch to an existing branch.
- `git merge <branch-name>`: Merge changes from another branch into your current one.
- `git branch -d <branch-name>`: Delete a local branch.

---

## 📦 Stashing & Cleanup

- `git stash`: Temporarily save uncommitted changes (useful when you need to switch branches quickly).
- `git stash pop`: Restore the most recently stashed changes.
- `git stash list`: View all stashed changes.
- `git clean -fd`: Remove untracked files and directories.
- `git restore <file>`: Discard local changes to a specific file.

---

## ⏪ Reverting & Resetting

- `git log --oneline -n 10`: View the last 10 commits.
- `git reset --soft HEAD~1`: Undo the last commit but keep the changes staged.
- `git reset --hard HEAD~1`: Undo the last commit and **delete** the changes (be careful!).
- `git revert <commit-sha>`: Create a new commit that undoes the changes of a previous commit.

---

## 🏗️ Remote Management

- `git remote -v`: List all configured remote repositories.
- `git remote add origin <url>`: Connect your local repo to a new remote.
- `git fetch origin`: Download all history from the remote without merging.

---

5. **Use Stash**: Avoid committing "work in progress" code; use `git stash` instead.

---

## 🔒 Privacy & Security

**Maintaining repository privacy is a top priority.** 

1. **Ignore AI Metadata**: Folders like `.agent/`, `.agents/`, and `brain/` contain internal reasoning and metadata. They must **never** be committed to public repositories.
2. **Protect Secrets**: 
   - `google-services.json` and `release.keystore` must remain in `.gitignore`.
   - Never commit `.env` files or plain-text passwords.
3. **Clean Research**: Temporary folders like `research_inspiration/` and `.maestro/` (E2E tests) should be excluded from production pushes unless explicitly required.

---

## 🎨 Native Asset Sync (CRITICAL)

When updating **Icons** (`icon`, `adaptiveIcon`) or **Splash Screens** in `app.json`, the changes **will not** automatically reflect in the native build if the `android/` or `ios/` folders are committed.

**Follow these steps before every release push:**

1. Update `app.json` with new asset paths.
2. Run the sync command:
   ```bash
   npx expo prebuild --platform android --no-install
   ```
3. Verify that files in `android/app/src/main/res/` have changed.
4. Commit both `app.json` and the `android/` changes together.

> [!IMPORTANT]
> Failure to run `prebuild` will result in an APK that looks like the previous version, even if `app.json` is updated!

