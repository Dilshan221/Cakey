// src/components/website/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="website-container container-fluid">
      <Header />
      <div className="row">
        <div id="content" className="col-md-10 split">
          <Outlet /> {/* children from nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
