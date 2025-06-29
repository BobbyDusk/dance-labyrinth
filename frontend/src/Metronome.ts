import logger from "./Logger";
import EventEmitter from 'eventemitter3';

export interface Beat {
    beat: number;
    subbeat: number;
}

export class Metronome extends EventEmitter {
    static NUM_SUBBEATS = 64;
    private interval: ReturnType<typeof setInterval> | null = null; 

    bpm = 0;
    beat = 0;
    subbeat = 0;

    constructor() {
        super();
    }

    start() {
        logger.debug("Starting metronome.")
        this.emit("beat", { beat: this.beat, subbeat: this.subbeat } as Beat);
        this.interval = setInterval(() => {
            this.updateBeat();
        }, this.msBetweenSubbeats);
    }

    stop() {
        logger.debug("Stopping metronome.")
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    reset() {
        this.stop();
        logger.debug("Resetting metronome.")
        this.beat = 0
        this.subbeat = 0
   }

    get msBetweenSubbeats(): number {
        return (60 * 1000) / (this.bpm * Metronome.NUM_SUBBEATS);
    }

    get msBetweenBeats(): number {
        return (60 * 1000) / this.bpm;
    }

    get time(): number {
        return this.beatToMs(this.beat, this.subbeat);
    }

    msToBeat(time: number): { beat: number, subbeat: number } {
        let timeInSeconds = time / 1000
        let timeInMinutes = timeInSeconds / 60
        let localBeat = Math.floor(timeInMinutes * this.bpm)
        let localSubbeat = Math.floor(((timeInMinutes * this.bpm) - localBeat) * Metronome.NUM_SUBBEATS)
        return { beat: localBeat, subbeat: localSubbeat }
    }

    beatToMs(beat: number, subbeat: number): number {
        let timeInMinutes = beat / this.bpm + subbeat / (this.bpm * Metronome.NUM_SUBBEATS)
        let timeInSeconds = timeInMinutes * 60
        let time = timeInSeconds * 1000
        return time
    }

    updateBeat() {
        this.subbeat++
        let previousBeat = this.beat;
        if (this.subbeat >= Metronome.NUM_SUBBEATS) {
            this.subbeat = 0;
            this.beat++;
        }
        this.emit("beat", { beat: this.beat, subbeat: this.subbeat } as Beat);
        if (previousBeat !== this.beat) {
            if (this.beat % 2 === 0) {
                logger.debug("Metronome tik")
            } else {
                logger.debug("Metronome tok")
            }
        }
    }
}

export const metronome = new Metronome();