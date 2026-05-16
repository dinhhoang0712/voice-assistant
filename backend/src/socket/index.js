import { registerVoiceSocket } from "./voiceSocket.js";
import { initReminderSocket } from "./reminderSocket.js";
import { setIO } from "./ioInstance.js";
import { socketConnections } from "../utils/metrics.js";

export const initializeSocketHandlers = (io) => {
  setIO(io);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socketConnections.inc();

    registerVoiceSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      socketConnections.dec();
    });
  });

  initReminderSocket(io);
};
