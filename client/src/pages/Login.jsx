import { useState } from "react";
import logo from "/image.png";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { API_BASE_URL } from "../helper.js";
import api from "../lib/axios.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const res = await fetch(API_BASE_URL + "/login", {
      //   mode: "cors",
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email: email.trim(),
      //     password,
      //   }),
      // });

      // const data = await res.json();

      const res = await api.post(
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
        // window.location.reload();
        // window.location.href = "/";
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="con flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={submitForm}
        className="w-[25vw] max-w-full h-auto flex flex-col items-center bg-[#0f0e0e] p-5 rounded-lg shadow-xl shadow-black/50"
      >
        <img className="w-[230px] object-cover" src={logo} alt="logo" />

        {/* EMAIL INPUT */}
        <div className="inputBox">
          <input
            type="email"
            name="email"
            aria-label="Email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="inputBox">
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <p className="text-gray-400 text-sm mt-3 self-start">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`btnNormal mt-3 bg-blue-500 transition-all hover:bg-blue-600 ${
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
