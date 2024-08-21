# RainChar - Customizable Matrix-Style Rain Effect

RainChar is an animation effect written in JavaScript to create a Matrix-Style effect
with full control over customizability.

## Usage

Create an instance of the effect (all options are optional)

```javascript
const rain = new RainChar({
    id: 'rain',
    font: 'Consolas',
    parentId: 'effect',
    charSize: [5, 5]
});
```

To start the effect call the `start` method

```javascript
rain.start();
```

## Customization

You can customize the effect however you like with the options provided,
and you can add an `id` to each effect individually to style them with CSS

### Options

| Name            | Description                                     | Type             | Default value    |
|-----------------|-------------------------------------------------|------------------|------------------|
| `font`          | The font used for Rain Characters               | string           | "monospace"      |
| `charSize`      | The lower and upper limit for the font size     | [number, number] | [10, 40]         |
| `charRange`     | The range of unicode character                  | [number, number] | [0x0021, 0x007e] |
| `bg`            | Background color of the canvas                  | string           | "#222"           |
| `fg`            | Color of the characters                         | string           | "yellow"         |
| `id`            | The id to be assigned to the canvas element     | string           |                  |
| `fps`           | Maximum fps (higher means faster rain fall)     | number           | 30               |
| `densityFactor` | How dense the rain fall is (Lower means denser) | number           | 10               |
| `parentId`      | id of the element which canvas is appended to   | string           | body element     |

### Methods

| Name    | Description                                              |
|---------|----------------------------------------------------------|
| `start` | Fresh starts the effect animation . Also acts as restart |
| `stop`  | Stops the effect an clears the canvas.                   |
| `pause` | Pause/Play the animation.                                |

## Changelog

[Changelog](changelog.md)

## ©️ Licence

This project is licensed under the [MIT License](https://opensource.org/license/MIT)

Copyright 2024 [Mohammad Sarabi](https://m-sarabi.ir)

