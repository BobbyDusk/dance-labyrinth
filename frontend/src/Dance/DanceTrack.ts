import { Application, Graphics, Color, Container } from 'pixi.js';
import { NoteBlock } from './NoteBlock';
import logger from '../Logger';
import { metronome, Metronome } from '../Metronome';
import type { Beat } from '../Metronome';
import type { Lane } from './Lane';
import { Viewport } from "pixi-viewport";
import { LightLane } from './LightLane';

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note
// different colors for the 4 columns




export class DanceTrack {
    static NUM_BEATS_BEFORE = 5;
    static NUM_BEATS_AFTER = 0.5;
    static NUM_BEATS = DanceTrack.NUM_BEATS_BEFORE + DanceTrack.NUM_BEATS_AFTER;
    static SNAP_SUBBEAT_RESOLUTION = 16;
    static LANE_COLORS = [
        "#FAD54B",
        "#4AF97E",
        "#4B58FA",
        "#FA4D4B",
    ]

    app: Application = new Application()
    blocks: NoteBlock[] = [];
    lightLanes: LightLane[] = []

    backgroundContainer: Container = new Container();
    viewport!: Viewport;
    foregroundContainer: Container = new Container();
    blocksContainer: Container = new Container();
    distanceBetweenBeats: number = 0;
    distanceBetweenSubbeats: number = 0;
    dragging: boolean = false;

    constructor() {
    }

    async setup() {
        // @ts-expect-error: Expose app for PixiJS devtools
        globalThis.__PIXI_APP__ = this.app; // for PixiJS devtools
        await this.app.init({
            width: 600,
            height: 1000,
            antialias: true,
            autoStart: true,
        });
        this.distanceBetweenBeats = this.app.screen.height / DanceTrack.NUM_BEATS;
        this.distanceBetweenSubbeats = this.distanceBetweenBeats / Metronome.NUM_SUBBEATS;

        this.setupStructure();
        this.createLines();
        this.createBlockTargets();
        this.setupLightLanes();
    }

    private setupStructure() {
        this.backgroundContainer.label = "background";
        this.app.stage.addChild(this.backgroundContainer);
        this.viewport = new Viewport({
            screenWidth: this.app.screen.width,
            screenHeight: this.app.screen.height,
            worldWidth: this.app.screen.width,
            worldHeight: this.app.screen.height,
            events: this.app.renderer.events,
        });
        this.app.stage.addChild(this.viewport);
        this.viewport.drag({
            direction: "y"
        });
        this.foregroundContainer.label = "foreground";
        this.foregroundContainer.y = DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats;
        this.viewport.addChild(this.foregroundContainer);
        this.blocksContainer.label = "blocks";
        this.foregroundContainer.addChild(this.blocksContainer);
        this.viewport.on("drag-start", () => {
            logger.debug(`viewport drag started`);
            this.dragging = true;
            metronome.stop();
        });
        this.viewport.on("drag-end", () => {
            logger.debug(`viewport drag ended`);
            this.dragging = false;
            this.snapViewportToSubbeat()
        });
        this.viewport.on("moved", () => this.updateWhileDragging());
    }

    private updateWhileDragging() {
        if (this.dragging) {
            let subbeat = -1 * Math.round(this.viewport.y / this.distanceBetweenSubbeats);
            metronome.setBeat(0, subbeat);
        }
    }

    private snapViewportToSubbeat() {
        let subbeat = -1 * Math.round(this.viewport.y / this.distanceBetweenSubbeats);
        let snappingFactor = Metronome.NUM_SUBBEATS / DanceTrack.SNAP_SUBBEAT_RESOLUTION;
        let snappedSubbeat = Math.round(subbeat / snappingFactor) * snappingFactor;
        this.viewport.top = snappedSubbeat * this.distanceBetweenSubbeats;
        logger.debug(`snapped to beat: ${Math.floor(snappedSubbeat / Metronome.NUM_SUBBEATS)}, subbeat ${snappedSubbeat % Metronome.NUM_SUBBEATS}`);

        metronome.stop();
        metronome.setBeat(0, snappedSubbeat);
    }

    private createBlockTargets() {
        let lanes = [0, 1, 2, 3] as Lane[];
        lanes.forEach((lane: Lane) => {
            let sprite = NoteBlock.createGraphic(lane, true);
            sprite.y = DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats;
            sprite.x = this.laneToX(lane);
            this.app.stage.addChild(sprite);
        })
    }

    private createLines() {
        let graphics = new Graphics()
        for (let i = -DanceTrack.NUM_BEATS_AFTER * Metronome.NUM_SUBBEATS + 1; i < DanceTrack.NUM_BEATS_BEFORE * Metronome.NUM_SUBBEATS; i++) {
            let y = DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats + this.distanceBetweenSubbeats * i;
            let lightnessValue;
            if (i % Metronome.NUM_SUBBEATS == 0) {
                lightnessValue = 0.5
            } else if (i % (Metronome.NUM_SUBBEATS / 2) == 0) {
                lightnessValue = 0.3
            } else if (i % (Metronome.NUM_SUBBEATS / 4) == 0) {
                lightnessValue = 0.2
            } else if (i % (Metronome.NUM_SUBBEATS / 4) == 0) {
                lightnessValue = 0.15
            } else {
                lightnessValue = 0.05
            }
            let color = new Color([lightnessValue, lightnessValue, lightnessValue])
            graphics
                .moveTo(0, y)
                .lineTo(this.app.screen.width, y)
                .stroke({ color: color, pixelLine: true });
        }
        graphics.label = "lines";
        this.backgroundContainer.addChild(graphics);
    }


    private setupLightLanes() {
        let container = new Container();
        container.label = "lightLanes";
        this.backgroundContainer.addChild(container);
        for (let i = 0; i < 4; i++) {
            this.lightLanes[i] = new LightLane(i as Lane);
            container.addChild(this.lightLanes[i].graphics);
        }
    }

    reset() {
        logger.debug("Resetting DanceTrack")
        this.blocks.forEach(block => {
            block.graphics.visible = true;
        });
        this.viewport.y = 0;
    }

    lightUpLane(lane: Lane) {
        this.lightLanes[lane].lightUp();
    }

    setBlocks(noteblocks: NoteBlock[]) {
        this.blocksContainer.removeChildren();
        this.blocks = noteblocks;
        this.blocks.forEach((block: NoteBlock) => {
            this.blocksContainer.addChild(block.graphics);
            block.graphics.y = block.beat * this.distanceBetweenBeats + block.subbeat * this.distanceBetweenSubbeats;
            block.graphics.x = this.laneToX(block.lane);
        });
    }

    laneToX(lane: Lane): number {
        return this.app.screen.width / 8 * (lane * 2 + 1);
    }

    update({ beat, subbeat }: Beat) {
        this.viewport.top = beat * this.distanceBetweenBeats + subbeat * this.distanceBetweenSubbeats;
    }
}

export const danceTrack = new DanceTrack();