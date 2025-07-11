import { NoteBlock } from "./NoteBlock";
import logger from "../Logger";
import { danceTrack } from "./DanceTrack";
import type { Lane } from "./Lane";
import { metronome } from "../Metronome";
import type { Beat } from "../Metronome";
import { Chart } from "./Chart";
import { beatDetector } from "./BeatDetector";
import { audioVisualizer } from "./AudioVisualizer";
import { song } from "./Song";
import { addSilenceToAudio, audioBufferToBase64Url } from "./audio";

enum PressQuality {
    Perfect = "Perfect",
    Great = "Great",
    Good = "Good",
    Ok = "Ok",
    Miss = "Miss",
}

export class DanceManager {
    static TIME_OFFSET_PERFECT = 25
    static TIME_OFFSET_GREAT = 50
    static TIME_OFFSET_GOOD = 100
    static TIME_OFFSET_OK = 200

    chart: Chart = new Chart();
    blockIndex = 0
    started: boolean = false;
    paused: boolean = true;

    constructor() { }

    async setup() {
        try {
            this.chart.loadFromLocalStorage();
        } catch (error) {
            logger.debug("Failed to load chart from local storage, loading default chart.");
        }
        await danceTrack.setup();
        this.updateFromChart();
        metronome.on("beat", this.updateOnBeat);
    }

    start() {
        this.started = true;
        this.paused = false;
        song.play();
        metronome.start();
    }

    pause() {
        this.paused = true;
        song.pause();
        this.resetBlocks();
        metronome.stop();
    }

    reset() {
        this.started = false;
        song.stop();
        this.resetBlocks();
        danceTrack.resetPosition();
        metronome.reset();
        this.pause();
    }

    resetBlocks() {
        logger.debug("Resetting blocks");
        this.blockIndex = 0;
        danceTrack.resetBlocks();
    }

    createChart() {
        logger.debug("Creating new chart");
        this.chart = new Chart();
        this.updateFromChart();
        this.updateChart();
    }

    done() {
        this.reset();
    }

    press(lane: Lane) {
        logger.info(`Pressed ${lane} at beat ${metronome.beat}, subbeat ${metronome.subbeat}`);
        danceTrack.lightUpLane(lane)
        this.updateBlockIndex({ beat: metronome.beat, subbeat: metronome.subbeat });
        let { pressQuality, block } = this.checkBlockHit(lane, metronome.beat, metronome.subbeat);
        if (block) {
            block.graphics.visible = false;
            // danceTrack.showPressFeedback(pressQuality, lane);
            logger.info(`Hit ${block.string} with quality ${pressQuality}`);
        } else {
            // danceTrack.showPressFeedback(PressQuality.Miss, lane);
            logger.info(`Missed press in lane ${lane}`);
        }
    }

    async loadSong(file: File) {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new AudioContext();
        let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        let detected = await beatDetector.load(audioBuffer);
        if (detected) {
            metronome.bpm = detected.bpm;
            let silenceDuration = metronome.msBetweenBeats / 1000 - detected.offset;
            audioBuffer = addSilenceToAudio(audioBuffer, silenceDuration);
        }
        let audioBase64 = await audioBufferToBase64Url(audioBuffer);
        song.load(audioBase64);
        await audioVisualizer.load(audioBuffer);
        danceTrack.setWaveformBackground();
    }

    private updateBlockIndex({ beat, subbeat }: Beat) {
        let minimumTime = metronome.beatToMs(beat, subbeat) - DanceManager.TIME_OFFSET_OK;
        while (true && this.blockIndex < danceTrack.blocks.length) {
            let block = danceTrack.blocks[this.blockIndex];
            if (metronome.beatToMs(block.beat, block.subbeat) < minimumTime) {
                this.blockIndex++;
            } else {
                break;
            }
        }
    }

    private checkBlockHit(lane: Lane, beat: number, subbeat: number): { pressQuality: PressQuality, block: NoteBlock | null } {
        let index = this.blockIndex;
        let pressTime = metronome.beatToMs(beat, subbeat);
        while (true) {
            if (index >= danceTrack.blocks.length) {
                return { pressQuality: PressQuality.Miss, block: null };
            }
            let block = danceTrack.blocks[index];
            if (block.lane == lane && block.graphics.visible) {
                let timeBlock = metronome.beatToMs(block.beat, block.subbeat);
                if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_PERFECT) {
                    return { pressQuality: PressQuality.Perfect, block: block };
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_GREAT) {
                    return { pressQuality: PressQuality.Great, block: block };
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_GOOD) {
                    return { pressQuality: PressQuality.Good, block: block };
                } else if (Math.abs(pressTime - timeBlock) < DanceManager.TIME_OFFSET_OK) {
                    return { pressQuality: PressQuality.Ok, block: block };
                }
            }
            index++;
        }
    }

    updateFromChart() {
        danceTrack.setBlocks(this.chart.notes.map(note => new NoteBlock(note)));
        metronome.bpm = this.chart.bpm;
    }

    updateChart(): void {
        this.chart.notes = danceTrack.blocks.map(block => ({
            beat: block.beat,
            subbeat: block.subbeat,
            lane: block.lane
        }));
        this.chart.bpm = metronome.bpm;
        this.chart.saveToLocalStorage();
    }

    async loadChart(file: File): Promise<void> {
        await this.chart.loadFromFile(file);
        this.updateFromChart();
        this.chart.saveToLocalStorage();
    }

    saveChart(): File {
        this.updateChart();
        return this.chart.saveToFile();
    }

    private updateOnBeat(beat: Beat) {
        danceTrack.update(beat);
    }
}

export const danceManager = new DanceManager();