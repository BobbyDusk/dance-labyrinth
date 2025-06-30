import logger from "./Logger";
import EventEmitter from 'eventemitter3';

export interface Beat {
    beat: number;
    subbeat: number;
}

export class Metronome extends EventEmitter {
    static NUM_SUBBEATS = 64;
    private interval: ReturnType<typeof setInterval> | null = null;
    stopped = true;

    bpm = 0;
    #beat = 0;
    #subbeat = 0;

    constructor() {
        super();
    }

    get beat(): number {
        return this.#beat;
    }

    get subbeat(): number {
        return this.#subbeat;
    }

    private set beat(value: number) {
        if (value < 0) {
            throw new Error("Beat cannot be negative");
        }
        this.#beat = value;
    }

    private set subbeat(value: number) {
        if (value < 0 || value >= Metronome.NUM_SUBBEATS) {
            throw new Error(`Subbeat must be between 0 and ${Metronome.NUM_SUBBEATS - 1}`);
        }
        this.#subbeat = value;
    }

    setBeat({beat, subbeat}: Beat) {
        let spilledBeats = Math.floor(subbeat / Metronome.NUM_SUBBEATS);
        subbeat = subbeat % Metronome.NUM_SUBBEATS;
        this.beat = beat + spilledBeats;
        this.subbeat = subbeat;
        this.emit("beat", { beat: this.beat, subbeat: this.subbeat } as Beat);
    }

    start() {
        logger.debug("Starting metronome.")
        this.emit("started");
        this.emit("beat", { beat: this.beat, subbeat: this.subbeat } as Beat);
        this.stopped = false;
        this.interval = setInterval(() => {
            this.updateBeat();
        }, this.msBetweenSubbeats);
    }

    stop() {
        logger.debug("Stopping metronome.")
        this.emit("stopped");
        this.stopped = true;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    reset() {
        this.stop();
        logger.debug("Resetting metronome.")
        this.emit("reset");
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

    msToBeat(time: number): Beat {
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
        let newSubbeat = this.subbeat + 1;
        let previousBeat = this.beat;
        if (newSubbeat >= Metronome.NUM_SUBBEATS) {
            this.beat++;
        }
        this.subbeat = newSubbeat % Metronome.NUM_SUBBEATS;
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