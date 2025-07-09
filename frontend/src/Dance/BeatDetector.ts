import { guess } from 'web-audio-beat-detector';
import logger from '../Logger';

export class BeatDetector {
    bpm: number = 0;
    offset: number = 0;

    async load(audioBuffer: AudioBuffer): Promise<{ bpm: number; offset: number } | null> {
        logger.debug(`Detecting beat from audio buffer`);
        try {
            let result = await guess(audioBuffer);
            this.bpm = result.bpm;
            this.offset = result.offset;
            logger.debug(`Detected BPM: ${this.bpm}, Offset: ${this.offset}`);
            return { bpm: this.bpm, offset: this.offset };
        } catch (error) {
            logger.error(`Could not detect beat`);
            return null;
        }
    }
}

export const beatDetector = new BeatDetector();