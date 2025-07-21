import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.js";
import MonacoEditor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/axios.js";
import { AxiosError } from "axios";

interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    output?: string; // not always
  };
}

type SupportedLanguage =
  | "python"
  | "java"
  | "javascript"
  | "c"
  | "cpp"
  | "bash";

interface ProjectData {
  name: string;
  projectLanguage: SupportedLanguage;
  version: string;
  code: string;
  // space for other properties
}

const Editor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [running, setRunning] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>();

  // Fetch project on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get<{
          success: boolean;
          project: ProjectData;
          message?: string;
        }>(`/project/${id}`, {
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
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error("Error fetching project via Axios:", err);
          toast.error(err.message || "Failed to load/fetch project.");
        } else {
          console.error("Error fetching project:", err);
          toast.error("Failed to load project.");
        }
      }
    };

    fetchProject();
  }, [id]);

  // Save project to backend
  const saveProject = useCallback(async () => {
    try {
      const trimmedCode = code.trim();

      const res = await api.put<{
        success: boolean;
        message?: string;
      }>(
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
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("Error Saving project via Axios:", err);
        toast.error(err.message || "Failed to save the project.");
      } else {
        console.error("Error saving project:", err);
        toast.error("Failed to save project.");
      }
    }
  }, [code, id]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveProject]);

  const extensionMap: Record<SupportedLanguage, string> = {
    python: ".py",
    java: ".java",
    javascript: ".js",
    c: ".c",
    cpp: ".cpp",
    bash: ".sh",
  };

  // Run code using Piston API
  const runProject = async () => {
    if (!projectData) {
      toast.error("Project data not loaded yet.");
      return;
    }

    setRunning(true);

    try {
      const extension = extensionMap[projectData.projectLanguage];
      const filename = `${projectData.name}${extension}`;

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

      const data: PistonResponse = await res.json();

      if (data && data.run) {
        setOutput(data.run.output ?? data.run.stdout ?? "");
        setError(data.run.code !== 0);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to run the project:", err);
      toast.error(errorMessage);
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
            language={projectData?.projectLanguage ?? "python"}
            value={code}
            onChange={(newCode) => {
              setCode(newCode ?? "");
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
