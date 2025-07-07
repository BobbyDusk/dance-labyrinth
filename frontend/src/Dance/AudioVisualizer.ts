import WaveSurfer from 'wavesurfer.js'
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
import logger from '../Logger';
import { danceManager } from './DanceManager';
import { metronome } from '../Metronome';
import { danceTrack } from './DanceTrack';

export class AudioVisualizer {
    private wavesurfer!: WaveSurfer;
    private container!: HTMLElement;
    private spectrogramContainer!: HTMLElement;
    private waveformContainer!: HTMLElement;

    constructor() {
        this.setupContainers();
    }


    private setupContainers() {
        this.container = document.createElement('div');
        this.container.id = 'audio-visualizer';
        this.container.style.width = "0px";
        this.container.style.height = "0px";
        this.container.style.overflow = "hidden";
        document.body.appendChild(this.container);

        this.waveformContainer = document.createElement('div');
        this.waveformContainer.id = 'waveform';
        this.container.appendChild(this.waveformContainer);

        this.spectrogramContainer = document.createElement('div');
        this.spectrogramContainer.id = 'spectrogram';
        this.container.appendChild(this.spectrogramContainer);
    }

    private getVisualizationLength(): number {
        let songLength = danceManager.song ? danceManager.song.duration() : 0;
        let numberOfBeatsInSong = songLength * (metronome.bpm / 60);
        return numberOfBeatsInSong * danceTrack.distanceBetweenBeats
    }

    private createVisualizations() {
        this.waveformContainer.style.width = `${this.getVisualizationLength()}px`;
        this.spectrogramContainer.style.width = `${this.getVisualizationLength()}px`;

        this.wavesurfer = WaveSurfer.create({
            container: this.waveformContainer,
            interact: false,
            height: danceTrack.app.canvas.width,
            width: this.getVisualizationLength(),
        });

        // Initialize the Spectrogram plugin
        this.wavesurfer.registerPlugin(
            Spectrogram.create({
                container: this.spectrogramContainer,
                labels: false,
                height: danceTrack.app.canvas.width,
                splitChannels: false,
                scale: 'mel', // or 'linear', 'logarithmic', 'bark', 'erb'
                frequencyMax: 8000,
                frequencyMin: 0,
                fftSamples: 256,
                labelsBackground: 'rgba(0, 0, 0, 0.1)',
            }),
        )
    }

    loadUrl(url: string) {
        this.wavesurfer?.destroy();
        this.createVisualizations();
        this.wavesurfer.load(url);
    }

    loadBlob(blob: Blob) {
        this.wavesurfer?.destroy();
        this.createVisualizations();
        this.wavesurfer.loadBlob(blob);
    }

    async loadFile(file: File) {
        let arrayBuffer = await file.arrayBuffer();
        let blob = new Blob([arrayBuffer], { type: file.type });
        this.loadBlob(blob);
    }

    get waveformCanvas(): HTMLCanvasElement {
        return this.wavesurfer.getWrapper().querySelector('canvas') as HTMLCanvasElement;
    }

    get spectrogramCanvas(): HTMLCanvasElement {
        return this.spectrogramContainer.querySelector('canvas') as HTMLCanvasElement;
    }
}

export const audioVisualizer = new AudioVisualizer();