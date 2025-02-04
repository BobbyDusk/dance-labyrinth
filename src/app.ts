import { Application, Assets, Graphics, Sprite, Ticker, BitmapText, TextStyle, type TextStyleOptions, Color } from 'pixi.js';
import song from './assets/song.json' assert { type: 'json' };
import { global } from './global';
import { createArrowSprite, Direction } from './Arrow';
import preloadAssets from "./assets";
import { Arrow } from './Arrow';
import { setupInput } from "./input"



let beatsVisible = 5;
let numSubbeats = 64;
let marginTop = 100;
let preBeats = 6;
let bpm = 60
let startTime = 0;
setStartTime();
let beat = 0
let subbeat = 0
let noteIndex = 0
let arrowsQueue: Arrow[] = []
let noMoreNotes = false
let songEnded = false
let autoReset = true
let timeOffsetPerfect = 20
let timeOffsetGreat = 50
let timeOffsetGood = 100
let timeOffsetOk = 200

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note
// different colors for the 4 columns
// top arrows should be hollow

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
    setupInput();

    showPressFeedback("perfect")
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
    updateTime()

    // add arrows to queue
    while (!noMoreNotes) {
        let [noteBeat, noteSubbeat, noteDirection] = song.notes[noteIndex]

        // if note is on field, add to queue
        if (noteBeat * 100 + noteSubbeat < (beat + beatsVisible) * 100 + subbeat) {
            let arrow = new Arrow({
                beat: noteBeat,
                subbeat: noteSubbeat,
                direction: noteDirection,
            })
            arrowsQueue.push(arrow)
            console.log(`added arrow: ${arrow.toString()}`)
            noteIndex++
            if (noteIndex == song.notes.length) {
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
        } else {
            break
        }
    }

    // check if song ended
    if (noMoreNotes && arrowsQueue.length == 0) {
        songEnded = true
        console.log("Song ended.")
        if (autoReset) {
            reset()
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

export function press(direction: Direction) {
    let pressTime = Date.now() - startTime
    let smallestTimeDifference = Infinity
    let indexArrow = -1
    for (let i = 0; i < arrowsQueue.length; i++) {
        let arrow = arrowsQueue[i]
        if( arrow.direction == direction) {
            let timeArrow = beatToTime(arrow.beat, arrow.subbeat)
            let timeDifference = Math.abs(pressTime - timeArrow)
            if (timeDifference < smallestTimeDifference) {
                smallestTimeDifference = timeDifference
                indexArrow = i
            } else if (indexArrow != -1) {
                // since the arrows are sorted by time, we can break here
                break
            }
        }
    }
    if (indexArrow != -1 && smallestTimeDifference < timeOffsetOk) {
        let arrow = arrowsQueue[indexArrow]
        arrow.destruct()
        arrowsQueue.splice(indexArrow, 1)
        console.log(`Hit ${arrow.toString()}`)
    }
}



function reset() {
    console.log("Resetting.")
    beat = 0
    subbeat = 0
    setStartTime()
    noMoreNotes = false
    songEnded = false
    arrowsQueue.forEach(arrow => {
        arrow.destruct()
    })
    arrowsQueue = []
    noteIndex = 0
}

function setStartTime() {
    startTime = Date.now() + preBeats * 1000 * 60 / bpm
}

function getTimeSinceStart(): number {
    return Date.now() - startTime
}

function timeToBeat(time: number): { beat: number, subbeat: number } {
    let timeInSeconds = time / 1000
    let timeInMinutes = timeInSeconds / 60
    beat = Math.floor(timeInMinutes * bpm)
    subbeat = Math.floor(((timeInMinutes * bpm) - beat) * numSubbeats)
    return { beat, subbeat }
}

function beatToTime(beat: number, subbeat: number): number {
    let timeInMinutes = beat / bpm + subbeat / (bpm * numSubbeats)
    let timeInSeconds = timeInMinutes * 60
    let time = timeInSeconds * 1000
    return time
}

function updateTime() {
    let time = getTimeSinceStart()
    let computedBeat = timeToBeat(time)
    beat = computedBeat.beat
    subbeat = computedBeat.subbeat
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
    let seconds = getTimeSinceStart() / 1000
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

function lightUpColumn(direction: Direction) {
}

function showPressFeedback(status: "perfect" | "great" | "good" | "ok") {
    let text = new BitmapText({
        text: status,
        style: {
            fontSize: 100,
            fill: "white",
        }
    })
    global.app.stage.addChild(text)
    text.x = global.app.screen.width / 2
    text.y = 8 * global.app.screen.height / 10
    text.anchor.set(0.5);
    setTimeout(() => {
        global.app.stage.removeChild(text)
    }, 1000)
}