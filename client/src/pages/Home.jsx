import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
// import { API_BASE_URL } from "../helper.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import axios from "axios";
import api from "../lib/axios.js";

const Home = () => {
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null); // State to store selected language

  const [isEditModelShow, setIsEditModelShow] = useState(false);

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#000",
      borderColor: "#555",
      color: "#fff",
      padding: "5px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#000",
      color: "#fff",
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#333" : "#000",
      color: "#fff",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#aaa",
    }),
  };

  const getRunTimes = async () => {
    let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    let data = await res.json();
    // const res = await axios.get("https://emkc.org/api/v2/piston/runtimes");
    // const res = await api.get("/runtimes", {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   },
    // });
    // console.log(res);
    // const data = res.data;

    // Filter only the required languages
    const filteredLanguages = [
      "python",
      "javascript",
      "c",
      "c++",
      "java",
      "bash",
    ];

    const options = data
      .filter((runtime) => filteredLanguages.includes(runtime.language))
      .map((runtime) => ({
        label: `${runtime.language} (${runtime.version})`,
        value: runtime.language === "c++" ? "cpp" : runtime.language,
        version: runtime.version,
      }));

    setLanguageOptions(options);
  };

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption); // Update selected language state
    console.log("Selected language:", selectedOption);
  };

  const [projects, setProjects] = useState(null);

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
    } catch (error) {
      console.error("❌ getProjects Error:", error.message);
      toast.error("An error occurred while fetching projects.");
    }
  };

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  const createProject = async () => {
    try {
      const res = await api.post(
        "/createProject",
        {
          name: name,
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
        navigate("/editor/" + data.projectId);
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to create project.");
      }
    } catch (error) {
      console.error("❌ createProject Error:", error.message);
      toast.error("An error occurred while creating the project.");
    }
  };

  const deleteProject = async (id) => {
    const conf = confirm(" ⚠️ Are you sure you want to delete this project?");
    if (!conf) return;

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const [editProjId, setEditProjId] = useState("");

  const updateProj = async () => {
    try {
      const { data } = await api.put(
        "/editProject",
        {
          projectId: editProjId,
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setIsEditModelShow(false);
        setName("");
        setEditProjId("");
        getProjects();
      } else {
        toast.error(data.message);
        setIsEditModelShow(false);
        setName("");
        setEditProjId("");
        getProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
      setIsEditModelShow(false);
      setName("");
      setEditProjId("");
      getProjects();
    }
  };

  const getLanguageIcon = (lang) => {
    if (!lang) return "";
    const normalizedLang = lang.toLowerCase().replace("c++", "cpp");

    const icons = {
      python: "/languages/python.png",
      javascript: "/languages/js.png",
      cpp: "/languages/CPP.png",
      c: "/languages/c.png",
      java: "/languages/java.png",
      bash: "/languages/bash.png",
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
          onClick={() => setIsCreateModelShow(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Project
        </button>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-10">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div
              // key={index}
              key={project._id}
              className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0f0e0e] p-4 rounded-lg shadow mb-4"
            >
              {/* Project Info */}
              <div
                onClick={() => navigate("/editor/" + project._id)}
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

                  <p className="text-sm text-gray-400">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-gray-500">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditModelShow(true);
                    setEditProjId(project._id);
                    setName(project.name);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(project._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
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
      {isCreateModelShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsCreateModelShow(false);
              setName("");
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
            />
            {selectedLanguage && (
              <>
                <p className="text-sm text-green-500 mt-2">
                  Selected Language: {selectedLanguage.label}
                </p>
                <button
                  onClick={createProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4 transition"
                >
                  Create
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModelShow && (
        <div
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsEditModelShow(false);
              setName("");
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
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
