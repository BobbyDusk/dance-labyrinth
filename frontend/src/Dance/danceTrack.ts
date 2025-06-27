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

    static BEATS_VISIBLE = 5;
    static MARGIN_TOP = 100;
    static MAX_ALPHA = 0.75;
    static FADE_DURATION = 500;
    static FADE_INTERVAL = 10;

    static app: Application = new Application()
    static blocks: NoteBlock[] = [];
    static lightUpColumns: Graphics[] = []
    static lightUpColumnsAlphas: number[] = [0, 0, 0, 0]

    static backgroundContainer: Container = new Container();
    static foregroundContainer: Container = new Container();
    static blocksContainer: Container = new Container();

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

        DanceTrack.setupStructure();
        DanceTrack.createLines();
        DanceTrack.createBlockTargets();
        DanceTrack.setupLightUpColumns();
        DanceTrack.app.render()
    }

    private static setupStructure() {
        DanceTrack.backgroundContainer.label = "background";
        DanceTrack.app.stage.addChild(DanceTrack.backgroundContainer);
        let viewport = new Viewport({
            screenWidth: DanceTrack.app.screen.width,
            screenHeight: DanceTrack.app.screen.height,
            worldWidth: DanceTrack.app.screen.width,
            worldHeight: DanceTrack.app.screen.height,
            events: DanceTrack.app.renderer.events,
        });
        DanceTrack.app.stage.addChild(viewport);
        viewport.drag({
            direction: "y"
        }).decelerate();
        DanceTrack.foregroundContainer.label = "foreground";
        DanceTrack.foregroundContainer.y = DanceTrack.MARGIN_TOP;
        viewport.addChild(DanceTrack.foregroundContainer);
        DanceTrack.blocksContainer.label = "blocks";
        DanceTrack.foregroundContainer.addChild(DanceTrack.blocksContainer);
    }

    private static createBlockTargets() {
        let lanes = [0, 1, 2, 3] as Lane[];
        lanes.forEach((lane: Lane) => {
            let sprite = NoteBlock.createGraphic(lane, true);
            sprite.y = 100;
            sprite.x = DanceTrack.laneToX(lane);
            DanceTrack.app.stage.addChild(sprite);
        })
    }

    private static createLines() {
        let graphics = new Graphics()
        for (let i = -1; i < DanceTrack.BEATS_VISIBLE; i++) {
            let height = DanceTrack.MARGIN_TOP + (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / DanceTrack.BEATS_VISIBLE * i
            graphics
                .moveTo(0, height)
                .lineTo(DanceTrack.app.screen.width, height)
                .stroke({ color: "white", pixelLine: true });
            for (let j = 1; j < Beat.NUM_SUBBEATS; j++) {
                let height = DanceTrack.MARGIN_TOP + (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / DanceTrack.BEATS_VISIBLE * (i + j / Beat.NUM_SUBBEATS)
                let lightnessValue = 0.15
                if (j % (Beat.NUM_SUBBEATS / 4) == 0) lightnessValue = 0.3
                if (j == Beat.NUM_SUBBEATS / 2) lightnessValue = 0.5
                let color = new Color([lightnessValue, lightnessValue, lightnessValue])
                graphics
                    .moveTo(0, height)
                    .lineTo(DanceTrack.app.screen.width, height)
                    .stroke({ color: color, pixelLine: true });
            }
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

    static lightUpLane(lane: Lane) {
        logger.debug(`Light up lane: ${lane}`)
        DanceTrack.lightUpColumnsAlphas[lane] = DanceTrack.MAX_ALPHA
    }

    static setBlocks(noteblocks: NoteBlock[]) {
        DanceTrack.blocksContainer.removeChildren();
        DanceTrack.blocks = noteblocks;
        DanceTrack.blocks.forEach((block: NoteBlock) => {
            DanceTrack.blocksContainer.addChild(block.graphic);
            let distanceBetweenSubbeats = (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / (DanceTrack.BEATS_VISIBLE * Beat.NUM_SUBBEATS);
            let lineNumber = block.beat * Beat.NUM_SUBBEATS + block.subbeat;
            block.graphic.y = lineNumber * distanceBetweenSubbeats;
            block.graphic.x = DanceTrack.laneToX(block.lane);
        });
        DanceTrack.app.render();

    }

    static laneToX(lane: Lane): number {
        return DanceTrack.app.screen.width / 8 * (lane * 2 + 1);
    }

    static update({ beat, subbeat }: BeatUpdate) {
        let distanceBetweenSubbeats = (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / (DanceTrack.BEATS_VISIBLE * Beat.NUM_SUBBEATS);
        DanceTrack.foregroundContainer.y = DanceTrack.MARGIN_TOP - distanceBetweenSubbeats * (beat * Beat.NUM_SUBBEATS + subbeat);
        DanceTrack.app.render();
    }
}
