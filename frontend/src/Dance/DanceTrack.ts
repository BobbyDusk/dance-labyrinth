import { Application, Graphics, Color, Container, Point, FederatedPointerEvent, Texture, Sprite, getAdjustedBlendModeBlend } from 'pixi.js';
import { NoteBlock } from './NoteBlock';
import logger from '../Logger';
import { metronome, Metronome } from '../Metronome';
import type { Beat } from '../Metronome';
import type { Lane } from './Lane';
import { Viewport } from "pixi-viewport";
import { LightLane } from './LightLane';
import { LANE_COLORS } from './LaneColors';
import EventEmitter from 'eventemitter3';
import { danceManager } from './DanceManager';
import { AudioVisualizer, audioVisualizer } from './AudioVisualizer';

// sudden death mode -> miss single note => restart
// animation for hitting the notes correct (color and animation depending on perfect, good, ok and maybe also a sound effect)
// animation for missing notes
// animation for pressing without a note

export type SnappingInterval = 1 | 2 | 4 | 8 | 16 | 32 | 64;

export enum Orientation {
    UP = "up",
    DOWN = "down",
}

export class DanceTrack extends EventEmitter {
    static NUM_BEATS_BEFORE = 10;
    static NUM_BEATS_AFTER = 1;
    static NUM_BEATS = DanceTrack.NUM_BEATS_BEFORE + DanceTrack.NUM_BEATS_AFTER;

    #snappingInterval: SnappingInterval = 16;
    #orientation: Orientation = Orientation.DOWN;

    app: Application = new Application()
    blocks: NoteBlock[] = [];
    lightLanes: LightLane[] = []

    staticBackgroundContainer: Container = new Container();
    targetBlocksContainer: Container = new Container();
    viewport!: Viewport;
    movingForegroundContainer: Container = new Container();
    staticForegroundContainer: Container = new Container();
    blocksContainer: Container = new Container();
    waveformContainer: Container = new Container();
    spectrogramContainer: Container = new Container();
    ghostBlockContainer: Container = new Container();
    ghostBlock!: NoteBlock;

    distanceBetweenBeats: number = 0;
    distanceBetweenSubbeats: number = 0;

    dragging: boolean = false;

