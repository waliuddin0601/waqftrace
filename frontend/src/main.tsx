import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// HashRouter (not BrowserRouter) because GitHub Pages is a static host with no
// server-side rewrite rule — a direct link or refresh on a sub-route like /report
// would 404 without one. Hash routes (#/report) never hit the server for the path.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
