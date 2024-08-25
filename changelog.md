# Change Log

All notable changes to this project will be documented in this file.

<!--
## [Unreleased]

### Added

### Fixed

### Changed

### Removed
-->


## [Unreleased]

### Added

- `trailMultiplier` option to control the length of the trail.

### Changed

- Changed the default colors to black and limegreen

## [1.3.0] - 2024-08-22

### Added

- Getters and setters for `font`, `charSize`, `charRange`, `bg`, `fg`, `fps`, and `densityFactor`
- The ability to smoothly change the values above without restarting the effect
  - Check the demo for a demonstration
- Ability to use multiple character ranges for `charRange` as a list of ranges, for example, [[0x3041, 0x3096], [0x30a1, 0x30f6]]

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