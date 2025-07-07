import { guess } from 'web-audio-beat-detector';

export class BeatDetector {
    audioContext: AudioContext = new AudioContext();
    audioBuffer: AudioBuffer | null = null;
    bpm: number = 0;
    offset: number = 0;

    async loadFile(file: File): Promise<void> {
        const arrayBuffer = await file.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        let result = await guess(this.audioBuffer);
        this.bpm = result.bpm;
        this.offset = result.offset;
    }
}

export const beatDetector = new BeatDetector();