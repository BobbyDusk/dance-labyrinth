import { Application, Assets, Graphics, Sprite, Ticker, BitmapText, TextStyle, type TextStyleOptions, Color } from 'pixi.js';

let pressFeedbackText: BitmapText | null = null
let lastTimeoutId: number | null = null
function showPressFeedback(quality: PressQuality) {
    global.app.stage.removeChild(pressFeedbackText!)
    let color;
    switch (quality) {
        case PressQuality.Perfect:
            color = "#28FA34"
            break;
        case PressQuality.Great:
            color = "#80FA3E"
            break;
        case PressQuality.Good:
            color = "#CEFA3F"
            break;
        default:
            color = "#FAF03E"
            break;
    }
    let text = new BitmapText({
        text: quality,
        style: {
            fontSize: 100,
            fill: color,
        }
    })
    global.app.stage.addChild(text)
    text.x = global.app.screen.width / 2
    text.y = 8 * global.app.screen.height / 10
    text.anchor.set(0.5);
    pressFeedbackText = text
    clearTimeout(lastTimeoutId!)
    lastTimeoutId = setTimeout(() => {
        global.app.stage.removeChild(text)
        pressFeedbackText = null
    }, 1000)
}