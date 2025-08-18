import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Select, { SingleValue } from "react-select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";
import { AxiosError } from "axios";

interface LanguageOption {
  label: string;
  value: string;
  version: string;
}

interface Project {
  _id: string;
  name: string;
  projectLanguage: string;
  createdAt: string;
  updatedAt: string;
}

const Home: React.FC = () => {
  const [isCreateModalShow, setIsCreateModalShow] = useState(false);
  const [isEditModalShow, setIsEditModalShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [editProjId, setEditProjId] = useState<string>("");

  const navigate = useNavigate();

  // Styles for react-select
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#000",
      borderColor: "#555",
      color: "#fff",
      padding: "5px",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#000",
      color: "#fff",
      width: "100%",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#333" : "#000",
      color: "#fff",
      cursor: "pointer",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#aaa",
    }),
  };

  // Fetch runtimes from Piston API and filter relevant languages
  const getRunTimes = async () => {
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/runtimes");
      const data = await res.json();

      const filteredLanguages = [
        "python",
        "javascript",
        "c",
        "c++",
        "java",
        "bash",
      ];

      const options = data
        .filter((runtime: any) => filteredLanguages.includes(runtime.language))
        .map((runtime: any) => ({
          label: `${runtime.language} (${runtime.version})`,
          value: runtime.language === "c++" ? "cpp" : runtime.language,
          version: runtime.version,
        }));

      setLanguageOptions(options);
    } catch (error) {
      console.error("Failed to fetch runtimes:", error);
      toast.error("Failed to load language runtimes.");
    }
  };

  // Fetch user's projects
  const getProjects = async () => {
    try {
      const res = await api.get("/project", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = res.data;

      if (data.success) {
        setProjects(data.projects);
      } else {
        toast.error(data.message || "Failed to fetch projects.");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("❌ getProjects Error via Axios:", err);
        toast.error(
          err.message || "An error occurred while fetching projects."
        );
      } else {
        console.error("❌ getProjects Error:", err);
        toast.error("An error occurred while fetching projects.");
      }
    }
  };

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  // Handle language selection change
  const handleLanguageChange = (option: SingleValue<LanguageOption>) => {
    setSelectedLanguage(option);
  };

  // Create new project
  const createProject = async () => {
    if (!selectedLanguage) {
      toast.error("Please select a language.");
      return;
    }
    if (name.trim().length < 3 || name.trim().length > 20) {
      toast.error("Project name must be between 3 and 20 characters.");
      return;
    }

    try {
      const res = await api.post(
        "/createProject",
        {
          name: name.trim(),
          projectLanguage: selectedLanguage.value,
          version: selectedLanguage.version,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.success) {
        setName("");
        setSelectedLanguage(null);
        setIsCreateModalShow(false);
        navigate(`/editor/${data.projectId}`);
      } else {
        toast.error(data.message || "Failed to create project.");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // safe access
        console.error("❌ createProject Error via Axios:", err);
        toast.error(
          err.message || "An error occurred while creating the project."
        );
      } else {
        console.error("❌ createProject Error:", err);
        toast.error("An error occurred while creating the project.");
      }
    }

   
  };

  // Delete a project
  const deleteProject = async (id: string) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this project?"))
      return;

    try {
      const { data } = await api.delete("/deleteProject", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: {
          projectId: id,
        },
      });

      if (data.success) {
        getProjects();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  // Update project name
  const updateProj = async () => {
    if (name.trim().length === 0) {
      toast.error("Project name cannot be empty.");
      return;
    }

    try {
      const { data } = await api.put(
        "/editProject",
        {
          projectId: editProjId,
          name: name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setIsEditModalShow(false);
        setName("");
        setEditProjId("");
        getProjects();
        toast.success("Project updated successfully.");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update project");
    } finally {
      setIsEditModalShow(false);
      setName("");
      setEditProjId("");
    }
  };

  // Get language icon URL
  const getLanguageIcon = (lang: string) => {
    if (!lang) return "";
    const normalizedLang = lang.toLowerCase().replace("c++", "cpp");

    const icons: Record<string, string> = {
      python: "/languages/python.webp",
      javascript: "/languages/js.webp",
      cpp: "/languages/CPP.webp",
      c: "/languages/c.webp",
      java: "/languages/java.webp",
      bash: "/languages/bash.webp",
    };

    return icons[normalizedLang] || "";
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mt-6 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">
          Welcome to Your Workplace
        </h3>
        <button
          onClick={() => setIsCreateModalShow(true)}
          className="bg-blue-700 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Project
        </button>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-10">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project._id}
              className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0f0e0e] p-4 rounded-lg shadow mb-4"
            >
              {/* Project Info */}
              <div
                onClick={() => navigate(`/editor/${project._id}`)}
                className="flex items-center gap-4 cursor-pointer w-full"
              >
                <img
                  src={getLanguageIcon(project.projectLanguage)}
                  alt={project.projectLanguage}
                  className="w-[120px] h-[90px] object-contain rounded"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-300">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-300">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditModalShow(true);
                    setEditProjId(project._id);
                    setName(project.name);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(project._id)}
                  className="bg-red-700 hover:bg-red-500 text-white px-4 py-2 rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white text-center mt-10">No Projects Found!</p>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalShow && (
        <div
          onClick={(e) => {
            if ((e.target as Element).classList.contains("modelCon")) {
              setIsCreateModalShow(false);
              setName("");
              setSelectedLanguage(null);
            }
          }}
          className="modelCon fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-[#0f0e0e] rounded-lg p-6 w-[90%] sm:w-[400px]">
            <h3 className="text-xl font-bold text-white mb-4">
              Create Project
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your project name (Length 3-20)"
              maxLength={20}
              minLength={3}
              className="w-full mb-4 px-4 py-2 rounded-md border border-gray-300 text-white"
            />
            <Select
              placeholder="Select a Language"
              options={languageOptions}
              styles={customStyles}
              onChange={handleLanguageChange}
              value={selectedLanguage}
              isClearable
            />
            {selectedLanguage && (
              <button
                onClick={createProject}
                className="bg-blue-700 hover:bg-blue-500 text-white px-4 py-2 rounded-md mt-4 transition"
              >
                Create
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalShow && (
        <div
          onClick={(e) => {
            if ((e.target as Element).classList.contains("modelCon")) {
              setIsEditModalShow(false);
              setName("");
              setEditProjId("");
            }
          }}
          className="modelCon fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-[#0f0e0e] rounded-lg p-6 w-[90%] sm:w-[400px]">
            <h3 className="text-xl font-bold text-white mb-4">
              Update Project
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your project name"
              className="w-full mb-4 px-4 py-2 rounded-md border border-gray-300 text-white"
            />
            <button
              onClick={updateProj}
              className="bg-blue-700 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
