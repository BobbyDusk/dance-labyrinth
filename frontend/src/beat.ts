import logger from "./logger";
import { StaticObservable } from "./genericClasses";

export interface BeatUpdate {
    beat: number;
    subbeat: number;
}

export class Beat extends StaticObservable {
    static NUM_SUBBEATS = 64;
    private static interval: ReturnType<typeof setInterval>; 


    static bpm = 0;
    static beat = 0;
    static subbeat = 0;

    private constructor() {
        super();
    }

    static start() {
        logger.debug("Starting Beat.")
        Beat.notify({ beat: Beat.beat, subbeat: Beat.subbeat });
        Beat.interval = setInterval(() => {
            Beat.updateBeat();
        }, Beat.msBetweenSubbeats);
    }

    static stop() {
        logger.debug("Stopping Beat.")
        if (Beat.interval) {
            clearInterval(Beat.interval);
        }
    }

    static reset() {
        Beat.stop();
        logger.debug("Resetting Beat.")
        Beat.beat = 0
        Beat.subbeat = 0
   }

    static get msBetweenSubbeats(): number {
        return (60 * 1000) / (Beat.bpm * Beat.NUM_SUBBEATS);
    }

    static get msBetweenBeats(): number {
        return (60 * 1000) / Beat.bpm;
    }

    static get time(): number {
        return Beat.beatToMs(Beat.beat, Beat.subbeat);
    }

    static msToBeat(time: number): { beat: number, subbeat: number } {
        let timeInSeconds = time / 1000
        let timeInMinutes = timeInSeconds / 60
        let localBeat = Math.floor(timeInMinutes * Beat.bpm)
        let localSubbeat = Math.floor(((timeInMinutes * Beat.bpm) - localBeat) * Beat.NUM_SUBBEATS)
        return { beat: localBeat, subbeat: localSubbeat }
    }

    static beatToMs(beat: number, subbeat: number): number {
        let timeInMinutes = beat / Beat.bpm + subbeat / (Beat.bpm * Beat.NUM_SUBBEATS)
        let timeInSeconds = timeInMinutes * 60
        let time = timeInSeconds * 1000
        return time
    }

    static updateBeat() {
        Beat.subbeat++
        let previousBeat = Beat.beat;
        if (Beat.subbeat >= Beat.NUM_SUBBEATS) {
            Beat.subbeat = 0;
            Beat.beat++;
        }
        Beat.notify({ beat: Beat.beat, subbeat: Beat.subbeat });
        if (previousBeat !== Beat.beat) {
            if (Beat.beat % 2 === 0) {
                logger.debug("Beat tik")
            } else {
                logger.debug("Beat tok")
            }
        }
    }
}