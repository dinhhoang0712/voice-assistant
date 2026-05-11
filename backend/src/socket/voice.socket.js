import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

import { convertWebmToWav } from "../utils/ffmpeg.js";

const sessions = new Map();

export const registerVoiceSocket = (io, socket) => {
  socket.on("voice:start", () => {
    console.log("Voice started:", socket.id);

    sessions.set(socket.id, {
      chunks: [],
    });
  });

  socket.on("voice:chunk", async (chunk) => {
    try {
      const session = sessions.get(socket.id);

      if (!session) return;

      session.chunks.push(Buffer.from(chunk));

      console.log("Chunks:", session.chunks.length);

      /**
       * 250ms × 8 ≈ 2 giây audio
       */
      if (session.chunks.length >= 8) {
        console.log("PROCESS REALTIME AUDIO");

        const audioBuffer = Buffer.concat(session.chunks);

        // reset buffer
        session.chunks = [];

        // đảm bảo temp folder tồn tại
        const tempDir = path.join("temp");

        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, {
            recursive: true,
          });
        }

        const webmPath = path.join(tempDir, `${socket.id}.webm`);

        const wavPath = path.join(tempDir, `${socket.id}.wav`);

        /**
         * lưu webm
         */
        fs.writeFileSync(webmPath, audioBuffer);

        console.log("WEBM CREATED");

        /**
         * convert webm -> wav
         */
        await convertWebmToWav(webmPath, wavPath);

        console.log("WAV CREATED");

        /**
         * gửi whisper flask
         */
        const form = new FormData();

        form.append("audio", fs.createReadStream(wavPath));

        console.log("SENDING TO WHISPER");

        const response = await axios.post(
          "http://localhost:5000/stt/transcribe",
          form,
          {
            headers: form.getHeaders(),
          },
        );

        console.log("WHISPER RESPONSE:", response.data);

        /**
         * realtime transcript
         */
        socket.emit("transcript:partial", {
          text: response.data.text || "",
        });

        /**
         * cleanup temp files
         */
        try {
          if (fs.existsSync(webmPath)) {
            fs.unlinkSync(webmPath);
          }

          if (fs.existsSync(wavPath)) {
            fs.unlinkSync(wavPath);
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
      }
    } catch (err) {
      console.error("VOICE CHUNK ERROR:");

      console.error(err);

      socket.emit("transcript:partial", {
        text: "Lỗi xử lý giọng nói realtime.",
      });
    }
  });

  socket.on("voice:end", () => {
    console.log("Voice ended:", socket.id);

    sessions.delete(socket.id);

    socket.emit("transcript:final", {
      text: "Kết thúc ghi âm",
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    sessions.delete(socket.id);
  });
};
