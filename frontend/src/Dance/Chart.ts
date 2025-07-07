import type { Lane } from "./Lane";
import EventEmitter from 'eventemitter3';
import logger from "../Logger";
import { metronome } from "../Metronome";

export interface Note {
    beat: number;
    subbeat: number;
    lane: Lane;
}

export interface ChartObject {
    bpm: number;
    notes: Note[];
    songUrl: string;
    offset: number;
}

export class Chart extends EventEmitter {
    bpm: number;
    notes: Note[] = [];
    songUrl: string = "";
    offset: number = 0;

    constructor() {
        super();
        this.bpm = metronome.bpm;
    }

    load(chart: ChartObject) {
        this.bpm = chart.bpm;
        this.notes = chart.notes;
        this.songUrl = chart.songUrl;
        this.offset = chart.offset;
        this.emit("loaded", chart);
    }

    async loadFromFile(file: File): Promise<void> {
        try {
            const text = await file.text();
            const chartObject: ChartObject = JSON.parse(text);
            this.load(chartObject);
            logger.debug(`Chart loaded from file: ${file.name}`);
        } catch (error) {
            throw new Error("Invalid or unreadable JSON chart file.");
        }
    }

    loadFromLocalStorage(): void {
        const chartString = localStorage.getItem("dancetopia-chart");
        if (chartString) {
            try {
                const chartObject: ChartObject = JSON.parse(chartString);
                this.load(chartObject);
                logger.debug("Chart loaded from local storage.");
            } catch (error) {
                throw new Error("Invalid chart data in local storage.");
            }
        } else {
            throw new Error("No chart data found in local storage.");
        }
    }

    get jsonString(): string {
        const chartObject: ChartObject = {
            bpm: this.bpm,
            notes: this.notes,
            songUrl: this.songUrl,
            offset: this.offset
        };
        return JSON.stringify(chartObject, null, 2);

    }

    saveToLocalStorage(): void {
        try {
            localStorage.setItem("dancetopia-chart", this.jsonString);
            logger.debug("Chart saved to local storage.");
        } catch (error) {
            throw new Error("Failed to save chart to local storage.");
        }
    }

    saveToFile(): File {
        const blob = new Blob([this.jsonString], { type: 'application/json' });
        let file = new File([blob], "chart.json", { type: 'application/json' });
        return file;
    }
}