import WaveSurfer from 'wavesurfer.js'
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
import logger from '../Logger';

class AudioVisualizer {
    private wavesurfer: WaveSurfer;
    private container!: HTMLElement;
    private spectrogramContainer!: HTMLElement;
    private waveformContainer!: HTMLElement;

    constructor() {
        this.setupContainers();

        this.wavesurfer = WaveSurfer.create({
            container: this.waveformContainer,
            interact: false,

        });

        // Initialize the Spectrogram plugin
        this.wavesurfer.registerPlugin(
            Spectrogram.create({
                container: this.spectrogramContainer,
                labels: false,
                height: 200,
                splitChannels: false,
                scale: 'mel', // or 'linear', 'logarithmic', 'bark', 'erb'
                frequencyMax: 8000,
                frequencyMin: 0,
                fftSamples: 1024,
                labelsBackground: 'rgba(0, 0, 0, 0.1)',
            }),
        )
    }

    private setupContainers() {
        this.container = document.createElement('div');
        this.container.id = 'audio-visualizer';
        document.body.appendChild(this.container);

        this.waveformContainer = document.createElement('div');
        this.waveformContainer.id = 'waveform';
        this.container.appendChild(this.waveformContainer);

        this.spectrogramContainer = document.createElement('div');
        this.spectrogramContainer.id = 'spectrogram';
        this.container.appendChild(this.spectrogramContainer);
    }

    loadUrl(url: string) {
        this.wavesurfer.load(url);
    }

    loadBlob(blob: Blob) {
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