# 2026-10-11 - First playable area (DJN Building)

**Who:** Sean, working with Claude Code (model: Claude Opus 5.5) on his own PC.

This is a write-up of the chat, not a raw export. Sean's prompts are quoted as typed (with his email removed); the assistant's side is summarised.

---

## 1. Asking for suggestions

> Hello claude, what are your suggestions for this project?, I'm inspired by the game "Until Then".

The repo at that point was only READMEs: no engine project, an empty `.gitignore`, placeholder roles. The main points of the reply:

* The README pitched a top-down RPG with fetch quests, which is not what *Until Then* is. Decide between top-down and side-view.
* Borrow the feel rather than the camera: a real story thread, everyday Filipino detail, a phone UI, tiny contextual minigames.
* Scope down to one vertical slice before mapping the whole campus.
* Check with the university about using its name and likeness, and keep staff fictional.

## 2. The brief

> You can do everything I grant you the permission, so here is what we are going to do, you may use all of the skills you must use, download them yourself so you can develop a fantastic game. I want this game to be inspired by until then but not by copying their game, I want it to be a free rome game that heavily lean towards the HOLY ANGEL UNIVERSITY in ANGELES CITY, PHILIPPINES, so look up the internet regarding pictures of that university, I'm not asking you to build the whole gae in one seating, I want a game that I can play that revolves only on one area, maybe lets focus on the university's main building the Don Juan Nepomuceno Building, Use that area first to develop just a simple but beutful until then inspired graphics, wirte everythign the engine and such from the ground up, commit every feature and everything you do step by step on my name SeanRDC - [email], then do not add co authored by claude, make the commits lok natural and developed step by step, you may exhaust all the resources possible, dowload all the necessary skills you need first yourself and put them on gitignore so they dont get commited on the public repository, but before you can do that what do you need form me? you can ask me multiple questions or instruct me to download anything for you so that you have everything laid out before you start building

Four questions were asked back: tech stack, camera view, how to handle GitHub, dialogue language.

## 3. The answers

> Go for your suggestions on item snumber 2 3 4, and for item 1, I would like to use the godot 4 but for now maybe you can go with you r recomendation and when I tested it we can convert it to godot 4, I dont have a lot of pictures but you can look up the internet

**Decisions:**

* Side-view with layered depth.
* Commit locally only until Sean has played it.
* Taglish dialogue.
* Custom web engine now, Godot 4 port after testing.

**What was done:**

* Looked up the campus on Wikipedia and Wikimedia Commons and worked from photos of the main building, the fountain, the Nepomuceno bust, the courtyard and the pavement seal.
* Set up Vite + TypeScript (dev dependencies only) and filled in `.gitignore`.
* Wrote the engine: low-res display buffer, loop, input, camera, time of day, light map, particles, pixel drawing helpers, synth audio.
* Drew everything in code: the DJN facade, props, a character rig with a walk cycle, the sky.
* Built three scenes (plaza, lobby, courtyard) with eight NPCs, dialogue with choices, a phone checklist and a title screen.
* Tested with a headless browser: screenshots at several times of day, and scripted playthroughs with real key presses. No errors; the production build passed.

Mid-way Sean checked on one thing:

> did i mention that do not add co authored by claude?

Confirmed: every commit is authored as SeanRDC with no co-author line.

## 4. Sharing on the local network

> how to local host this on the local internet?

Added an `npm run dev:lan` script (serves on port 5174 to the whole Wi-Fi network). Notes given: allow Node.js through Windows Firewall on private networks, both devices must be on the same Wi-Fi, and the PC's address can change.

## 5. Publishing

> push everything under my name and merge to main, so my contributors can see it

Pushed 27 commits to `main`. There was nothing to merge since the work was already on `main`. GitHub reported that the "changes must be made through a pull request" rule was bypassed, which the owner account is allowed to do.

## 6. This folder

> create a folder named "history" so put all the claude realted chats here and anything that relates to one local development console to another, also add a readme so other local developments will now what to do when they pull so everything is on sycnh, push to main and merge

Created `history/` with a README (what to do after pulling and before pushing), `CONTEXT.md` (current state and decisions) and this file.

---

## Left unfinished
See "Needs Checking by a Human" and "Not Done Yet" in `../CONTEXT.md`. The short version: proofread the dialogue, verify the history facts, listen to the audio, and decide when to start the Godot 4 port.
