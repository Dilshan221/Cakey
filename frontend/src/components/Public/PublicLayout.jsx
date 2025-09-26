// src/components/public/PublicLayout.jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  useEffect(() => {
    // Dynamically load scoped CSS
    const head = document.head;

    const makeLink = (id, href) => {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `${process.env.PUBLIC_URL}${href}`;
      return link;
    };

    const style = makeLink("public-style", "/assets/css/style.public.css");
    head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <div className="public-container">
      {/* All public routes/pages will be injected here */}
      <Outlet />
    </div>
  );
}
