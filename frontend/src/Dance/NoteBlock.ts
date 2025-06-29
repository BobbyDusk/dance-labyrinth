import { Graphics } from "pixi.js";
import type { Note } from "./Chart";
import type { Lane } from "./Lane";


export class NoteBlock {
    graphics: Graphics
    beat: number
    subbeat: number
    lane: Lane

    constructor({beat, subbeat, lane}: Note) {
        this.beat = beat
        this.subbeat = subbeat
        this.lane = lane
        this.graphics = NoteBlock.createGraphic(lane)
    }


    destruct() {
        this.graphics.parent?.removeChild(this.graphics);
        this.graphics.destroy();
    }


    get string(): string {
        return `NoteBlock(beat: ${this.beat}, subbeat: ${this.subbeat}, lane: ${this.lane})`
    }

    static createGraphic(lane: Lane, hollow = false): Graphics {
        let color;
        switch (lane) {
            case 0:
                color = hollow ? 0x7B681E : 0xFAD54B;
                break;
            case 1:
                color = hollow ? 0x1C7336 : 0x4AF97E;
                break;
            case 2:
                color = hollow ? 0x2831A4 : 0x4B58FA;
                break;
            case 3:
                color = hollow ? 0x731D1C : 0xFA4D4B;
                break;
        }


        let rect = new Graphics()
        let width = 150;
        let height = 25;
        if (hollow) {
            rect.setStrokeStyle({width: 3, color: color})
                .moveTo(0, 0)
                .lineTo(width, 0)
                .moveTo(0, height)
                .lineTo(width, height)
                .stroke();
        } else {
            rect.setFillStyle({color: color}).rect(0, 0, width, height).fill()
        }
        rect.pivot.set(width / 2, height / 2);
        rect.cullable = true;
        return rect;
    }

}
