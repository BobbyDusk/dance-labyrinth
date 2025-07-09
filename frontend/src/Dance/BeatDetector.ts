import { guess } from 'web-audio-beat-detector';
import logger from '../Logger';

export class BeatDetector {
    audioContext: AudioContext = new AudioContext();
    audioBuffer: AudioBuffer | null = null;
    bpm: number = 0;
    offset: number = 0;

    async loadFile(file: File): Promise<{ bpm: number; offset: number } | null> {
        logger.debug(`Detecting beat from file: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        try {
            let result = await guess(this.audioBuffer);
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