import type { Lane } from './Lane';
import { Graphics } from 'pixi.js';
import { danceTrack } from './DanceTrack';
import logger from '../Logger';
import { Input, inputManager } from '../Input';

export class LaneButton extends Input {

    lane: Lane;
    graphics: Graphics = new Graphics();

    constructor(lane: Lane) {
        super();
        this.lane = lane;
        let width = danceTrack.app.screen.width / 4
        let height = danceTrack.app.screen.height
        this.graphics.label = `buttonLane-${this.lane}`;
        this.graphics.rect(this.lane * width, 0, width, height).fill({color: 0xFFFFFF, alpha: 0})
        this.graphics.interactive = false;
        this.graphics.on('pointerdown', () => {
            logger.debug(`Button pressed on lane ${this.lane}`);
            this.notify();
        });
        inputManager.addInput(`Lane${this.lane}`, this);
    }

    disable() {
        this.graphics.interactive = false;
    }

    enable() {
        this.graphics.interactive = true;
    }
}
