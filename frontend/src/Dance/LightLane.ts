import type { Lane } from './Lane';
import { Graphics } from 'pixi.js';
import { danceTrack, DanceTrack } from './DanceTrack';
import logger from '../Logger';

export class LightLane {
    static MAX_ALPHA = 0.75;
    static FADE_DURATION = 500;
    static FADE_FPS = 60;
    static FADE_INTERVAL = Math.floor(1000 / LightLane.FADE_FPS);

    lane: Lane;
    graphics: Graphics = new Graphics();
    alpha: number = 0;
    interval: ReturnType<typeof setInterval> | null = null;

    constructor(lane: Lane) {
        this.lane = lane;
        let width = danceTrack.app.screen.width / 4
        let height = danceTrack.app.screen.height
        this.graphics.label = `lightLane-${this.lane}`;
        this.graphics.rect(this.lane * width, 0, width, height).fill({color: DanceTrack.LANE_COLORS[this.lane], alpha: 0})

    }

    lightUp() {
        logger.debug(`Lighting up lane ${this.lane}`);
        this.alpha = LightLane.MAX_ALPHA;
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.alpha = Math.max(0, this.alpha - (LightLane.MAX_ALPHA / (LightLane.FADE_DURATION / LightLane.FADE_INTERVAL)));
                this.graphics.clear();
                let width = danceTrack.app.screen.width / 4
                let height = danceTrack.app.screen.height
                this.graphics.rect(this.lane * width, 0, width, height).fill({color: DanceTrack.LANE_COLORS[this.lane], alpha: this.alpha});
                if (this.alpha <= 0) {
                    clearInterval(this.interval!);
                    this.interval = null;
                }
            }, LightLane.FADE_INTERVAL);
        }
    }

}
