import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Voice IDs - using a professional, clear voice
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George - clear, professional male voice
const ALTERNATIVE_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - warm female voice

export interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Convert text to speech using ElevenLabs
 * Returns an audio stream
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    modelId = 'eleven_multilingual_v2',
  } = options;

  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId,
    outputFormat: 'mp3_44100_128',
  });

  // Convert the response to a ReadableStream
  return audio as unknown as ReadableStream<Uint8Array>;
}

/**
 * Convert text to speech and return as ArrayBuffer
 */
export async function textToSpeechBuffer(
  text: string,
  options: TTSOptions = {}
): Promise<ArrayBuffer> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    modelId = 'eleven_multilingual_v2',
  } = options;

  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId,
    outputFormat: 'mp3_44100_128',
  });

  // Collect all chunks into a buffer
  const chunks: Uint8Array[] = [];
  const reader = (audio as ReadableStream<Uint8Array>).getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  // Combine chunks into a single ArrayBuffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}

/**
 * Get available voices
 */
export async function getVoices() {
  const voices = await elevenlabs.voices.getAll();
  return voices;
}

export { DEFAULT_VOICE_ID, ALTERNATIVE_VOICE_ID };

