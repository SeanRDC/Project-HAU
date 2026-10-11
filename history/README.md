# History & Handoff

This folder keeps everyone's local setup in sync. It records what was decided and built in each working session, including sessions done with Claude Code, so whoever pulls next (or whichever AI assistant they use) can pick up where the last person stopped.

## What's in here
* `CONTEXT.md` - the current state of the project: decisions, how the code is organised, what is unfinished. **Read this first.** Keep it up to date.
* `sessions/` - one file per working session, oldest to newest. What was asked, what was decided, what was done.

## After You Pull
Do these every time, in order:

1. `git pull`
2. `npm install` (only needed when `package.json` or `package-lock.json` changed, but it is safe to always run)
3. `npm run dev` and open http://localhost:5173 to check the game still runs
4. Read `history/CONTEXT.md`, then the newest file in `history/sessions/`

You need [Node.js](https://nodejs.org) 20 or newer. Nothing else has to be installed.

## Before You Push
1. `npm run check` (type check) and `npm run build` must both pass.
2. Play through the part you changed.
3. Add a session file (see below) and update `CONTEXT.md` if you changed a decision, the folder layout, or the list of unfinished things.
4. Work on a branch and open a pull request. `main` is protected: only the repo owner can push to it directly, and a pull request cannot be merged until the owner (@SeanRDC) has approved it. Pushing new commits after an approval asks for a fresh one.

## Writing a Session File
Name it `sessions/YYYY-MM-DD-short-title.md`. Keep it short:

* **Who** worked, and with which tool if any.
* **What was asked** (the goal, in your own words or the actual prompts).
* **Decisions** made, with the reason. This is the part people need most later.
* **What changed** (areas, systems, files worth knowing about).
* **Left unfinished / known problems.**

Do not paste secrets, passwords, API keys or private messages. This repository is public.

## If You Use Claude Code (or Another AI Assistant)
Start your session by telling it:

> Read `history/CONTEXT.md` and the newest file in `history/sessions/` before doing anything.

That gives it the same context the last console had. At the end, ask it to write the session file and update `CONTEXT.md`.

Things that stay on your own machine and must not be committed (already in `.gitignore`): `node_modules/`, `.claude/`, `.vscode/`, anything in `builds/` except its README.

## Commit Conventions
* Commit under your own name and email.
* Small commits, one feature or fix each, with a short plain message (`lobby: add reception desk`).
* No AI co-author lines in commit messages.
