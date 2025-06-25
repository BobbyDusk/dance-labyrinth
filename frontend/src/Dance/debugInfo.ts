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
    let seconds = Beat.getTimeSinceStart() / 1000
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
    beatText.text = Beat.beat
    let subbeatString = `${Beat.subbeat}`
    if (Beat.subbeat < 10) {
        subbeatString = "0" + Beat.subbeat
    }
    subbeatText.text = subbeatString
}