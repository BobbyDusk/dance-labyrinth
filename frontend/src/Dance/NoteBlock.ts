import { Graphics } from "pixi.js";
import type { Note } from "./Chart";
import type { Lane } from "./Lane";
import { LANE_COLORS } from "./LaneColors";
import { Metronome } from "../Metronome";
import type { Beat } from "../Metronome";
import { danceTrack } from "./DanceTrack";
import { metronome } from "../Metronome";
import { danceManager } from "./DanceManager";
import logger from "../Logger";


export class NoteBlock {
    static HEIGHT_IN_SUBBEATS = 8;

    graphics: Graphics
    #beat!: number
    #subbeat!: number
    #lane!: Lane

    constructor({beat, subbeat, lane}: Note) {
        this.graphics = this.createGraphic()
        this.setBeat({beat, subbeat});
        this.lane = lane
    }


    destruct() {
        this.graphics.parent?.removeChild(this.graphics);
        this.graphics.destroy();
    }


    get string(): string {
        return `NoteBlock(beat: ${this.beat}, subbeat: ${this.subbeat}, lane: ${this.lane})`
    }

    get lane(): Lane {
        return this.#lane;
    }

    set lane(value: Lane) {
        if (value < 0 || value > 3) {
            throw new Error(`Invalid lane: ${value}. Must be between 0 and 3.`);
        }
        this.#lane = value;
        this.graphics.tint = LANE_COLORS[value];
        this.graphics.x = danceTrack.laneToX(this.lane);
    }

    get beat(): number {
        return this.#beat;
    }

    get subbeat(): number {
        return this.#subbeat;
    }

    private set beat(value: number) {
        if (value < 0) {
            throw new Error("Beat cannot be negative");
        }
        this.#beat = value;
    }

    private set subbeat(value: number) {
        if (value < 0 || value >= Metronome.NUM_SUBBEATS) {
            throw new Error(`Subbeat must be between 0 and ${Metronome.NUM_SUBBEATS - 1}`);
        }
        this.#subbeat = value;
    }

    setBeat({beat, subbeat}: Beat) {
        this.beat = beat;
        this.subbeat = subbeat;
        this.updatePosition();
    }

    updatePosition() {
        this.graphics.y = danceTrack.beatToY({beat: this.beat, subbeat: this.subbeat});
    }

    private createGraphic(): Graphics {
        let rect = new Graphics()
        let width = danceTrack.app.screen.width / 4;
        rect.setFillStyle({color: 0xFFFFFF}).rect(0, 0, width, NoteBlock.HEIGHT_IN_SUBBEATS * danceTrack.distanceBetweenSubbeats).fill()
        rect.pivot.set(width / 2, NoteBlock.HEIGHT_IN_SUBBEATS * danceTrack.distanceBetweenSubbeats / 2);
        rect.cullable = true;
        rect.eventMode = "static";
        rect.cursor = 'url(delete-cursor.png), pointer';
        rect.interactive = true;
        rect.on("pointertap", (event) => {
            if (!danceTrack.dragging && metronome.stopped) {
                event.stopPropagation();
                danceTrack.removeBlock(this);
            }
        });
        return rect;
    }

}
