import logger from '../Logger';
import { danceManager } from './DanceManager';
import { metronome } from '../Metronome';
import { danceTrack } from './DanceTrack';

// NOTE: the visualization requires multiple canvases because of the max width of a canvas.
export class AudioVisualizer {
    private audioBuffer: AudioBuffer | null = null;
    private waveformData: { max: number; min: number }[] = [];

    static CANVAS_LENGTH = 1000;

    // spectrogramCanvas: HTMLCanvasElement = document.createElement('canvas');
    waveformContainer: HTMLDivElement = document.createElement('div');
    waveformCanvases: HTMLCanvasElement[] = [];

    constructor() {
        this.setupCanvas();
    }


    private setupCanvas() {
        this.waveformContainer.id = 'waveformContainer';
        this.waveformContainer.style.width = "0px";
        this.waveformContainer.style.height = '0px';
        this.waveformContainer.style.overflow = 'hidden';
        this.waveformContainer.style.backgroundColor = 'black';
        document.body.appendChild(this.waveformContainer);

        //this.spectrogramCanvas.id = 'spectrogram';
        //document.body.appendChild(this.spectrogramCanvas);
    }

    private getVisualizationLength(): number {
        if (!this.audioBuffer) {
            logger.error("Audio buffer is not loaded.");
            return 0;
        }
        let numberOfBeatsInSong = (this.audioBuffer.duration / 60) * metronome.bpm;
        return numberOfBeatsInSong * danceTrack.distanceBetweenBeats
    }

    private createVisualizations() {
        logger.debug("Creating audio visualizations...");

        if (!this.audioBuffer) {
            logger.error("Audio buffer is not loaded.");
            return;
        }

        for (const canvas of this.waveformCanvases) {
            canvas.remove();
        }
        this.waveformContainer.innerHTML = '';
        this.waveformCanvases = [];
        this.waveformData = [];

        let numberOfCanvases = Math.ceil(this.getVisualizationLength() / AudioVisualizer.CANVAS_LENGTH);
        for (let i = 0; i < numberOfCanvases; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = danceTrack.app.canvas.width;
            canvas.height = AudioVisualizer.CANVAS_LENGTH;
            this.waveformContainer.appendChild(canvas);
            this.waveformCanvases.push(canvas);
        }

        const channelData = this.audioBuffer.getChannelData(0);
        const samplesPerPixel = channelData.length / this.getVisualizationLength();
        for (let j = 0; j < channelData.length; j += samplesPerPixel) {
            let startIndex = Math.floor(j);
            let endIndex = Math.floor(j + samplesPerPixel);
            const sample = channelData.slice(startIndex, endIndex);
            const maxSample = Math.max(...sample);
            const minSample = Math.min(...sample);
            this.waveformData.push({ max: maxSample, min: minSample });
        }

        const scaleX = (amplitude: number) => {
            return danceTrack.app.canvas.width / 2 - (amplitude * danceTrack.app.canvas.width) / 2;
        }

        for (let i = 0; i < this.waveformCanvases.length; i++) {
            const canvas = this.waveformCanvases[i];
            const ctx = canvas.getContext('2d')!;
            ctx.beginPath();

            // Loop forwards, drawing the upper half of the waveform
            for (let y = i * AudioVisualizer.CANVAS_LENGTH; y < (i + 1) * AudioVisualizer.CANVAS_LENGTH && y < this.waveformData.length; y++) {
                const val = this.waveformData[y].max;
                ctx.lineTo(scaleX(val) + 0.5, (y % AudioVisualizer.CANVAS_LENGTH) + 0.5);
            }

            // Loop backwards, drawing the lower half of the waveform
            for (let y = Math.min((i + 1) * AudioVisualizer.CANVAS_LENGTH - 1, this.waveformData.length - 1); y >= i * AudioVisualizer.CANVAS_LENGTH && y >= 0; y--) {
                const val = this.waveformData[y].min;
                ctx.lineTo(scaleX(val) + 0.5, (y % AudioVisualizer.CANVAS_LENGTH) + 0.5);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
        logger.debug(`Should be: ${this.getVisualizationLength()}`);
        logger.debug(`Is: ${this.waveformData.length}`);
    }

    async load(audioBuffer: AudioBuffer) {
        this.audioBuffer = audioBuffer;
        this.createVisualizations();
    }
}

export const audioVisualizer = new AudioVisualizer();