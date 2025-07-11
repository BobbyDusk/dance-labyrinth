import { Orientation } from "./DanceTrack";
import { danceTrack } from "./DanceTrack";
import logger from "../Logger";

export interface Settings {
    orientation: Orientation;
    linesVisible: boolean;
    waveformVisible: boolean;
    spectrogramVisible: boolean;
}

export class SettingsManager {
    settings!: Settings;

    constructor() {
        this.settings = SettingsManager.defaultSettings;
        danceTrack.on("linesVisibilityChanged", (visible: boolean) => {
            this.settings.linesVisible = visible;
            this.save();
        });
        danceTrack.on("waveformVisibilityChanged", (visible: boolean) => {
            this.settings.waveformVisible = visible;
            this.save();
        });
        danceTrack.on("spectrogramVisibilityChanged", (visible: boolean) => {
            this.settings.spectrogramVisible = visible;
            this.save();
        });
        danceTrack.on("orientationChanged", (orientation: Orientation) => {
            this.settings.orientation = orientation;
            this.save();
        });
    }

    static get defaultSettings() {
        return {
            linesVisible: true,
            orientation: Orientation.DOWN,
            waveformVisible: true,
            spectrogramVisible: false,
        };
    }

    load() {
        const settings = localStorage.getItem('danceSettings');
        this.settings = settings ? JSON.parse(settings) : SettingsManager.defaultSettings;
        danceTrack.orientation = this.settings.orientation;
        danceTrack.linesVisible = this.settings.linesVisible;
        danceTrack.waveformVisible = this.settings.waveformVisible;
        logger.debug("Settings loaded", this.settings);
    }

    save() {
        localStorage.setItem('danceSettings', JSON.stringify(this.settings));
        logger.debug("Settings saved", this.settings);
    }
}

export const settingsManager = new SettingsManager();