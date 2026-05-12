import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { randomUUID } from "crypto";

import { convertWebmToWav } from "../utils/ffmpeg.js";

const sessions = new Map();

const VOICE_CONFIG = {
  CHUNK_THRESHOLD: 4,
  MAX_CHUNK_SIZE: 1024 * 16,
  PROCESSING_TIMEOUT: 8000,
  RETRY_ATTEMPTS: 2,
};

// ---------------- BUFFER ----------------
class AudioBuffer {
  constructor() {
    this.chunks = [];
    this.totalSize = 0;
    this.lastProcessTime = Date.now();
  }

  addChunk(chunk) {
    this.chunks.push(chunk);
    this.totalSize += chunk.length;
  }

  shouldProcess() {
    const now = Date.now();
    const timeOK = now - this.lastProcessTime > 2000; // FIX: avoid too fast ffmpeg
    const chunkOK = this.chunks.length >= VOICE_CONFIG.CHUNK_THRESHOLD;
    const sizeOK = this.totalSize >= VOICE_CONFIG.MAX_CHUNK_SIZE;

    return (timeOK || chunkOK || sizeOK) && this.chunks.length > 0;
  }

  getBuffer() {
    return Buffer.concat(this.chunks);
  }

  reset() {
    this.chunks = [];
    this.totalSize = 0;
    this.lastProcessTime = Date.now();
  }
}

// ---------------- SESSION ----------------
class VoiceSession {
  constructor(id) {
    this.id = id;
    this.buffer = new AudioBuffer();
    this.processing = false;
    this.retryCount = 0;

    // IMPORTANT: queue to avoid race condition
    this.queue = Promise.resolve();
  }

  enqueue(task) {
    this.queue = this.queue.then(task).catch((err) => {
      console.error("Queue error:", err);
    });
    return this.queue;
  }
}

// ---------------- SOCKET ----------------
export const registerVoiceSocket = (io, socket) => {
  const session = new VoiceSession(socket.id);
  sessions.set(socket.id, session);

  socket.on("voice:start", () => {
    console.log("Voice started:", socket.id);
    session.buffer.reset();
    session.retryCount = 0;
  });

  socket.on("voice:chunk", (chunk) => {
    const s = sessions.get(socket.id);
    if (!s) return;

    s.buffer.addChunk(Buffer.from(chunk));

    if (s.processing || !s.buffer.shouldProcess()) return;

    s.processing = true;

    s.enqueue(() =>
      processAudio(io, socket, s).finally(() => {
        s.processing = false;
      }),
    );
  });

  socket.on("voice:end", () => {
    const s = sessions.get(socket.id);
    if (!s) return;

    if (!s.processing && s.buffer.chunks.length > 0) {
      s.processing = true;

      s.enqueue(() =>
        processAudio(io, socket, s).finally(() => {
          cleanupSession(socket.id);
        }),
      );
    } else {
      cleanupSession(socket.id);
    }
  });

  socket.on("disconnect", () => {
    cleanupSession(socket.id);
  });
};

// ---------------- CORE PROCESS ----------------
async function processAudio(io, socket, session) {
  const start = Date.now();

  let webmPath;
  let wavPath;
  let audioBuffer;

  try {
    audioBuffer = session.buffer.getBuffer();

    if (!audioBuffer.length) return;

    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const id = randomUUID();

    webmPath = path.join(tempDir, `${session.id}_${id}.webm`);
    wavPath = path.join(tempDir, `${session.id}_${id}.wav`);

    fs.writeFileSync(webmPath, audioBuffer);

    console.log("WEBM CREATED:", webmPath);

    await Promise.race([
      convertWebmToWav(webmPath, wavPath),
      timeout(VOICE_CONFIG.PROCESSING_TIMEOUT, "FFmpeg timeout"),
    ]);

    console.log("WAV CREATED:", wavPath);

    const form = new FormData();
    form.append("audio", fs.createReadStream(wavPath));

    const response = await Promise.race([
      axios.post("http://localhost:5000/stt/transcribe", form, {
        headers: form.getHeaders(),
        timeout: VOICE_CONFIG.PROCESSING_TIMEOUT,
      }),
      timeout(VOICE_CONFIG.PROCESSING_TIMEOUT, "Whisper timeout"),
    ]);

    console.log("WHISPER:", response.data);

    socket.emit("transcript:partial", {
      text: response.data.text || "",
      confidence: response.data.confidence || null,
      processingTime: Date.now() - start,
    });

    // SUCCESS → reset buffer
    session.buffer.reset();
    session.retryCount = 0;
  } catch (err) {
    console.error("AUDIO ERROR:", err);

    session.retryCount++;

    if (session.retryCount <= VOICE_CONFIG.RETRY_ATTEMPTS) {
      console.log("Retry:", session.retryCount);

      socket.emit("transcript:retry", {
        attempt: session.retryCount,
      });

      // IMPORTANT: DO NOT reset buffer on retry
      return;
    }

    socket.emit("transcript:error", {
      error: "Processing failed after retries",
    });
  } finally {
    await cleanup(webmPath, wavPath);
  }
}

// ---------------- HELPERS ----------------
function timeout(ms, msg) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(msg)), ms),
  );
}

async function cleanup(...files) {
  for (const f of files) {
    try {
      if (f && fs.existsSync(f)) fs.unlinkSync(f);
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
}

function cleanupSession(id) {
  const s = sessions.get(id);
  if (s) {
    console.log("Cleanup session:", id);
    sessions.delete(id);
  }
}
