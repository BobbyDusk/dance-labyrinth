import type { Lane } from "./Lane";
import EventEmitter from 'eventemitter3';

export interface Note {
    beat: number;
    subbeat: number;
    lane: Lane;
}

export interface ChartObject {
    bpm: number;
    notes: Note[];
    songUrl: string;
}

export class Chart extends EventEmitter {
    bpm: number;
    notes: Note[];
    songUrl: string;

    constructor() {
        super();
        this.bpm = 0;
        this.notes = [];
        this.songUrl = "";
    }

    load(chart: ChartObject) {
        this.bpm = chart.bpm;
        this.notes = chart.notes;
        this.songUrl = chart.songUrl;
        this.emit("loaded", chart);
    }

    async loadFile(file: File): Promise<void> {
        try {
            const text = await file.text();
            const chartObject: ChartObject = JSON.parse(text);
            this.load(chartObject);
        } catch (error) {
            throw new Error("Invalid or unreadable JSON chart file.");
        }
    }
}