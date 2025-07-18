import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot be more than 20 characters"],
      trim: true,
    },
    projectLanguage: {
      type: String,
      required: true,
      enum: ["python", "java", "javascript", "cpp", "c", "go", "bash"],
       enum: {
        values: ["python", "java", "javascript", "cpp", "c", "go", "bash"],
        message: "{VALUE} is not a supported language",
      },
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      minlength: [1, "Code cannot be empty"],
    },
    createdBy: {
      type: String,
      required: [true, "Creator information is required"],
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
