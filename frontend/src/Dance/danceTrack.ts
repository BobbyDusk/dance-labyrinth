import { Application, Graphics, Sprite, Color, Container } from 'pixi.js';
import { Arrow } from './Arrow';
import logger from '../logger';
import { Beat } from '../beat';
import type { BeatUpdate } from '../beat';
import { Direction } from './Direction';

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note
// different colors for the 4 columns
// top arrows should be hollow


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
    static arrows: Arrow[] = [];
    static lightUpColumns: Graphics[] = []
    static lightUpColumnsAlphas: number[] = [0, 0, 0, 0]

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
        DanceTrack.createArrowTargets();
        DanceTrack.setupLightUpColumns();
        DanceTrack.app.render()
    }

    private static setupStructure() {
        let backgroundContainer = new Container();
        backgroundContainer.label = "background";
        DanceTrack.app.stage.addChild(backgroundContainer);
        let foregroundContainer = new Container();
        foregroundContainer.y = DanceTrack.MARGIN_TOP;
        foregroundContainer.label = "foreground";
        DanceTrack.app.stage.addChild(foregroundContainer);
        let arrowsContainer = new Container();
        arrowsContainer.label = "arrows";
        foregroundContainer.addChild(arrowsContainer);
    }

    private static createArrowTargets() {
        [Direction.Left, Direction.Down, Direction.Up, Direction.Right].forEach((direction: Direction) => {
            let sprite = Arrow.createArrowSprite(direction, true);
            sprite.y = 100;
            sprite.x = DanceTrack.getXForDirection(direction);
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
        DanceTrack.app.stage.getChildByLabel("background")!.addChild(graphics);
    }


    private static setupLightUpColumns() { 
        let container = new Container();
        container.label = "lightUpColumns";
        DanceTrack.app.stage.getChildByLabel("background")!.addChild(container);
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
    
    static lightUpColumn(direction: Direction) {
        logger.debug(`Light up column: ${Direction[direction]}`)
        DanceTrack.lightUpColumnsAlphas[direction] = DanceTrack.MAX_ALPHA
    }

    static setArrows(arrows: Arrow[]) {
        let arrowsContainer = DanceTrack.app.stage.getChildByLabel("foreground")!.getChildByLabel("arrows")!;
        arrowsContainer.removeChildren();
        DanceTrack.arrows = arrows;
        DanceTrack.arrows.forEach((arrow: Arrow) => {
            arrowsContainer.addChild(arrow.sprite);
            let distanceBetweenSubbeats = (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / (DanceTrack.BEATS_VISIBLE * Beat.NUM_SUBBEATS);
            let lineNumber = arrow.beat * Beat.NUM_SUBBEATS + arrow.subbeat;
            arrow.sprite.y = lineNumber * distanceBetweenSubbeats;
            arrow.sprite.x = DanceTrack.getXForDirection(arrow.direction);
        });
        DanceTrack.app.render();

    }

    static getXForDirection(direction: Direction): number {
        return DanceTrack.app.screen.width / 8 * (direction * 2 + 1);
    }

    static update({ beat, subbeat }: BeatUpdate) {
        let foregroundContainer = DanceTrack.app.stage.getChildByLabel("foreground")!;
        let distanceBetweenSubbeats = (DanceTrack.app.screen.height - DanceTrack.MARGIN_TOP) / (DanceTrack.BEATS_VISIBLE * Beat.NUM_SUBBEATS);
        foregroundContainer.y = DanceTrack.MARGIN_TOP - distanceBetweenSubbeats * (beat * Beat.NUM_SUBBEATS + subbeat);
        DanceTrack.app.render();
    }
}
