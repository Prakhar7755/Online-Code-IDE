import express from "express";
import {
  signup,
  login,
  createProject,
  saveProject,
  getProjects,
  getProject,
  deleteProject,
  editProject,
  getAPIRuntime,
  executeAPI,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// router.get("/test", (req, res) => {
//   res.json({ message: "Test passed!" });
// });

// Apply rate limiting to signup and login
router.post("/signup", rateLimiter, signup);
router.post("/login", rateLimiter, login);

// Protect routes that require authentication
router.post("/createProject", authenticateToken, createProject);
router.put("/saveProject", authenticateToken, saveProject);
router.get("/project", authenticateToken, getProjects);
router.get("/project/:id", authenticateToken, getProject);
router.delete("/deleteProject", authenticateToken, deleteProject);
router.put("/editProject", authenticateToken, editProject);

router.get("/runtimes", authenticateToken, getAPIRuntime);

// Apply rate limiting on execute since it's a heavy operation
router.post("/execute", authenticateToken, rateLimiter, executeAPI);

export default router;
