import { Application, Assets, Graphics, Sprite, Ticker, BitmapText, TextStyle, type TextStyleOptions } from 'pixi.js';
import song from './assets/song.json' assert { type: 'json' };

export enum Direction
{
    Left = 0,
    Down = 1,
    Up = 2,
    Right = 3
}

export let app = new Application();

let beatsVisible = 5;
let numSubbeats = 16

export async function setup(container: HTMLElement) {
    await app.init({width: 600, height: 1000 });
    container.appendChild(app.canvas);

    const arrows = await Promise.all([
        createArrow(Direction.Left),
        createArrow(Direction.Down),
        createArrow(Direction.Up),
        createArrow(Direction.Right),
    ])

    arrows.forEach((arrow, index) => {
        arrow.x = app.screen.width / 8 * (index * 2 + 1);
        arrow.y = 100;
        app.stage.addChild(arrow);
    })

    await createLines();
    setupInfo();

    // Listen for animate update
    app.ticker.add(loop);
};

async function createLines() {
    let graphics = new Graphics()
    let margin = 50;
    for (let i = 0; i < beatsVisible; i++) {
        let height = margin + (app.screen.height - 2 * margin) / beatsVisible * i
        graphics
            .moveTo(0, height)
            .lineTo(app.screen.width, height)
            .stroke({ color: "white", pixelLine: true });
        for (let j = 1; j < numSubbeats; j++) {
            let height = margin + (app.screen.height - 2 * margin) / beatsVisible * (i + j / numSubbeats)
            graphics
                .moveTo(0, height)
                .lineTo(app.screen.width, height)
                .stroke({ color: "gray", pixelLine: true });
        }
    }
    app.stage.addChild(graphics);
}

async function createArrow(arrowDirection: Direction): Promise<Sprite> {
    let texture
    switch (arrowDirection) {
        case Direction.Up:
            texture = await Assets.load('/arrow-up.png');
            break;
        case Direction.Right:
            texture = await Assets.load('/arrow-right.png');
            break;
        case Direction.Down:
            texture = await Assets.load('/arrow-down.png');
            break;
        case Direction.Left:
            texture = await Assets.load('/arrow-left.png');
            break;
    }

    let arrow = new Sprite(texture);
    arrow.scale = 0.25
    arrow.anchor.set(0.5);

    return arrow
}

function getxPosition(arrowDirection: Direction): number {
    return app.screen.width / 8 * (arrowDirection * 2 + 1);
}

interface Arrow {
    sprite: Sprite,
    direction: Direction
}


let queue: Arrow[] = []
let bpm = 120
let time = 0
let beat = 0
let subbeat = 0
let timePassedSinceLastArrow = 0
let timeBetweenArrows = 60 * 1000 / bpm
// advance arrows every 1/16 of a beat
async function loop(ticker: Ticker) {
    updateTime(ticker)

    timePassedSinceLastArrow += ticker.deltaMS

    // add arrows
    if (timePassedSinceLastArrow > timeBetweenArrows)
    {
        timePassedSinceLastArrow = timePassedSinceLastArrow - timeBetweenArrows
        let randomDirection = Math.floor(Math.random() * 4)
        let arrowSprite = await createArrow(randomDirection)
        arrowSprite.x = getxPosition(randomDirection)
        arrowSprite.y = app.screen.height
        app.stage.addChild(arrowSprite)
        queue.push({ sprite: arrowSprite, direction: randomDirection })
    }

    // move arrows
    queue.forEach((arrow: Arrow) => {
        arrow.sprite.y -= 10 * ticker.deltaTime
        if (arrow.sprite.y < -50) {
            arrow.sprite.destroy()
            queue.shift()
        }
    })

    updateInfo(ticker);
}

function updateTime(ticker: Ticker) {
    time += ticker.deltaMS
    let timeInSeconds = time / 1000
    let timeInMinutes = timeInSeconds / 60
    beat = Math.floor(timeInMinutes * bpm) - 5
    subbeat = Math.floor(((timeInMinutes * bpm) - beat) * numSubbeats)
}

let fpsText: BitmapText;
let timeText: BitmapText;
let beatText: BitmapText;
let subbeatText: BitmapText;
function setupInfo() {
    const fontStyle: TextStyleOptions = {
        fontSize: 30,
        align: 'left',
        fill: "red",
    }
    fpsText = new BitmapText({
        text: "",
        style: fontStyle,
    });
    beatText = new BitmapText({
        text: "",
        style: fontStyle,
    });
    subbeatText = new BitmapText({
        text: "",
        style: fontStyle,
    });
    timeText = new BitmapText({
        text: "",
        style: fontStyle,
    });

    fpsText.x = 10
    timeText.x = 10
    beatText.x = 10
    subbeatText.x = 10

    fpsText.y = 10
    timeText.y = 40
    beatText.y = 70
    subbeatText.y = 100

    app.stage.addChild(fpsText)
    app.stage.addChild(timeText)
    app.stage.addChild(beatText)
    app.stage.addChild(subbeatText)
}

let fpsArray: number[] = []
let numberFpsSamples = 100
let fps = 0
function updateFps(ticker: Ticker) {
    fpsArray.push(1000 / ticker.deltaMS)
    if (fpsArray.length > numberFpsSamples) {
        fpsArray.shift()
    }
    fps = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length
}

function updateInfo(ticker: Ticker) {
    updateFps(ticker)
    fpsText.text = Math.round(fps)
    let seconds = time / 1000
    let mintes = Math.floor(seconds / 60)
    let secondsLeft = Math.floor(seconds - mintes * 60)
    let secondsLeftString = `${secondsLeft}`
    if (secondsLeft < 10) {
        secondsLeftString = "0" + secondsLeftString
    }
    let timeString = `${mintes}:${secondsLeftString}`
    timeText.text = timeString
    beatText.text = beat
    let subbeatString = `${subbeat}`
    if (subbeat < 10) {
        subbeatString = "0" + subbeat
    }
    subbeatText.text = subbeatString

}