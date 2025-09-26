// src/components/Public/PublicLayout.jsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  useEffect(() => {
    const head = document.head;
    const link = document.createElement("link");
    link.id = "public-style";
    link.rel = "stylesheet";
    link.href = `${process.env.PUBLIC_URL}/assets/css/style.public.css`;
    head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <div className="public-container">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
