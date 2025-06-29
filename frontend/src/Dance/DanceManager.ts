import { NoteBlock } from "./NoteBlock";
import logger from "../Logger";
import { danceTrack } from "./DanceTrack";
import type { Lane } from "./Lane";
import { metronome } from "../Metronome";
import type { Beat } from "../Metronome";
import { Chart } from "./Chart";
import type { ChartObject } from "./Chart";
import chartObject from "../assets/chart.json"
import { Howl } from "howler";

enum PressQuality {
    Perfect = "Perfect",
    Great = "Great",
    Good = "Good",
    Ok = "Ok",
    Miss = "Miss",
}

export class DanceManager {
    static TIME_OFFSET_PERFECT = 25
    static TIME_OFFSET_GREAT = 50
    static TIME_OFFSET_GOOD = 100
    static TIME_OFFSET_OK = 200

    chart: Chart = new Chart();
    blockIndex = 0
    started: boolean = false;
    paused: boolean = true;
    song: Howl | null = null;

    constructor() {}

    async setup() {
        this.chart.load(chartObject as ChartObject);
        this.song = new Howl({
            src: [this.chart.songUrl],
            autoplay: false,
        });
        await danceTrack.setup();
        danceTrack.setBlocks(this.chart.notes.map(note => new NoteBlock(note)));
        metronome.bpm = this.chart.bpm;
        metronome.on("beat", this.updateOnBeat);
    }

    start() {
        this.started = true;
        this.paused = false;
        this.song!.play();
        metronome.start();
    }

    pause() {
        this.paused = true;
        this.song!.pause();
        metronome.stop();
    }

    reset() {
        this.started = false;
        this.blockIndex = 0
        this.song!.stop();
        danceTrack.reset();
        metronome.reset();
        this.pause();
    }


    press(lane: Lane) {
        logger.info(`Pressed ${lane} at beat ${metronome.beat}, subbeat ${metronome.subbeat}`);
        danceTrack.lightUpLane(lane)
        this.updateBlockIndex({beat: metronome.beat, subbeat: metronome.subbeat});
        let {pressQuality, block} = this.checkBlockHit(lane, metronome.beat, metronome.subbeat);
        if (block) {
            block.graphics.visible = false;
            // danceTrack.showPressFeedback(pressQuality, lane);
            logger.info(`Hit ${block.string} with quality ${pressQuality}`);
        } else {
            // danceTrack.showPressFeedback(PressQuality.Miss, lane);
            logger.info(`Missed press in lane ${lane}`);
        }

        /*
        let pressTime = Date.now() - Beat.startTime
        let smallestTimeDifference = Infinity
        let indexArrow = -1
        for (let i = 0; i < this.arrowsQueue.length; i++) {
            let arrow = this.arrowsQueue[i]
            if( arrow.direction == direction) {
                let timeArrow = Beat.beatToMs(arrow.beat, arrow.subbeat)
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
        if (indexArrow != -1 && smallestTimeDifference < this.timeOffsetOk) {
            let arrow = this.arrowsQueue[indexArrow]
            arrow.destruct()
            this.arrowsQueue.splice(indexArrow, 1)
            if (smallestTimeDifference < this.timeOffsetPerfect) { this.showPressFeedback(PressQuality.Perfect)
            } else if (smallestTimeDifference < this.timeOffsetGreat) {
                this.showPressFeedback(PressQuality.Great)
            } else if (smallestTimeDifference < this.timeOffsetGood) {
                this.showPressFeedback(PressQuality.Good)
            } else {
                this.showPressFeedback(PressQuality.Ok)
            }
            logger.info(`Hit ${arrow.toString()}`)
        }
            */
    }

    private updateBlockIndex({ beat, subbeat }: Beat) {
        let minimumTime = metronome.beatToMs(beat, subbeat) - DanceManager.TIME_OFFSET_OK;
        while (true && this.blockIndex < danceTrack.blocks.length) {
            let block = danceTrack.blocks[this.blockIndex];
            if (metronome.beatToMs(block.beat, block.subbeat) < minimumTime) {
                this.blockIndex++;
            } else {
                break;
            }
        }
    }

    private checkBlockHit(lane: Lane, beat: number, subbeat: number): {pressQuality: PressQuality, block: NoteBlock | null} {
        let index = this.blockIndex;
        let pressTime = metronome.beatToMs(beat, subbeat);
        while(true){
            if (index >= danceTrack.blocks.length) {
                return {pressQuality: PressQuality.Miss, block: null};
            }
            let block = danceTrack.blocks[index];
            if (block.lane == lane && block.graphics.visible) {
                let timeBlock = metronome.beatToMs(block.beat, block.subbeat);
                if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_PERFECT) {
                    return {pressQuality: PressQuality.Perfect, block: block};
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_GREAT) {
                    return {pressQuality: PressQuality.Great, block: block};
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_GOOD) {
                    return {pressQuality: PressQuality.Good, block: block};
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_OK) {
                    return {pressQuality: PressQuality.Ok, block: block};
                }
            }
            index++;
        }
    }


    private updateOnBeat(beat: Beat) {
        danceTrack.update(beat);
    }


    /*
    async loop(ticker: Ticker) {
        // add arrows to queue
        while (!noMoreNotes) {
            let [noteBeat, noteSubbeat, noteDirection] = song.notes[noteIndex]

            // if note is on field, add to queue
            if (noteBeat * 100 + noteSubbeat < (Beat.beat + beatsVisible) * 100 + Beat.subbeat) {
                let arrow = new Arrow({
                    beat: noteBeat,
                    subbeat: noteSubbeat,
                    direction: noteDirection,
                })
                arrowsQueue.push(arrow)
                logger.info(`added arrow: ${arrow.toString()}`)
                noteIndex++
                if (noteIndex == song.notes.length) {
                    noMoreNotes = true
                    logger.info("No more notes to add.")
                }
            } else {
                break
            }
        }

        // remove arrows from queue
        for (let i = 0; i < arrowsQueue.length; i++) {
            let arrow = arrowsQueue[i]
            if (arrow.beat * 100 + arrow.subbeat < (Beat.beat - 1) * 100 + Beat.subbeat) {
                let removedArrow = arrowsQueue.shift()
                removedArrow?.destruct()
                logger.info(`removed arrow: ${removedArrow?.toString()}`)
            } else {
                break
            }
        }

        // check if song ended
        if (noMoreNotes && arrowsQueue.length == 0) {
            // songEnded = true
            logger.info("Song ended.")
            if (autoReset) {
                reset()
            }
        }


        // update placement arrows
        arrowsQueue.forEach(arrow => {
            let distanceBetweenSubbeats = (global.app.screen.height - marginTop) / (beatsVisible * Beat.NUM_SUBBEATS)
            let lineNumber = (arrow.beat - Beat.beat) * Beat.NUM_SUBBEATS + (arrow.subbeat - Beat.subbeat)
            arrow.sprite.y = marginTop + lineNumber * distanceBetweenSubbeats
        })

        updateInfo(ticker);
    }
    */
}

export const danceManager = new DanceManager();