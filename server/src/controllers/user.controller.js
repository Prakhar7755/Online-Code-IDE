import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";

import { UserModel } from "../models/user.model.js";
import { ProjectModel } from "../models/project.model.js";

function getStartupCode(language) {
  if (!language) return null;

  const lang = language.toLowerCase();

  const codeSnippets = {
    python: 'print("Hello World")',
    java: 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }',
    javascript: 'console.log("Hello World");',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}',
    bash: 'echo "Hello World"',
  };

  return codeSnippets[lang] || null;
}

// JWT SECRET SETUP
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}
const jwtSecret = process.env.JWT_SECRET;

// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;
    if (!email || !password || !fullname) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (process.env.NODE_ENV !== "production") {
      console.log(`Signup attempt for : ${normalizedEmail}`);
    }

    // check for the email's existence
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Email already in use: ${normalizedEmail}`);
      }

      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please use a different one.",
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const user = await UserModel.create({
      email: normalizedEmail,
      fullname: fullname.trim(),
      password: hashedPassword,
    });

    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ Failed to save user to database.");
      }

      return res.status(500).json({
        success: false,
        message: "Unable to create account. Please try again later.",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ User created: ${fullname} (${normalizedEmail})`);
    }

    res.status(201).json({
      success: true,
      message: `Account created successfully 🎉 Welcome, ${fullname}!`,
    });
  } catch (err) {
    console.error("🔥 Error during signup:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (process.env.NODE_ENV !== "production") {
      console.log(`🔐 Login attempt for: ${normalizedEmail}`);
    }

    // check if user exists?
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Login failed: user not found (${normalizedEmail})`);
      }
      return res.status(404).json({
        success: false,
        message:
          "User not found. Please check your email or register for a new account.",
      });
    }

    // check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `⚠️ Login failed: invalid password for ${normalizedEmail}`
        );
      }
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
    }

    // JWT TOKEN CREATION
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "2h",
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ User logged in successfully: ${normalizedEmail}`);
    }

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
    });
  } catch (err) {
    console.error("🔥 Login Error :", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, projectLanguage, version } = req.body;

    // Validate required fields
    if (!name || !projectLanguage || !version) {
      return res.status(400).json({
        success: false,
        message: "'name', 'projectLanguage', and 'version' are required.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    // req.user is set by authenticateToken middleware
    const userId = req.user.userId; // or however your token payload is structured

    // Find user in DB
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please re-authenticate.",
      });
    }

    // Create project
    const project = await ProjectModel.create({
      name: name.trim(),
      projectLanguage,
      createdBy: user._id,
      code: getStartupCode(projectLanguage),
      version: version.trim(),
    });

    if (!project) {
      return res.status(500).json({
        success: false,
        message: "Failed to create project. Please try again later.",
      });
    }

    return res.status(201).json({
      success: true,
      message: `Project '${project.name}' created successfully.`,
      projectId: project._id,
    });
  } catch (err) {
    console.error(err.message || "Error while creating the Project");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const saveProject = async (req, res) => {
  try {
    const { projectId, code } = req.body;

    // Validate required fields
    if (!projectId || !code) {
      return res.status(400).json({
        success: false,
        message: "Both 'projectId' and 'code' are required.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    const { userId } = req.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ User not found while saving the project.");
      }
      return res.status(404).json({
        success: false,
        message: "User not found. Please re-authenticate.",
      });
    }

    // update the project
    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $set: { code } },
      { new: true }
    );

    if (!project) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ Failed to find and update the project.");
      }
      return res.status(404).json({
        success: false,
        message: "Project not found or update failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project '${project.name}' updated successfully.`,
    });
  } catch (err) {
    console.error("🔥 SaveProject Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const getProject = async (req, res) => {
  try {
    const id = req.params.id;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    const { userId } = req.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("⚠️ User not found, please login again.");
      }
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const project = await ProjectModel.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project with id : ${id} fetched successfully`,
      project,
    });
  } catch (err) {
    console.error("🔥 getProject Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const getProjects = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    const { userId } = req.user;
    const user = await UserModel.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("⚠️ User not found, please login again.");
      }
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const { id } = req.query;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid project ID." });
      }

      const project = await ProjectModel.findOne({
        _id: id,
        createdBy: user._id,
      });

      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      }

      return res.status(200).json({
        success: true,
        message: `Project with ID ${id} fetched.`,
        project,
      });
    }

    const projects = await ProjectModel.find({ createdBy: user._id });

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully.",
      projects,
    });
  } catch (err) {
    console.error("🔥 getProjects Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "'projectId' is required.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    const { userId } = req.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ User not found during project deletion.");
      }
      return res.status(404).json({
        success: false,
        message: "User not found. Please re-authenticate.",
      });
    }

    const project = await ProjectModel.findOneAndDelete({
      _id: projectId,
      createdBy: user._id,
    });

    if (!project) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Project not found or already deleted.");
      }
      return res.status(404).json({
        success: false,
        message: "Project not found or you are not authorized.",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `🗑️ Project '${project.name}' deleted by user '${user.fullname}'`
      );
    }
    return res.status(200).json({
      success: true,
      message: `Project '${project.name}' deleted successfully by '${user.fullname}'`,
    });
  } catch (err) {
    console.error("🔥 deleteProject Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

const editProject = async (req, res) => {
  try {
    const { projectId, name } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({
        success: false,
        message: " 'projectId', and 'name' are required.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token payload.",
      });
    }

    const { userId } = req.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ User not found during project update.");
      }
      return res.status(404).json({
        success: false,
        message: "User not found. Please re-authenticate.",
      });
    }

    const project = await ProjectModel.findOne({
      _id: projectId,
      createdBy: user._id,
    });

    if (!project) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Project not found or not owned by the user.");
      }
      return res.status(404).json({
        success: false,
        message: "Project not found or you're not authorized.",
      });
    }

    project.name = name.trim();
    await project.save();

    if (process.env.NODE_ENV !== "production") {
      console.log(`✏️ Project '${project.name}' updated by ${user.email}`);
    }
    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (err) {
    console.error("🔥 editProject Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
};

/* PISTON API FOR RUNNING THE CODE */

const getAPIRuntime = async (req, res) => {
  try {
    const response = await axios.get("https://emkc.org/api/v2/piston/runtimes");
    res.json(response.data);
  } catch (error) {
    console.error("❌ Failed to fetch runtimes:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch runtimes" });
  }
};

const executeAPI = async (req, res) => {
  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Execution error:", error.message);
    res.status(500).json({
      success: false,
      message: "Execution failed",
      error: error.message,
    });
  }
};

export {
  signup,
  login,
  createProject,
  saveProject,
  getProject,
  getProjects,
  deleteProject,
  editProject,
  getAPIRuntime,
  executeAPI,
};
