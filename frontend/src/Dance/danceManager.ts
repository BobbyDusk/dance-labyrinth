import type { Arrow } from "./Arrow";
import logger from "../logger";
import { DanceTrack } from "./danceTrack";
import { Direction } from "./Direction";
import { Beat } from "../beat";

enum PressQuality {
    Perfect = "Perfect",
    Great = "Great",
    Good = "Good",
    Ok = "Ok",
    Miss = "Miss",
}


export class DanceManager {
    private static instance: DanceManager = new DanceManager();
    static noteIndex = 0
    static arrowsQueue: Arrow[] = []
    static noMoreNotes = false
    static autoReset = true
    static timeOffsetPerfect = 20
    static timeOffsetGreat = 50
    static timeOffsetGood = 100
    static timeOffsetOk = 200


    private constructor() {}

    static async setup(container: HTMLElement) {
        await DanceTrack.setup(container);
    }

    static press(direction: Direction) {
        logger.info(`Pressed ${Direction[direction]}`)
        DanceTrack.lightUpColumn(direction)

        // let pressTime = Date.now() - Beat.startTime
        // let smallestTimeDifference = Infinity
        // let indexArrow = -1
        // for (let i = 0; i < DanceManager.arrowsQueue.length; i++) {
        //     let arrow = DanceManager.arrowsQueue[i]
        //     if( arrow.direction == direction) {
        //         let timeArrow = Beat.beatToMs(arrow.beat, arrow.subbeat)
        //         let timeDifference = Math.abs(pressTime - timeArrow)
        //         if (timeDifference < smallestTimeDifference) {
        //             smallestTimeDifference = timeDifference
        //             indexArrow = i
        //         } else if (indexArrow != -1) {
        //             // since the arrows are sorted by time, we can break here
        //             break
        //         }
        //     }
        // }
        // if (indexArrow != -1 && smallestTimeDifference < DanceManager.timeOffsetOk) {
        //     let arrow = DanceManager.arrowsQueue[indexArrow]
        //     arrow.destruct()
        //     DanceManager.arrowsQueue.splice(indexArrow, 1)
        //     if (smallestTimeDifference < DanceManager.timeOffsetPerfect) {
        //         DanceManager.showPressFeedback(PressQuality.Perfect)
        //     } else if (smallestTimeDifference < DanceManager.timeOffsetGreat) {
        //         DanceManager.showPressFeedback(PressQuality.Great)
        //     } else if (smallestTimeDifference < DanceManager.timeOffsetGood) {
        //         DanceManager.showPressFeedback(PressQuality.Good)
        //     } else {
        //         DanceManager.showPressFeedback(PressQuality.Ok)
        //     }
        //     logger.info(`Hit ${arrow.toString()}`)
        // }
    }

    private static showPressFeedback(quality: PressQuality) {
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





    reset() {
        logger.info("Resetting.")
        noMoreNotes = false
        // songEnded = false
        arrowsQueue.forEach(arrow => {
            arrow.destruct()
        })
        arrowsQueue = []
        noteIndex = 0
    }
    */
}




