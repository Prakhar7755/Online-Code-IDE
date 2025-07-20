import logo from "/image.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import api from "../lib/axios.js";

const SignUp = () => {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const res = await fetch(API_BASE_URL + "/signup", {
      //   mode: "cors",
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     fullname: fullname.trim(),
      //     email: email.trim(),
      //     password,
      //   }),
      // });

      // const data = await res.json();

      const res = await api.post("/signup", {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
      });

      const data = res.data;

      if (data.success) {
        toast.success("Account created successfully, Now you can login!");
        console.log("Account created for:", email);
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to create the account");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.message || "Something went wrong during signup.");
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
      />

      {/* FULL NAME INPUT */}
      <div className="w-full mb-4">
        <input
          type="text"
          name="fullname"
          aria-label="Full Name"
          placeholder="Full Name"
          required
          value={fullname}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

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

      {/* PASSWORD INPUT */}
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
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>

      <input
        type="submit"
        disabled={loading}
        value={loading ? "Signing Up..." : "Sign Up"}
        className={`w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    </form>
  </div>
);

};

export default SignUp;
