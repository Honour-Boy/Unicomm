const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

// Allowed CORS origins come from env (comma-separated) so the deployed frontend
// and local dev both work without code edits. Defaults to local Vite.
// e.g. CORS_ORIGIN=https://unicomm-2d7bc.web.app,http://localhost:5173
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check — lets the host (Render) and monitors verify the service is up.
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api", authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
