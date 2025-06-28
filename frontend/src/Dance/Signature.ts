import type { Lane } from "./Lane";
import { Observable } from "../genericClasses";

export interface Note {
    beat: number;
    subbeat: number;
    lane: Lane;
}

export interface SignatureObject {
    bpm: number;
    notes: Note[];
    songUrl: string;
}

export class Signature extends Observable {
    bpm: number;
    notes: Note[];
    songUrl: string;

    constructor() {
        super();
        this.bpm = 120;
        this.notes = [];
        this.songUrl = "";
    }

    load(signature: SignatureObject) {
        this.bpm = signature.bpm;
        this.notes = signature.notes;
        this.songUrl = signature.songUrl;
        this.notify(signature);
    }

    async loadFile(file: File): Promise<void> {
        try {
            const text = await file.text();
            const signatureObject: SignatureObject = JSON.parse(text);
            this.load(signatureObject);
        } catch (error) {
            throw new Error("Invalid or unreadable JSON signature file.");
        }
    }
}