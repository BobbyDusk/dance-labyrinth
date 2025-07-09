import logger from "../Logger";
import { Howl } from "howler";

export class Song {
    private howl: Howl | null = null;

    constructor() {
    }

    loadURL(url: string): void {
        logger.debug(`Loading song from URL: ${url}`);
        this.howl = new Howl({
            src: [url],
            autoplay: false,
        });
    }

    loadFile(file: File): Promise<void> {
        logger.debug(`Loading song from file: ${file.name}`);
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                this.howl = new Howl({
                    src: [reader.result as string],
                    autoplay: false,
                });
                resolve();
            };
            reader.onerror = () => {
                logger.error(`Error loading file: ${file.name}`);
                reject();
            };
            reader.readAsDataURL(file);
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