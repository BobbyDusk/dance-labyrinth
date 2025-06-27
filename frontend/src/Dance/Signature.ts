import type { Lane } from "./Lane";

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

export class Signature {
    bpm: number;
    notes: Note[];
    songUrl: string;

    constructor() {
        this.bpm = 120;
        this.notes = [];
        this.songUrl = "";
    }

    load(signature: SignatureObject) {
        this.bpm = signature.bpm;
        this.notes = signature.notes;
        this.songUrl = signature.songUrl;
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