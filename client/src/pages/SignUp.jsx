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
  <div className="con flex flex-col items-center justify-center min-h-screen px-4">
    <form
      onSubmit={submitForm}
      className="w-full max-w-md h-auto flex flex-col items-center bg-[#0f0e0e] p-6 rounded-lg shadow-xl shadow-black/50"
    >
      <img className="w-40 sm:w-[230px] object-cover" src={logo} alt="logo" />

      {/* FULL NAME INPUT */}
      <div className="inputBox w-full mt-4">
        <input
          type="text"
          name="fullname"
          aria-label="Full Name"
          placeholder="Full Name"
          required
          value={fullname}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full"
        />
      </div>

      {/* EMAIL INPUT */}
      <div className="inputBox w-full mt-4">
        <input
          type="email"
          name="email"
          aria-label="Email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
      </div>

      {/* PASSWORD INPUT */}
      <div className="inputBox w-full mt-4">
        <input
          type="password"
          name="password"
          aria-label="Password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
      </div>

      <p className="text-gray-400 text-sm mt-3 self-start w-full">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>

      <input
        type="submit"
        disabled={loading}
        value={loading ? "Signing Up..." : "Sign Up"}
        className={`btnNormal mt-4 bg-blue-500 transition-all hover:bg-blue-600 w-full ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    </form>
  </div>
);

};

export default SignUp;
