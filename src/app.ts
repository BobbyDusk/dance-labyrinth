import { Application, Assets, Graphics, Sprite, Ticker, BitmapText, TextStyle, type TextStyleOptions, Color } from 'pixi.js';
import song from './assets/song.json' assert { type: 'json' };
import { global } from './global';
import { createArrowSprite, Direction } from './Arrow';
import preloadAssets from "./assets";
import { Arrow } from './Arrow';



let beatsVisible = 5;
let numSubbeats = 64;
let marginTop = 100;
let preBeats = 6;
let bpm = 120
let time = getStartTime()
let beat = 0
let subbeat = 0
let index = 0
let arrowsQueue: Arrow[] = []
let noMoreNotes = false
let songEnded = false
let autoReset = true


export async function setup(container: HTMLElement) {
    await global.app.init({ width: 600, height: 1000 });
    await preloadAssets();
    container.appendChild(global.app.canvas);

    await createLines();

    const arrows = [
        createArrowSprite(Direction.Left),
        createArrowSprite(Direction.Down),
        createArrowSprite(Direction.Up),
        createArrowSprite(Direction.Right),
    ]

    arrows.forEach((arrow: Sprite) => {
        arrow.y = 100;
        global.app.stage.addChild(arrow);
    })

    setupInfo();

    // Listen for animate update
    global.app.ticker.add(loop);
};

async function createLines() {
    let graphics = new Graphics()
    for (let i = -1; i < beatsVisible; i++) {
        let height = marginTop + (global.app.screen.height - marginTop) / beatsVisible * i
        graphics
            .moveTo(0, height)
            .lineTo(global.app.screen.width, height)
            .stroke({ color: "white", pixelLine: true });
        for (let j = 1; j < numSubbeats; j++) {
            let height = marginTop + (global.app.screen.height - marginTop) / beatsVisible * (i + j / numSubbeats)
            let lightnessValue = 0.15
            if (j % (numSubbeats / 4) == 0) lightnessValue = 0.3
            if (j == numSubbeats / 2) lightnessValue = 0.5
            let color = new Color([lightnessValue, lightnessValue, lightnessValue])
            graphics
                .moveTo(0, height)
                .lineTo(global.app.screen.width, height)
                .stroke({ color: color, pixelLine: true });
        }
    }
    global.app.stage.addChild(graphics);
}


async function loop(ticker: Ticker) {
    updateTime(ticker)

    // add arrows to queue
    while (!noMoreNotes) {
        let [noteBeat, noteSubbeat, noteDirection] = song.notes[index]

        // if note is on field, add to queue
        if (noteBeat * 100 + noteSubbeat < (beat + beatsVisible) * 100 + subbeat) {
            let arrow = new Arrow({
                beat: noteBeat,
                subbeat: noteSubbeat,
                direction: noteDirection,
            })
            arrowsQueue.push(arrow)
            console.log(`added arrow: ${arrow.toString()}`)
            index++
            if (index == song.notes.length) {
                noMoreNotes = true
                console.log("No more notes to add.")
            }
        } else {
            break
        }
    }

    // remove arrows from queue
    for (let i = 0; i < arrowsQueue.length; i++) {
        let arrow = arrowsQueue[i]
        if (arrow.beat * 100 + arrow.subbeat < (beat - 1) * 100 + subbeat) {
            let removedArrow = arrowsQueue.shift()
            removedArrow?.destruct()
            console.log(`removed arrow: ${removedArrow?.toString()}`)
            if (noMoreNotes && arrowsQueue.length == 0) {
                songEnded = true
                console.log("Song ended.")
                if (autoReset) {
                    reset()
                }
            }
        } else {
            break
        }
    }

    // update placement arrows
    arrowsQueue.forEach(arrow => {
        let distanceBetweenSubbeats = (global.app.screen.height - marginTop) / (beatsVisible * numSubbeats)
        let lineNumber = (arrow.beat - beat) * numSubbeats + (arrow.subbeat - subbeat)
        arrow.sprite.y = marginTop + lineNumber * distanceBetweenSubbeats
    })

    updateInfo(ticker);
}

function getStartTime() {
    return -1 * preBeats * 1000 * 60 / bpm
}

function reset() {
    console.log("Resetting.")
    beat = 0
    subbeat = 0
    time = getStartTime()
    noMoreNotes = false
    songEnded = false
    arrowsQueue.forEach(arrow => {
        arrow.destruct()
    })
    arrowsQueue = []
    index = 0
}

function updateTime(ticker: Ticker) {
    time += ticker.deltaMS
    let timeInSeconds = time / 1000
    let timeInMinutes = timeInSeconds / 60
    beat = Math.floor(timeInMinutes * bpm)
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

    global.app.stage.addChild(fpsText)
    global.app.stage.addChild(timeText)
    global.app.stage.addChild(beatText)
    global.app.stage.addChild(subbeatText)
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
    let timeString = ""
    let seconds = time / 1000
    if (Math.ceil(seconds) <= 0) {
        seconds = Math.ceil(Math.abs(seconds))
        if (seconds < 10) {
            timeString = `-0:0${seconds}`
        } else {
            timeString = `-0:${seconds}`
        }
    } else {
        let mintes = Math.floor(seconds / 60)
        let secondsLeft = Math.floor(seconds - mintes * 60)
        let secondsLeftString = `${secondsLeft}`
        if (secondsLeft < 10) {
            secondsLeftString = "0" + secondsLeftString
        }
        timeString = `${mintes}:${secondsLeftString}`
    }
    timeText.text = timeString
    beatText.text = beat
    let subbeatString = `${subbeat}`
    if (subbeat < 10) {
        subbeatString = "0" + subbeat
    }
    subbeatText.text = subbeatString

}