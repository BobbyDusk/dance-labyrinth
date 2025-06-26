import { Arrow } from "./Arrow";
import logger from "../logger";
import { DanceTrack } from "./danceTrack";
import { Direction } from "./Direction";
import { Beat } from "../beat";
import type { BeatUpdate } from "../beat";
import { Signature } from "./Signature";
import type { SignatureObject, Note } from "./Signature";
import signatureObject from "../assets/signature.json"
import { Audio } from "./Audio"

enum PressQuality {
    Perfect = "Perfect",
    Great = "Great",
    Good = "Good",
    Ok = "Ok",
    Miss = "Miss",
}


export class DanceManager {
    private static instance: DanceManager = new DanceManager();

    static TIME_OFFSET_PERFECT = 50
    static TIME_OFFSET_GREAT = 100
    static TIME_OFFSET_GOOD = 200
    static TIME_OFFSET_OK = 400

    static signature: Signature = new Signature();
    static arrowIndex = 0


    private constructor() {}

    static async setup() {
        DanceManager.signature.load(signatureObject as SignatureObject);
        await DanceTrack.setup();
        DanceTrack.setArrows(DanceManager.signature.notes.map(note => new Arrow(note)));
        Beat.bpm = DanceManager.signature.bpm;
        Beat.subscribe(DanceManager.updateOnBeat);
    }

    static start() {
        DanceManager.arrowIndex = 0
        DanceTrack.arrows.forEach(arrow => {
            arrow.sprite.visible = true;
        });
        Audio.stop();
        Beat.reset();
        Audio.playSong(DanceManager.signature.songUrl, DanceManager.signature.bpm, DanceTrack.BEATS_VISIBLE);
    }

    static press(direction: Direction) {
        logger.info(`Pressed ${Direction[direction]}`)
        DanceTrack.lightUpColumn(direction)
        this.updateArrowIndex({beat: Beat.beat, subbeat: Beat.subbeat});
        let {pressQuality, arrow} = this.checkArrowHit(direction, Beat.beat, Beat.subbeat);
        if (arrow) {
            arrow.sprite.visible = false;
            // DanceTrack.showPressFeedback(pressQuality, direction);
            logger.info(`Hit ${arrow.toString()} with quality ${pressQuality}`);
        } else {
            // DanceTrack.showPressFeedback(PressQuality.Miss, direction);
            logger.info(`Missed press in direction ${Direction[direction]}`);
        }

        /*
        let pressTime = Date.now() - Beat.startTime
        let smallestTimeDifference = Infinity
        let indexArrow = -1
        for (let i = 0; i < DanceManager.arrowsQueue.length; i++) {
            let arrow = DanceManager.arrowsQueue[i]
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
        if (indexArrow != -1 && smallestTimeDifference < DanceManager.timeOffsetOk) {
            let arrow = DanceManager.arrowsQueue[indexArrow]
            arrow.destruct()
            DanceManager.arrowsQueue.splice(indexArrow, 1)
            if (smallestTimeDifference < DanceManager.timeOffsetPerfect) { DanceManager.showPressFeedback(PressQuality.Perfect)
            } else if (smallestTimeDifference < DanceManager.timeOffsetGreat) {
                DanceManager.showPressFeedback(PressQuality.Great)
            } else if (smallestTimeDifference < DanceManager.timeOffsetGood) {
                DanceManager.showPressFeedback(PressQuality.Good)
            } else {
                DanceManager.showPressFeedback(PressQuality.Ok)
            }
            logger.info(`Hit ${arrow.toString()}`)
        }
            */
    }

    private static updateArrowIndex({ beat, subbeat }: BeatUpdate) {
        let minimumTime = Beat.beatToMs(beat, subbeat) - DanceManager.TIME_OFFSET_OK;
        while (true && DanceManager.arrowIndex < DanceTrack.arrows.length) {
            let arrow = DanceTrack.arrows[DanceManager.arrowIndex];
            if (Beat.beatToMs(arrow.beat, arrow.subbeat) < minimumTime) {
                DanceManager.arrowIndex++;
            } else {
                break;
            }
        }
    }

    private static checkArrowHit(direction: Direction, beat: number, subbeat: number): {pressQuality: PressQuality, arrow: Arrow | null} {
        let index = DanceManager.arrowIndex;
        let pressTime = Date.now() - Beat.startTime;
        while(true) {
            if (index >= DanceTrack.arrows.length) {
                return {pressQuality: PressQuality.Miss, arrow: null};
            }
            let arrow = DanceTrack.arrows[index];
            if (arrow.direction == direction && arrow.sprite.visible) {
                let timeArrow = Beat.beatToMs(arrow.beat, arrow.subbeat);
                logger.debug(`Checking arrow: ${arrow.toString()} at time ${timeArrow}ms, press time: ${pressTime}ms`);
                if (Math.abs(pressTime - timeArrow) < DanceManager.TIME_OFFSET_PERFECT) {
                    return {pressQuality: PressQuality.Perfect, arrow};
                } else if (Math.abs(pressTime - timeArrow) < DanceManager.TIME_OFFSET_GREAT) {
                    return {pressQuality: PressQuality.Great, arrow};
                } else if (Math.abs(pressTime - timeArrow) < DanceManager.TIME_OFFSET_GOOD) {
                    return {pressQuality: PressQuality.Good, arrow};
                } else if (Math.abs(pressTime - timeArrow) < DanceManager.TIME_OFFSET_OK) {
                    return {pressQuality: PressQuality.Ok, arrow};
                }
            }
            index++;
        }
    }


    private static updateOnBeat(update: BeatUpdate) {
        DanceTrack.update(update);
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




