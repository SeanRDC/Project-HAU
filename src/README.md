# Source Code & Architecture

This folder contains the core game engine project and source code for Project HAU. 

## The `drafts/` Sandbox
The `src/drafts/` folder is your coding playground. Use this space for:
* Testing out a new movement controller.
* Prototyping a quest dialogue system.
* Trying out experimental engine features.
Code in this folder will not be included in the final game build, so feel free to break things!

## Production Code (`core/`)
Once a system (like the player controller or dialogue manager) is tested and approved, it should be rewritten cleanly and moved into the `src/core/` directory.

## Technical Stack (Pending)
* **Game Engine:** Godot (great for 2D)
* **Primary Language:** [E.g., GDScript, C#, JavaScript]
* **Version Control:** Git

## Future Coding Standards
* Keep scripts modular (e.g., the quest tracker should be completely separate from the player movement script).
* Comment your code heavily, especially around complex quest triggers and UI interactions.