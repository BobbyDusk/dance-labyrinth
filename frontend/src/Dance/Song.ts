import logger from "../Logger";
import { Howl } from "howler";
import { metronome, Metronome } from "../Metronome";
import type { Beat } from "../Metronome";

export class Song {
    private howl: Howl | null = null;

    constructor() {
        metronome.on("setBeat", ({beat, subbeat}: Beat) => {
            if (this.howl) {
                const targetTime = metronome.beatToMs(beat, subbeat);
                this.howl.seek(targetTime / 1000);
            } else {
                logger.error("No audio loaded to seek.");
            }
        });
    }

    load(url: string): void {
        logger.debug(`Loading song`);
        this.howl = new Howl({
            src: [url],
            autoplay: false,
        });
    }

    play(): void {
        if (this.howl) {
            logger.debug("Playing song");
            this.howl.play();
        } else {
            logger.error("No audio loaded to play.");
        }
    }

    pause(): void {
        if (this.howl) {
            logger.debug("Pausing song");
            this.howl.pause();
        } else {
            logger.error("No audio loaded to pause.");
        }
    }

    stop(): void {
        if (this.howl) {
            logger.debug("Stopping song");
            this.howl.stop();
        } else {
            logger.error("No audio loaded to stop.");
        }
    }

    get duration(): number {
        if (this.howl) {
            return this.howl.duration();
        } else {
            logger.error("No audio loaded to get duration.");
            return 0;
        }
    }
}

export const song = new Song();