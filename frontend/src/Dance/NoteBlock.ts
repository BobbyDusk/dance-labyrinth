import { Graphics } from "pixi.js";
import type { Note } from "./Chart";
import type { Lane } from "./Lane";
import { LANE_COLORS } from "./LaneColors";


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

    static createGraphic(lane: Lane, onlyOutline = false): Graphics {
        let color = LANE_COLORS[lane];
        let rect = new Graphics()
        let width = 150;
        let height = 25;
        if (onlyOutline) {
            rect.setStrokeStyle({width: 3, color: 0xFFFFFF, alpha: 0.5})
                .moveTo(0, 0)
                .lineTo(width, 0)
                .moveTo(0, height)
                .lineTo(width, height)
                .stroke();
        } else {
            rect.setFillStyle({color: 0xFFFFFF}).rect(0, 0, width, height).fill()
        }
        rect.tint = color;
        rect.pivot.set(width / 2, height / 2);
        rect.cullable = true;
        return rect;
    }

}
