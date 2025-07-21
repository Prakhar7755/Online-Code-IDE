import { Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Editor from "./pages/Editor";
import "./App.css";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/editor/:id"
        element={isLoggedIn ? <Editor /> : <Navigate to="/login" />}
      />

      {/* 🔧 Temporary placeholder routes */}
      <Route path="/about" element={<NoPage />} />
      <Route path="/services" element={<NoPage />} />
      <Route path="/contact" element={<NoPage />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default App;
