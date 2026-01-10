import "./config/env.js"; 

import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js"; 
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */

// ✅ CORS linh hoạt hơn cho môi trường Dev
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Tắt Cache để đảm bảo dữ liệu Thống kê luôn mới nhất
app.set("etag", false);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

// ✅ Middleware Log để Debug lỗi "data: []"
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

/* ================= ROUTES ================= */

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PETCAREX API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/cart", cartRoutes); 
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);

/* ================= ERROR HANDLER ================= */
app.use('/api/staff', staffRoutes)
app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();