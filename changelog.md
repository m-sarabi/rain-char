# Change Log

All notable changes to this project will be documented in this file.

<!--
## [Unreleased]

### Added

### Fixed

### Changed

### Removed
-->

## [2.1.0]

### Changed
-   Improved animation smoothness by implementing an asynchronous, batched process for rendering characters to the font atlas, preventing performance stutters.

## [2.0.0]

### Changed

- **Complete Rewrite**: I have completely rewritten the library for performance and modernization. All the rendering logic is now in a dedicated **Web Worker**.
- **Instantiation**: It now needs an existing `<canvas>` element as the first argument, instead of creating its own.
    - *Before*: `new RainChar({ parentId: 'app' })`
    - *Now*: `new RainChar(document.querySelector('#my-canvas'), { ... })`
- **Configuration Options Renamed and Re-scaled**:
    - `densityFactor` is now `density`. The logic is inverted (corrected): `density` is a 0-1 scale where a *higher* value means more characters (denser).
    - `trailMultiplier` is now `trailDecay`. The name is more descriptive of the fading effect. A smaller value results in a longer, slower-fading trail.
- **Settings Update**: Individual property setters (e.g., `rain.fps = 60`) have been replaced by a single `updateSetting('fps', 60)` method for updating settings.
- **Character Caching**: The caching mechanism is changed from pre-rendering individual characters on separate canvases (`preRender` option) to a **font atlas** (sprite sheet) system and is always active.
- **Build System**: Replaced the old single-file script to a modern ES Module structure using Vite.
- **Package Definition**: `package.json` has been updated to support modern module formats, making it compatible with modern frontend tooling.

### Added

- **Web Worker & `OffscreenCanvas`**: All rendering operations now run in a Web Worker using an `OffscreenCanvas` to prevent blocking the main UI thread and a smoother user experience.
- **`destroy()` Method**: Added a new `destroy()` method to terminate the Web Worker and release associated resources, preventing memory leaks.
- **String-based `charRange`**: The `charRange` option now accepts a simple string of characters (e.g., `'abcd1234'`) in addition to Unicode ranges.
- **JSDoc Type Definitions**: Added `@typedef` definitions for code clarity and autocompletion.

### Fixed

- **Performance**: Significantly improved performance and smoothness, especially with high character densities. The UI should remain fully responsive.
- **Resize Handling**: Resizing the canvas now does not need to create and draw to a temporary canvas.

### Removed

- **Automatic Canvas Creation**: It no longer creates a `<canvas>` element.
- **`id` and `parentId` Options**: The `id` and `parentId` constructor options are removed. Canvas management is now the user's responsibility.
- **`preRender` Option**: The `preRender` option is removed and replaced with a more efficient font atlas caching.
- **Individual Getters/Setters**: Getters and setters for individual properties (e.g., `rain.font`, `rain.fps`) are replaced with the new `updateSetting()` method.

## [1.5.0]

### Added

- `preRender` option to pre render the character that could potentially improve the performance at the cost of slower
  startup

## [1.4.0] - 2024-08-25

### Added

- `trailMultiplier` option to control the length of the trail.
- `charSpacing` option to control the gap between characters.
- `charChangeFreq` option to control the frequency of character change.
  (chance of changing characters in each frame between 0% and 100%)

### Changed

- Changed the default colors to black and limegreen

## [1.3.0] - 2024-08-22

### Added

- Getters and setters for `font`, `charSize`, `charRange`, `bg`, `fg`, `fps`, and `densityFactor`
- The ability to smoothly change the values above without restarting the effect
    - Check the demo for a demonstration
- Ability to use multiple character ranges for `charRange` as a list of ranges, for
  example, [[0x3041, 0x3096], [0x30a1, 0x30f6]]

### Changed

- Character ranges are created during initialization for better performance.

## [1.2.0] - 2024-08-21

### Fixed

- Increased the new particle vertical offset to fix batch falling on first iterations.
    - Most obvious on a big canvas with small character size

## [1.1.0] - 2024-08-21

### Added

- Docstring for `start`, `pause`, and `stop` methods

### Changed

- Improved the class documentation
- Modularized Initialization
- Refined Particle Management
- Grouped Canvas Operations
- Simplified Resize Logic

## [1.0.0] - 2024-08-21

First release