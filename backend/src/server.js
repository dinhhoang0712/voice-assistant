import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDb } from "./db/sequelize.js";
import cors from "cors";
import { env } from "./utils/env.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import { authRouter } from "./routes/authRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import { assistantRouter } from "./routes/assistantRouter.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import { initializeSocketHandlers } from "./socket/index.js";
import reminderWorker from "./workers/reminderWorker.js";
import { historyRouter } from "./routes/historyRouter.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = env.port;

// middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.corsOrigin, credentials: true }));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái sức khỏe của server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (_req, res) => res.json({ ok: true }));
// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Voice Assistant Backend API Documentation"
}));

app.use("/api/auth", authRouter);

app.use(protectedRoute);

app.use("/api/assistant", assistantRouter);
app.use("/api/reminders", reminderRoutes);
app.use("/api/history", historyRouter);
connectDb().then(() => {
  // Initialize Socket.IO handlers
  initializeSocketHandlers(io);

  // Start reminder worker
  reminderWorker.start();

  server.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
    console.log(`Socket.IO server is running`);
    console.log(`Reminder worker is running`);
  });
});