    private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

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
        this.orientation = this.orientation
    }

    private setupStructure() {
        this.staticBackgroundContainer.label = "staticBackground";
        this.app.stage.addChild(this.staticBackgroundContainer);
        this.targetBlocksContainer.label = "targetBlocks";
        this.staticForegroundContainer.addChild(this.targetBlocksContainer);
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
                direction: "y",
                mouseButtons: "right",
            });
        this.viewport.options.disableOnContextMenu = true;
        this.movingForegroundContainer.label = "movingForeground";
        this.viewport.addChild(this.movingForegroundContainer);
        this.staticForegroundContainer.label = "staticForeground";
        this.app.stage.addChild(this.staticForegroundContainer);
        this.blocksContainer.label = "blocks";
        this.movingForegroundContainer.addChild(this.blocksContainer);
        this.waveformContainer.label = "waveform";
        this.waveformContainer.zIndex = -10
        this.movingForegroundContainer.addChild(this.waveformContainer);
        this.spectrogramContainer.label = "spectrogram";
        this.spectrogramContainer.zIndex = -10;
        this.movingForegroundContainer.addChild(this.spectrogramContainer);
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
        this.viewport.on("wheel-scroll", () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            this.scrollTimeout = setTimeout(() => {
                this.snapViewportToSubbeat();
            }, 250);
        })
        this.viewport.on("moved", () => this.updateWhileDragging());
        this.ghostBlockContainer.label = "ghostBlockContainer";
        this.ghostBlockContainer.zIndex = -1;
        this.movingForegroundContainer.addChild(this.ghostBlockContainer);
        this.ghostBlock = new NoteBlock({
            beat: 0,
            subbeat: 0,
            lane: 0,
        })
        this.ghostBlock.graphics.label = "ghostBlock";
        this.ghostBlock.graphics.alpha = 0.5;
        this.ghostBlock.graphics.cursor = 'url(add-cursor.png), pointer';
        this.ghostBlock.graphics.off("mousedown");
        this.ghostBlockContainer.addChild(this.ghostBlock.graphics);
        this.viewport.on("pointermove", (event: FederatedPointerEvent) => {
            this.updateGhostBlock(event);
        });
        this.viewport.cursor = 'url(add-cursor.png), pointer';
        this.viewport.on("mousedown", (event: FederatedPointerEvent) => {
            this.addBlockAtGhostLocation();
        });
    }

    private updateWhileDragging() {
        this.viewportY = Math.max(0, this.viewportY);
        metronome.setBeat(this.yToBeat(this.viewportY, false));
    }

    private updateGhostBlock(event: FederatedPointerEvent) {
            if (!this.dragging && metronome.stopped) {
                this.ghostBlock.graphics.visible = true;
                this.ghostBlock.lane = Math.floor(event.screen.x / (this.app.screen.width / 4)) as Lane;
                this.ghostBlock.setBeat(this.yToBeat(this.screenYToTrackY(event.screen.y), true));
            } else {
                this.ghostBlock.graphics.visible = false;
            }
    }

    private addBlockAtGhostLocation() {
        if (!this.dragging && metronome.stopped) {
            let doesBlockExist = this.blocks.some(block => {
                return block.beat === this.ghostBlock.beat && block.subbeat === this.ghostBlock.subbeat && block.lane === this.ghostBlock.lane;
            });
            if (doesBlockExist) {
                logger.debug(`Tried to add block that already exists at beat ${this.ghostBlock.beat}, subbeat ${this.ghostBlock.subbeat}, lane ${this.ghostBlock.lane}`);
                return;
            }
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
            danceManager.updateChart();
            logger.debug(`Added block at beat ${newBlock.beat}, subbeat ${newBlock.subbeat}, lane ${newBlock.lane}`);
        }
    }

    removeBlock(block: NoteBlock) {
        let index = this.blocks.indexOf(block);
        if (index !== -1) {
            this.blocks.splice(index, 1);
            this.blocksContainer.removeChild(block.graphics);
            danceManager.updateChart();
            logger.debug(`Removed block at beat ${block.beat}, subbeat ${block.subbeat}, lane ${block.lane}`);
        } else {
            logger.warn(`Tried to remove block that does not exist: ${block}`);
        }
        block.destruct();
    }

    private snapViewportToSubbeat() {
        let { beat, subbeat } = this.yToBeat(this.viewportY, true);
        this.update({ beat, subbeat });
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
            this.targetBlocksContainer.addChild(target);
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
        this.staticBackgroundContainer.addChild(graphics);
    }


    private setupLightLanes() {
        let container = new Container();
        container.label = "lightLanes";
        this.staticBackgroundContainer.addChild(container);
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
        this.update({ beat: 0, subbeat: 0 });
    }

    lightUpLane(lane: Lane) {
        this.lightLanes[lane].lightUp();
    }

    setBlocks(noteblocks: NoteBlock[]) {
        this.blocks.forEach((block: NoteBlock) => {
            block.destruct();
        });
        this.blocksContainer.removeChildren();
        this.blocks = noteblocks;
        this.blocks.forEach((block: NoteBlock) => {
            this.blocksContainer.addChild(block.graphics);
        });
        logger.debug(`Set ${this.blocks.length} blocks`);
    }

    setWaveformBackground() {
        this.spectrogramContainer.removeChildren();
        for (const [index, canvas] of audioVisualizer.waveformCanvases.entries()) {
            const texture = Texture.from(canvas);
            const sprite = new Sprite(texture);
            sprite.label = "waveformBackground";
            sprite.y = index * AudioVisualizer.CANVAS_LENGTH;
            this.spectrogramContainer.addChild(sprite);
        }
    }

    laneToX(lane: Lane): number {
        return this.app.screen.width / 8 * (lane * 2 + 1);
    }

    private screenYToTrackY(y: number): number {
        let adjustedY = this.orientation === Orientation.UP ? y : this.app.screen.height - y;
        return Math.max(0, this.viewportY + adjustedY + (this.orientation === Orientation.UP ? -1 : 1) * this.movingForegroundContainer.position.y);
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

    update(beat: Beat) {
        this.viewportY = this.beatToY(beat);
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

    get orientation(): Orientation {
        return this.#orientation;
    }

    set orientation(orientation: Orientation) {
        this.#orientation = orientation;
        this.staticBackgroundContainer.scale.y = this.#orientation === Orientation.UP ? 1 : -1;
        this.staticBackgroundContainer.position.y = this.#orientation === Orientation.UP ? 0 : this.app.screen.height;
        this.staticForegroundContainer.scale.y = this.#orientation === Orientation.UP ? 1 : -1;
        this.staticForegroundContainer.position.y = this.#orientation === Orientation.UP ? 0 : this.app.screen.height;
        this.blocksContainer.scale.y = this.#orientation === Orientation.UP ? 1 : -1;
        this.blocksContainer.position.y = this.#orientation === Orientation.UP ? 0 : this.app.screen.height;
        this.ghostBlockContainer.scale.y = this.#orientation === Orientation.UP ? 1 : -1;
        this.ghostBlockContainer.position.y = this.#orientation === Orientation.UP ? 0 : this.app.screen.height;
        this.movingForegroundContainer.position.y = this.#orientation === Orientation.UP ? DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats : -DanceTrack.NUM_BEATS_AFTER * this.distanceBetweenBeats;
        logger.debug(`Orientation set to ${this.#orientation}`);
        this.emit("orientationChanged", this.#orientation);
    }

    private get viewportY(): number {
        return this.#orientation === Orientation.UP ? this.viewport.top : this.app.screen.height - this.viewport.bottom;
    }

    private set viewportY(value: number) {
        if (this.#orientation === Orientation.UP) {
            this.viewport.top = value;
        } else {
            this.viewport.bottom = this.app.screen.height - value;
        }
    }
}

export const danceTrack = new DanceTrack();