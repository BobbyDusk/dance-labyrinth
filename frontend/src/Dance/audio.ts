// @ts-ignore
import toWav from 'audiobuffer-to-wav';

export function addSilenceToAudio(audioBuffer: AudioBuffer, silenceDuration: number): AudioBuffer {
    const sampleRate = audioBuffer.sampleRate;
    const silenceSamples = Math.floor(sampleRate * silenceDuration);
    const numChannels = audioBuffer.numberOfChannels;

    // Create a new audio buffer with silence at the start
    const newAudioBuffer = new AudioBuffer({
        length: audioBuffer.length + silenceSamples,
        numberOfChannels: numChannels,
        sampleRate: sampleRate
    });

    // For each channel, fill the start with silence and copy the original data after
    for (let channel = 0; channel < numChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newAudioBuffer.getChannelData(channel);
        // Silence at the start (already zeroed)
        newData.set(oldData, silenceSamples);
    }

    return newAudioBuffer;
}

export async function audioBufferToBase64Url(audioBuffer: AudioBuffer): Promise<string> {
    const audioContext = new AudioContext();
    try {
        let monoAudioBuffer = await stereoToMono(audioBuffer);
        let blob = new Blob([toWav(monoAudioBuffer)], { type: 'audio/wav' });
        const reader = new FileReader();

        return await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to convert audio buffer to base64 URL"));
            reader.readAsDataURL(blob);
        });
    } finally {
        audioContext.close();
    }
}

export async function stereoToMono(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    if (audioBuffer.numberOfChannels === 1) {
        return audioBuffer; // Already mono
    }

    const monoBuffer = new AudioBuffer({
        length: audioBuffer.length,
        numberOfChannels: 1,
        sampleRate: audioBuffer.sampleRate
    });

    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);
    const monoData = monoBuffer.getChannelData(0);

    for (let i = 0; i < leftChannel.length; i++) {
        monoData[i] = (leftChannel[i] + rightChannel[i]) / 2; // Average both channels
    }

    return monoBuffer;
}   