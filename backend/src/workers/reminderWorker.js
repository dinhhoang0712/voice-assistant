import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import { io } from "../socket/ioInstance.js";

export const reminderWorker = new Worker(
  "reminder",
  async (job) => {
    console.log("---------- JOB RUN:", job.data);

    const { userId, title, reminderId } = job.data;

    io.to(`user:${userId}`).emit("reminder", {
      message: `Đến giờ "${title}" rồi!`,
      reminderId,
    });
  },
  { connection },
);
