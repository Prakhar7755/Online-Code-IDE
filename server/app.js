import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
// import dotenv from "dotenv"
// dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import startServer from "./server.js";
import usersRouter from "./routes/users.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
// import rateLimiter from "./middlewares/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const __dirname = path.resolve();
const clientPath = path.join(__dirname, "../client/dist");

// ---------------------------
// Global Middleware Setup
// ---------------------------
app.use(express.json({ limit: "400kb" }));
app.use(express.urlencoded({ extended: true, limit: "400kb" }));
app.use(cookieParser());
// app.use(rateLimiter); // Rate limiting to prevent abuse
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://emkc.org"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'",
          "'unsafe-eval'",
        ],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "data:"],
        objectSrc: ["'none'"],
      },
    },
  })
);


// ---------------------------
// 2. CORS Setup (Environment Aware)
// ---------------------------
const allowedOrigins = [
  "http://localhost:5001/api/",
  "http://localhost:5173", // dev frontend
  // "https://emkc.org/api/v2/piston",
  process.env.CORS_ORIGIN, // e.g. "https://yourdomain.com"
].filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: function (origin, callback) {
        // console.log("Origin :", origin);
        // development only
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
}

// ---------------------------
// API Route Handlers
// ---------------------------
console.log("Adding users router...");
app.use("/api/users", usersRouter);

// ---------------------------
// 404 Not Found Handler
// ---------------------------
// // Handles unmatched routes and forwards error to error handler
// app.use((req, res, next) => {
//   const error = new Error(`Resource not found: ${req.originalUrl}`);
//   console.error(error);
//   error.status = 404;
//   res.status(404);
//   next(error);
// });

// ---------------------------
// Serve Static Frontend Assets (Production)
// ---------------------------
// Serves the built frontend app and supports client-side routing fallback
if (process.env.NODE_ENV === "production") {
  // 1. Serve all static files (JS, CSS, images) from the 'dist' folder inside 'client'
  // app.use(express.static(path.join(__dirname, "../client/dist")));
  app.use(express.static(clientPath));

  // 2. For any other route that the server doesn’t recognize, send back the main HTML file (index.html)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ---------------------------
// Centralized Error Handling Middleware
// ---------------------------
app.use(errorHandler);

// ---------------------------
// Start Server and Initialize Dependencies
// ---------------------------
startServer(app, PORT);
