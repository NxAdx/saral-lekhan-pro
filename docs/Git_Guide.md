# Git Command Guide

A reference for version-control operations in the Saral Lekhan Plus repository.

## Basics

- `git status`: Check the current workspace state.
- `git add .`: Stage current changes.
- `git commit -m "feat: your message"`: Record changes.
- `git push origin main`: Push local commits.
- `git pull origin main`: Fetch and merge remote changes.

## Branching

- `git branch`: List local branches.
- `git checkout -b <branch-name>`: Create and switch to a branch.
- `git checkout <branch-name>`: Switch to an existing branch.
- `git merge <branch-name>`: Merge another branch into the current branch.
- `git branch -d <branch-name>`: Delete a local branch.

## Reverts

- `git log --oneline -n 10`: View recent commits.
- `git reset --soft HEAD~1`: Undo the last commit while keeping changes staged.
- `git revert <commit-sha>`: Create a new commit that undoes a previous commit.

## Privacy and Security

1. Do not commit agent metadata or internal reasoning folders.
2. Do not commit `release.keystore`, `.env` files, or plain-text secrets.
3. Keep temporary research or automation output out of production pushes unless intentionally needed.

## Native Asset and Version Sync

This repo commits the native Android project, so release metadata must stay in sync.

Before tagging a release:

1. Update `package.json` version and `androidVersionCode`.
2. Confirm `app.config.js` reflects the same values.
3. Confirm `android/app/build.gradle` reads version info from `package.json`.
4. Build the correct flavor:
   - `npm run build:android:direct`
   - `npm run build:android:fdroid`
5. Commit the config and native changes together.

Important:
- Do not rely on `expo prebuild` as the normal release path for this repo.
- F-Droid-specific behavior lives in flavor manifests under `android/app/src/direct/` and `android/app/src/fdroid/`.
