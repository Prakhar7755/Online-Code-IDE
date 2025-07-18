import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import MonacoEditor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";
// import axios from "axios";

const Editor = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [running, setRunning] = useState(false);

  const { id } = useParams();

  // Fetch project on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // const res = await fetch(`${API_BASE_URL}/project/${id}`, {
        //   method: "GET",
        //   mode: "cors",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        //   // body: JSON.stringify({
        //   //   // token: localStorage.getItem("token"),
        //   //   projectId: id,
        //   // }),
        // });
        // const data = await res.json();

        const res = await api.get(`/project/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = res.data;

        if (data.success) {
          setCode(data.project.code);
          setProjectData(data.project);
        } else {
          toast.error(data.message || "Failed to fetch project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        toast.error(err.message || "Failed to load project.");
      }
    };

    fetchProject();
  }, [id]);

  // Save project to backend
  const saveProject = useCallback(async () => {
    try {
      const trimmedCode = code?.toString().trim();

      const res = await api.put(
        "/saveProject",
        {
          projectId: id,
          code: trimmedCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Data saved successfully");
      } else {
        toast.error(data.message || "Failed to save the code");
      }
    } catch (err) {
      console.error("Error Saving project:", err);
      toast.error(err.message || "Failed to save the project.");
    }
  }, [code, id]);

  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveProject]);

  // Run code using Piston API
  const runProject = async () => {
    if (!projectData) {
      toast.error("Project data not loaded yet.");
      return;
    }

    setRunning(true);

    try {
      const extensionMap = {
        python: ".py",
        java: ".java",
        javascript: ".js",
        c: ".c",
        cpp: ".cpp",
        bash: ".sh",
      };

      const extension = extensionMap[projectData.projectLanguage] || "";
      const filename = projectData.name + extension;

      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: projectData.projectLanguage,
          version: projectData.version,
          files: [
            {
              filename,
              content: code,
            },
          ],
        }),
      });

      const data = await res.json();
      // const res = await api.post(
      //   "/execute",
      //   {
      //     language: projectData.projectLanguage,
      //     version: projectData.version,
      //     files: [
      //       {
      //         filename,
      //         content: code,
      //       },
      //     ],
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   }
      // );
      // console.log(res);

      // const data = res.data;

      if (data) {
        setOutput(data?.run?.output || "");
        setError(data?.run?.code === 1);
        setError(data?.run?.code !== 0);
      }
    } catch (err) {
      console.error("Failed to run the project:", err);
      toast.error(err.message || "Failed to run the project.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex flex-col md:flex-row gap-6 m-6 h-[calc(100vh-90px-3rem)]">
        {/* Left: Code Editor */}
        <section
          className="md:w-1/2 h-96 md:h-full border border-gray-700 rounded-lg shadow-lg overflow-hidden"
          aria-label="Code editor panel"
        >
          <MonacoEditor
            theme="vs-dark"
            height="100%"
            width="100%"
            language={projectData?.projectLanguage || "python"}
            value={code}
            onChange={(newCode) => {
              setCode(newCode || "");
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              lineNumbers: "on",
              automaticLayout: true,
            }}
            aria-label="Code editor"
          />
        </section>

        {/* Right: Output Panel */}
        <aside
          className="md:w-1/2 p-6 bg-gray-900 text-white flex flex-col rounded-lg shadow-lg border border-gray-700"
          aria-live="polite"
          aria-label="Code output panel"
        >
          <header className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4 px-2 md:px-6">
            <h2 className="text-lg font-semibold">Output</h2>
            <div className="flex gap-3">
              <button
                type="button"
                className="btnNormal px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={runProject}
                disabled={running}
                aria-disabled={running}
                aria-live="assertive"
              >
                {running ? "Running..." : "Run"}
              </button>
              <button
                type="button"
                onClick={saveProject}
                className="btnNormal px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Save
              </button>
            </div>
          </header>

          <pre
            className={`flex-grow overflow-auto whitespace-pre-wrap rounded-md p-4 font-mono text-sm leading-relaxed ${
              error ? "text-red-500" : "text-gray-300"
            } bg-gray-800`}
            tabIndex={0}
          >
            {output || "Output will appear here..."}
          </pre>
        </aside>
      </main>
    </>
  );
};

export default Editor;
