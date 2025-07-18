// import logo from "../images/logos/logo.png";
import logo from "/image.png";
import { Link, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../helper.js";
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
    <div className="con flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={submitForm}
        className="w-[25vw] max-w-full h-auto flex flex-col items-center bg-[#0f0e0e] p-5 rounded-lg shadow-xl shadow-black/50"
      >
        <img className="w-[230px] object-cover" src={logo} alt="logo" />

        {/* FULL NAME INPUT */}
        <div className="inputBox">
          <input
            type="text"
            name="fullname"
            aria-label="Full Name"
            placeholder="Full Name"
            required
            value={fullname}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
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

        {/* PASSWORD */}
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
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>

        <input
          type="submit"
          disabled={loading}
          value={loading ? "Signing Up..." : "Sign Up"}
          className={`btnNormal mt-3 bg-blue-500 transition-all hover:bg-blue-600 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </form>
    </div>
  );
};

export default SignUp;
