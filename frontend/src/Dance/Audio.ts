import { Howl, Howler } from 'howler';
import delay from 'delay';

export class Audio {
    private static instance: Audio = new Audio();
    
    private constructor() {}

    static async play(url: string) {
        return new Promise<void>((resolve) => {
            let sound = new Howl({
                src: [url],
            });
            sound.play();
            sound.on('end', () => {
                resolve();
            });
        });
    }

    static async playSong(url: string, bpm: number, numPrebeats: number) {
        // await Audio.playIntro(bpm, numPrebeats);
        await Audio.play(url);
    }

    static async playIntro(bpm: number, beats: number) {
        return new Promise<void>((resolve) => {
            let kick = new Howl({
                src: [`/kick.wav`],
            });
            for (let i = 0; i < beats; i++) {
                setTimeout(() => {
                    if (i === beats - 1) {
                        resolve();
                    } else {
                        kick.play();
                    }
                }, i * (60 * 1000 / bpm));
            }
        });
    }

    static stop() {
        Howler.stop();
    }
}