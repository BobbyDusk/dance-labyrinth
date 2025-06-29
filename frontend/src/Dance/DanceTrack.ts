import { Application, Graphics, Color, Container } from 'pixi.js';
import { NoteBlock } from './NoteBlock';
import logger from '../Logger';
import { Metronome } from '../Metronome';
import type { Beat } from '../Metronome';
import type { Lane } from './Lane';
import { Viewport } from "pixi-viewport";

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note
// different colors for the 4 columns


const COLORS = [
    "#FAD54B",
    "#4AF97E",
    "#4B58FA",
    "#FA4D4B",
]


export class DanceTrack {
    static NUM_BEATS_BEFORE = 5;
    static NUM_BEATS_AFTER = 0.5;
    static NUM_BEATS = DanceTrack.NUM_BEATS_BEFORE + DanceTrack.NUM_BEATS_AFTER;
    static MAX_ALPHA = 0.75;
    static FADE_DURATION = 500;
    static FADE_INTERVAL = 10;
    static SNAP_SUBBEAT_RESOLUTION = 16;

    app: Application = new Application()
    blocks: NoteBlock[] = [];
    lightUpColumns: Graphics[] = []
    lightUpColumnsAlphas: number[] = [0, 0, 0, 0]

    backgroundContainer: Container = new Container();
    viewport!: Viewport;
    foregroundContainer: Container = new Container();
    blocksContainer: Container = new Container();
    distanceBetweenBeats: number = 0;
    distanceBetweenSubbeats: number = 0;

    constructor() {
        this.setup();
    }

    async setup() {
        globalThis.__PIXI_APP__ = this.app; // for PixiJS devtools
        await this.app.init({
            width: 600,
            height: 1000,
            antialias: true,
            autoStart: false,
        });
        this.distanceBetweenBeats = this.app.screen.height / DanceTrack.NUM_BEATS;
        this.distanceBetweenSubbeats = this.distanceBetweenBeats / Metronome.NUM_SUBBEATS;

        this.setupStructure();
        this.createLines();
        this.createBlockTargets();
        this.setupLightUpColumns();
        this.app.render()
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
        }).decelerate();
        this.foregroundContainer.label = "foreground";
        this.foregroundContainer.y = DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats;
        this.viewport.addChild(this.foregroundContainer);
        this.blocksContainer.label = "blocks";
        this.foregroundContainer.addChild(this.blocksContainer);
        this.viewport.on("drag-end", this.snapViewportToSubbeat);
    }

    private snapViewportToSubbeat() {
        let subbeat = -1 * Math.round(this.viewport.y / this.distanceBetweenSubbeats);
        let snappingFactor = Metronome.NUM_SUBBEATS / DanceTrack.SNAP_SUBBEAT_RESOLUTION;
        let snappedSubbeat = Math.round(subbeat / snappingFactor) * snappingFactor;
        this.viewport.snap(0, snappedSubbeat * this.distanceBetweenSubbeats, {topLeft: true, time: 100});
        logger.debug(`snapped to beat: ${Math.floor(snappedSubbeat / Metronome.NUM_SUBBEATS)}, subbeat ${snappedSubbeat % Metronome.NUM_SUBBEATS}`);
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


    private setupLightUpColumns() { 
        let container = new Container();
        container.label = "lightUpColumns";
        this.backgroundContainer.addChild(container);
        for (let i = 0; i < 4; i++) {
            let graphics: Graphics = new Graphics()
            this.lightUpColumns.push(graphics)
            container.addChild(graphics)
            let width = this.app.screen.width / 4
            let height = this.app.screen.height
            setInterval(() => {
                this.lightUpColumnsAlphas[i] = Math.max(0, this.lightUpColumnsAlphas[i] - (this.MAX_ALPHA / (this.FADE_DURATION / this.FADE_INTERVAL)))
                this.lightUpColumns[i].clear()
                this.lightUpColumns[i].rect(i * width, 0, width, height).fill({color: COLORS[i], alpha: this.lightUpColumnsAlphas[i]})
                this.app.render()
            }, 10)
        }
    }

    reset() {
        logger.debug("Resetting DanceTrack")
        this.blocks.forEach(block => {
            block.graphic.visible = true;
        });
        this.viewport.y = 0;
    }

    lightUpLane(lane: Lane) {
        logger.debug(`Light up lane: ${lane}`)
        this.lightUpColumnsAlphas[lane] = DanceTrack.MAX_ALPHA
    }

    setBlocks(noteblocks: NoteBlock[]) {
        this.blocksContainer.removeChildren();
        this.blocks = noteblocks;
        this.blocks.forEach((block: NoteBlock) => {
            this.blocksContainer.addChild(block.graphic);
            block.graphic.y = block.beat * this.distanceBetweenBeats + block.subbeat * this.distanceBetweenSubbeats;
            block.graphic.x = this.laneToX(block.lane);
        });
        this.app.render();

    }

    laneToX(lane: Lane): number {
        return this.app.screen.width / 8 * (lane * 2 + 1);
    }

    update({ beat, subbeat }: Beat) {
        this.viewport.y = -1 * (beat * this.distanceBetweenBeats + subbeat * this.distanceBetweenSubbeats);
        this.app.render();
    }
}

export const danceTrack = new DanceTrack();