// src/components/website/PublicShell.jsx
import React from "react";
// IMPORTANT: import the scoped CSS here (not in App.js)
import "../../assets/css/style.css";

export default function PublicShell({ children }) {
  return <div className="public-site">{children}</div>;
}
