/**
 * Here's what this is for:
 * Puts the React app on the page and turns on routing and login state so every screen can share them.
 *
 * How it fits in:
 * This file runs first when you open the Trash-to-Points web app. Everything else loads under it.
 *
 * Why it matters:
 * Without it you’d see a blank page, and “who is logged in?” wouldn’t work across different URLs.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
