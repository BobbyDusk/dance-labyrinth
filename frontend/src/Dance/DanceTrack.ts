import { Application, Graphics, Color, Container, Point, FederatedPointerEvent } from 'pixi.js';
import { NoteBlock } from './NoteBlock';
import logger from '../Logger';
import { metronome, Metronome } from '../Metronome';
import type { Beat } from '../Metronome';
import type { Lane } from './Lane';
import { Viewport } from "pixi-viewport";
import { LightLane } from './LightLane';
import { LANE_COLORS } from './LaneColors';
import EventEmitter from 'eventemitter3';

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note
// different colors for the 4 columns

export type SnappingInterval = 1 | 2 | 4 | 8 | 16 | 32 | 64;

export class DanceTrack extends EventEmitter {
    static NUM_BEATS_BEFORE = 5;
    static NUM_BEATS_AFTER = 0.5;
    static NUM_BEATS = DanceTrack.NUM_BEATS_BEFORE + DanceTrack.NUM_BEATS_AFTER;

    #snappingInterval: SnappingInterval = 4;

    app: Application = new Application()
    blocks: NoteBlock[] = [];
    lightLanes: LightLane[] = []

    backgroundContainer: Container = new Container();
    viewport!: Viewport;
    foregroundContainer: Container = new Container();
    blocksContainer: Container = new Container();
    ghostBlock!: NoteBlock;

    distanceBetweenBeats: number = 0;
    distanceBetweenSubbeats: number = 0;

    dragging: boolean = false;

    constructor() {
        super();
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

        metronome.on("started", () => {
            this.ghostBlock.graphics.visible = false;
        })
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
        this.viewport.label = "viewport";
        this.app.stage.addChild(this.viewport);
        this.viewport
            .drag({
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
        this.ghostBlock = new NoteBlock({
            beat: 0,
            subbeat: 0,
            lane: 0,
        });
        this.ghostBlock.graphics.alpha = 0.5;
        this.foregroundContainer.addChild(this.ghostBlock.graphics);
        this.viewport.on("pointermove", (event: FederatedPointerEvent) => {
            this.updateGhostBlock(event);
        });
        this.viewport.on("pointerdown", (event: FederatedPointerEvent) => {
            this.addBlock(event);
        });
    }

    private updateWhileDragging() {
        this.viewport.top = Math.max(0, this.viewport.top);
        metronome.setBeat(this.yToBeat(this.viewport.top, false));
    }

    private updateGhostBlock(event: FederatedPointerEvent) {
            if (!this.dragging && metronome.stopped) {
                this.ghostBlock.graphics.visible = true;
                this.ghostBlock.lane = Math.floor(event.screen.x / (this.app.screen.width / 4)) as Lane;
                this.ghostBlock.setBeat(this.yToBeat(this.screenYToForegroundY(event.screen.y), true));
            } else {
                this.ghostBlock.graphics.visible = false;
            }
    }

    private addBlock(event: FederatedPointerEvent) {
        if (!this.dragging && metronome.stopped) {
            let newBlock = new NoteBlock({
                beat: this.ghostBlock.beat,
                subbeat: this.ghostBlock.subbeat,
                lane: this.ghostBlock.lane,
            })
            let index = this.blocks.findIndex(block => {
                return block.beat * Metronome.NUM_SUBBEATS + block.subbeat >= newBlock.beat * Metronome.NUM_SUBBEATS + newBlock.subbeat
            })
            if (index === -1) {
                index = this.blocks.length;
            }
            this.blocksContainer.addChildAt(newBlock.graphics, index);
            this.blocks.splice(index, 0, newBlock);
            logger.debug(`Added block at beat ${newBlock.beat}, subbeat ${newBlock.subbeat}, lane ${newBlock.lane}`);
        }
    }

    private snapViewportToSubbeat() {
        let { beat, subbeat } = this.yToBeat(this.viewport.top, true);
        this.viewport.top = this.beatToY({ beat, subbeat });
        logger.debug(`snapped to beat: ${beat}, subbeat ${subbeat}`);

        metronome.stop();
        metronome.setBeat({ beat, subbeat });
    }

    private createBlockTargets() {
        let lanes = [0, 1, 2, 3] as Lane[];
        let width = this.app.screen.width / 4;
        lanes.forEach((lane: Lane) => {
            let target = new Graphics()
            target.setStrokeStyle({width: 3, color: 0xFFFFFF, alpha: 0.5})
                .moveTo(0, 0)
                .lineTo(width, 0)
                .moveTo(0, NoteBlock.HEIGHT)
                .lineTo(width, NoteBlock.HEIGHT)
                .stroke();
            target.pivot.set(width / 2, NoteBlock.HEIGHT / 2);
            target.label = `blockTarget-${lane}`;
            target.tint = LANE_COLORS[lane];
            target.y = DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats;
            target.x = this.laneToX(lane);
            this.app.stage.addChild(target);
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

    resetBlocks() {
        logger.debug("Resetting Blocks")
        this.blocks.forEach(block => {
            block.graphics.visible = true;
        });
    }

    resetPosition() {
        logger.debug("Resetting position")
        this.viewport.top = 0;
    }

    lightUpLane(lane: Lane) {
        this.lightLanes[lane].lightUp();
    }

    setBlocks(noteblocks: NoteBlock[]) {
        this.blocksContainer.removeChildren();
        this.blocks = noteblocks;
        this.blocks.forEach((block: NoteBlock) => {
            this.blocksContainer.addChild(block.graphics);
        });
    }

    laneToX(lane: Lane): number {
        return this.app.screen.width / 8 * (lane * 2 + 1);
    }

    private screenYToForegroundY(y: number): number {
        return Math.max(0, this.viewport.top + y - DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats);
    }

    private yToBeat(y: number, snapped = false): Beat {
        let subbeat = Math.round(y / this.distanceBetweenSubbeats);
        if (snapped) {
            subbeat = Math.round(subbeat / this.snappingInterval) * this.snappingInterval;
        }
        let beat = Math.floor(subbeat / Metronome.NUM_SUBBEATS);
        subbeat = subbeat % Metronome.NUM_SUBBEATS;
        return { beat, subbeat };
    }

    beatToY({ beat, subbeat }: Beat): number {
        return beat * this.distanceBetweenBeats + subbeat * this.distanceBetweenSubbeats;
    }

    private alignYToBeat(y: number, snapped = false): number {
        return this.beatToY(this.yToBeat(y, snapped));
    }

    update(beat: Beat) {
        this.viewport.top = this.beatToY(beat);
    }

    get snappingInterval(): SnappingInterval {
        return this.#snappingInterval;
    }

    set snappingInterval(value: SnappingInterval) {
        if (![1, 2, 4, 8, 16, 32, 64].includes(value)) {
            throw new Error(`Invalid snapping interval: ${value}`);
        }
        this.#snappingInterval = value;
        logger.debug(`Snapping interval set to ${this.#snappingInterval}`);
        this.emit("snappingIntervalChanged", this.#snappingInterval);
    }
}

export const danceTrack = new DanceTrack();