import { Application, Graphics, Sprite, Color, Container } from 'pixi.js';
import { NoteBlock } from './NoteBlock';
import logger from '../logger';
import { Beat } from '../beat';
import type { BeatUpdate } from '../beat';
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
    private static instance: DanceTrack = new DanceTrack();

    static NUM_BEATS_BEFORE = 5;
    static NUM_BEATS_AFTER = 0.5;
    static NUM_BEATS = DanceTrack.NUM_BEATS_BEFORE + DanceTrack.NUM_BEATS_AFTER;
    static MAX_ALPHA = 0.75;
    static FADE_DURATION = 500;
    static FADE_INTERVAL = 10;
    static SNAP_SUBBEAT_RESOLUTION = 16;

    static app: Application = new Application()
    static blocks: NoteBlock[] = [];
    static lightUpColumns: Graphics[] = []
    static lightUpColumnsAlphas: number[] = [0, 0, 0, 0]

    static backgroundContainer: Container = new Container();
    static viewport: Viewport;
    static foregroundContainer: Container = new Container();
    static blocksContainer: Container = new Container();
    static distanceBetweenBeats: number = 0;
    static distanceBetweenSubbeats: number = 0;

    private constructor() {
    }

    static async setup() {
        globalThis.__PIXI_APP__ = DanceTrack.app; // for PixiJS devtools
        await DanceTrack.app.init({ 
            width: 600, 
            height: 1000, 
            antialias: true,
            autoStart: false,
        });
        DanceTrack.distanceBetweenBeats = DanceTrack.app.screen.height / DanceTrack.NUM_BEATS;
        DanceTrack.distanceBetweenSubbeats = DanceTrack.distanceBetweenBeats / Beat.NUM_SUBBEATS;

        DanceTrack.setupStructure();
        DanceTrack.createLines();
        DanceTrack.createBlockTargets();
        DanceTrack.setupLightUpColumns();
        DanceTrack.app.render()
    }

    private static setupStructure() {
        DanceTrack.backgroundContainer.label = "background";
        DanceTrack.app.stage.addChild(DanceTrack.backgroundContainer);
        DanceTrack.viewport = new Viewport({
            screenWidth: DanceTrack.app.screen.width,
            screenHeight: DanceTrack.app.screen.height,
            worldWidth: DanceTrack.app.screen.width,
            worldHeight: DanceTrack.app.screen.height,
            events: DanceTrack.app.renderer.events,
        });
        DanceTrack.app.stage.addChild(DanceTrack.viewport);
        DanceTrack.viewport.drag({
            direction: "y"
        }).decelerate();
        DanceTrack.foregroundContainer.label = "foreground";
        DanceTrack.foregroundContainer.y = DanceTrack.NUM_BEATS_AFTER * DanceTrack.distanceBetweenBeats;
        DanceTrack.viewport.addChild(DanceTrack.foregroundContainer);
        DanceTrack.blocksContainer.label = "blocks";
        DanceTrack.foregroundContainer.addChild(DanceTrack.blocksContainer);
        DanceTrack.viewport.on("drag-end", DanceTrack.snapViewportToSubbeat);
    }

    private static snapViewportToSubbeat() {
        let subbeat = -1 * Math.round(DanceTrack.viewport.y / DanceTrack.distanceBetweenSubbeats);
        let snappingFactor = Beat.NUM_SUBBEATS / DanceTrack.SNAP_SUBBEAT_RESOLUTION;
        let snappedSubbeat = Math.round(subbeat / snappingFactor) * snappingFactor;
        DanceTrack.viewport.snap(0, snappedSubbeat * DanceTrack.distanceBetweenSubbeats, {topLeft: true, time: 100});;
        logger.debug(`snapped to beat: ${Math.floor(snappedSubbeat / Beat.NUM_SUBBEATS)}, subbeat ${snappedSubbeat % Beat.NUM_SUBBEATS}`);
    }

    private static createBlockTargets() {
        let lanes = [0, 1, 2, 3] as Lane[];
        lanes.forEach((lane: Lane) => {
            let sprite = NoteBlock.createGraphic(lane, true);
            sprite.y = DanceTrack.NUM_BEATS_AFTER * DanceTrack.distanceBetweenBeats;
            sprite.x = DanceTrack.laneToX(lane);
            DanceTrack.app.stage.addChild(sprite);
        })
    }

    private static createLines() {
        let graphics = new Graphics()
        for (let i = -DanceTrack.NUM_BEATS_AFTER * Beat.NUM_SUBBEATS + 1; i < DanceTrack.NUM_BEATS_BEFORE * Beat.NUM_SUBBEATS; i++) {
            let y = DanceTrack.NUM_BEATS_AFTER * DanceTrack.distanceBetweenBeats + DanceTrack.distanceBetweenSubbeats * i;
            let lightnessValue;
            if (i % Beat.NUM_SUBBEATS == 0) {
                lightnessValue = 0.5
            } else if (i % (Beat.NUM_SUBBEATS / 2) == 0) {
                lightnessValue = 0.3
            } else if (i % (Beat.NUM_SUBBEATS / 4) == 0) {
                lightnessValue = 0.2
            } else if (i % (Beat.NUM_SUBBEATS / 4) == 0) {
                lightnessValue = 0.15
            } else {
                lightnessValue = 0.05
            }
            let color = new Color([lightnessValue, lightnessValue, lightnessValue])
            graphics
                .moveTo(0, y)
                .lineTo(DanceTrack.app.screen.width, y)
                .stroke({ color: color, pixelLine: true });
        }
        graphics.label = "lines";
        DanceTrack.backgroundContainer.addChild(graphics);
    }


    private static setupLightUpColumns() { 
        let container = new Container();
        container.label = "lightUpColumns";
        DanceTrack.backgroundContainer.addChild(container);
        for (let i = 0; i < 4; i++) {
            let graphics: Graphics = new Graphics()
            DanceTrack.lightUpColumns.push(graphics)
            container.addChild(graphics)
            let width = DanceTrack.app.screen.width / 4
            let height = DanceTrack.app.screen.height
            setInterval(() => {
                DanceTrack.lightUpColumnsAlphas[i] = Math.max(0, DanceTrack.lightUpColumnsAlphas[i] - (DanceTrack.MAX_ALPHA / (DanceTrack.FADE_DURATION / DanceTrack.FADE_INTERVAL)))
                DanceTrack.lightUpColumns[i].clear()
                DanceTrack.lightUpColumns[i].rect(i * width, 0, width, height).fill({color: COLORS[i], alpha: DanceTrack.lightUpColumnsAlphas[i]})
                DanceTrack.app.render()
            }, 10)
        }
    }

    static reset() {
        logger.debug("Resetting DanceTrack")
        DanceTrack.blocks.forEach(block => {
            block.graphic.visible = true;
        });
        DanceTrack.viewport.y = 0;
    }

    static lightUpLane(lane: Lane) {
        logger.debug(`Light up lane: ${lane}`)
        DanceTrack.lightUpColumnsAlphas[lane] = DanceTrack.MAX_ALPHA
    }

    static setBlocks(noteblocks: NoteBlock[]) {
        DanceTrack.blocksContainer.removeChildren();
        DanceTrack.blocks = noteblocks;
        DanceTrack.blocks.forEach((block: NoteBlock) => {
            DanceTrack.blocksContainer.addChild(block.graphic);
            block.graphic.y = block.beat * DanceTrack.distanceBetweenBeats + block.subbeat * DanceTrack.distanceBetweenSubbeats;
            block.graphic.x = DanceTrack.laneToX(block.lane);
        });
        DanceTrack.app.render();

    }

    static laneToX(lane: Lane): number {
        return DanceTrack.app.screen.width / 8 * (lane * 2 + 1);
    }

    static update({ beat, subbeat }: BeatUpdate) {
        DanceTrack.viewport.y = -1 * (beat * DanceTrack.distanceBetweenBeats + subbeat * DanceTrack.distanceBetweenSubbeats);
        DanceTrack.app.render();
    }
}
