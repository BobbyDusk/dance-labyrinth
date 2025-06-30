import type { Lane } from "./Lane";
import EventEmitter from 'eventemitter3';
import logger from "../Logger";

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
        this.bpm = 120;
        this.notes = [];
        this.songUrl = "";
    }

    load(chart: ChartObject) {
        this.bpm = chart.bpm;
        this.notes = chart.notes;
        this.songUrl = chart.songUrl;
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
            songUrl: this.songUrl
        };
        return JSON.stringify(chartObject, null, 2);

    }

    saveToLocalStorage(): void {
        try {
            localStorage.setItem("dancetopia-chart", this.jsonString);
        } catch (error) {
            throw new Error("Failed to save chart to local storage.");
        }
    }

    saveToFile(): File {
        const blob = new Blob([this.jsonString], { type: 'application/json' });
        return new File([blob], "chart.json", { type: 'application/json' });
    }
}