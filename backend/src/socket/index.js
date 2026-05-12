import { registerVoiceSocket } from "./voiceSocket.js";
import { initReminderSocket } from "./reminderSocket.js";
import { setIO } from "./ioInstance.js";

export const initializeSocketHandlers = (io) => {
  setIO(io);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerVoiceSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  initReminderSocket(io);
};
