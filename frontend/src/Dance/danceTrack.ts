import { Graphics, Sprite, Color } from 'pixi.js';
import { global } from '../global';
import { createArrowSprite, } from './Arrow';
import logger from '../logger';
import { Beat } from '../beat';
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


    static lightUpColumns: Graphics[] = []
    static lightUpColumnsAlphas: number[] = [0, 0, 0, 0]

    private constructor() {
    }

    static async setup(container: HTMLElement) {
        await global.app.init({ width: 600, height: 1000 });
        container.appendChild(global.app.canvas);

        DanceTrack.createLines();
        DanceTrack.createArrowTargets();
        DanceTrack.setupLightUpColumns();
    };

    private static createArrowTargets() {
        const arrows = [
            createArrowSprite(Direction.Left, true),
            createArrowSprite(Direction.Down, true),
            createArrowSprite(Direction.Up, true),
            createArrowSprite(Direction.Right, true),
        ]

        arrows.forEach((arrow: Sprite) => {
            arrow.y = 100;
            global.app.stage.addChild(arrow);
        })
    }

    private static createLines() {
        let graphics = new Graphics()
        for (let i = -1; i < DanceTrack.BEATS_VISIBLE; i++) {
            let height = DanceTrack.MARGIN_TOP + (global.app.screen.height - DanceTrack.MARGIN_TOP) / DanceTrack.BEATS_VISIBLE * i
            graphics
                .moveTo(0, height)
                .lineTo(global.app.screen.width, height)
                .stroke({ color: "white", pixelLine: true });
            for (let j = 1; j < Beat.NUM_SUBBEATS; j++) {
                let height = DanceTrack.MARGIN_TOP + (global.app.screen.height - DanceTrack.MARGIN_TOP) / DanceTrack.BEATS_VISIBLE * (i + j / Beat.NUM_SUBBEATS)
                let lightnessValue = 0.15
                if (j % (Beat.NUM_SUBBEATS / 4) == 0) lightnessValue = 0.3
                if (j == Beat.NUM_SUBBEATS / 2) lightnessValue = 0.5
                let color = new Color([lightnessValue, lightnessValue, lightnessValue])
                graphics
                    .moveTo(0, height)
                    .lineTo(global.app.screen.width, height)
                    .stroke({ color: color, pixelLine: true });
            }
        }
        global.app.stage.addChild(graphics);
    }


    private static setupLightUpColumns() { 
        for (let i = 0; i < 4; i++) {
            let graphics: Graphics = new Graphics()
            DanceTrack.lightUpColumns.push(graphics)
            global.app.stage.addChild(graphics)
            let width = global.app.screen.width / 4
            let height = global.app.screen.height
            setInterval(() => {
                DanceTrack.lightUpColumnsAlphas[i] = Math.max(0, DanceTrack.lightUpColumnsAlphas[i] - (DanceTrack.MAX_ALPHA / (DanceTrack.FADE_DURATION / DanceTrack.FADE_INTERVAL)))
                DanceTrack.lightUpColumns[i].clear()
                DanceTrack.lightUpColumns[i].rect(i * width, 0, width, height).fill({color: COLORS[i], alpha: DanceTrack.lightUpColumnsAlphas[i]})
            }, 10)
        }
    }
    
    static lightUpColumn(direction: Direction) {
        logger.debug(`Light up column: ${Direction[direction]}`)
        DanceTrack.lightUpColumnsAlphas[direction] = DanceTrack.MAX_ALPHA
    }
}
