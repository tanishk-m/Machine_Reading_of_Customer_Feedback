import { arrayBufferToBase64, concatFloat32, encodeWavPcm16Mono } from "./wav";

type RecorderOptions = {
  sampleRate?: number;
};

export class PcmWavRecorder {
  private readonly sampleRate: number;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private silence: GainNode | null = null;
  private chunks: Float32Array[] = [];

  constructor(opts?: RecorderOptions) {
    this.sampleRate = opts?.sampleRate ?? 16000;
  }

  async start() {
    if (this.audioContext) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    await this.audioContext.resume();
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // ScriptProcessorNode is deprecated but broadly supported and sufficient here.
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.chunks = [];

    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      // Copy because input buffer is reused.
      this.chunks.push(new Float32Array(input));
    };

    // Keep node graph alive without playing audio back.
    this.silence = this.audioContext.createGain();
    this.silence.gain.value = 0;

    this.source.connect(this.processor);
    this.processor.connect(this.silence);
    this.silence.connect(this.audioContext.destination);
  }

  async stop(): Promise<string> {
    // Disconnect graph
    this.source?.disconnect();
    this.processor?.disconnect();
    this.silence?.disconnect();

    this.source = null;
    this.processor = null;
    this.silence = null;

    // Stop mic
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;

    // Close context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    const merged = concatFloat32(this.chunks);
    this.chunks = [];

    if (merged.length === 0) {
      throw new Error("No audio captured");
    }

    const wavBuffer = encodeWavPcm16Mono(merged, this.sampleRate);
    return arrayBufferToBase64(wavBuffer);
  }
}
