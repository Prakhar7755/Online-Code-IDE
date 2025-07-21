import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import api from "../lib/axios.js";
import logo from "/image.png";

interface LoginResponse {
  success: boolean;
  token: string;
  message: string;
}
interface LoginError {
  success: false;
  message: string;
}

type LoginAPIResponse = LoginResponse | LoginError;

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post<LoginAPIResponse>(
        "/login",
        {
          email: email.trim(),
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (data.success) {
        toast.success("Login success");
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");

        navigate("/");
        window.location.reload();

        // or window.location.href = "/";
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // safe access
        console.error("Failed to Login via Axios", err);
        toast.error(err.message || "Failed to Login");
      } else {
        console.error("Unexpected error during Login", err);
        toast.error("Unexpected error occurred during Login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-900">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-[#0f0e0e] p-6 sm:p-8 rounded-lg shadow-xl shadow-black/50 flex flex-col items-center"
      >
        <img
          className="w-32 sm:w-40 lg:w-48 object-contain mb-6"
          src={logo}
          alt="logo"
          loading="lazy"
        />

        {/* EMAIL INPUT */}
        <div className="w-full mb-4">
          <input
            type="email"
            name="email"
            aria-label="Email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="w-full mb-4">
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <p className="text-gray-400 text-sm mb-4 w-full text-left">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
