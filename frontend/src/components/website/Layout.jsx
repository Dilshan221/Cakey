import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="website-container container-fluid">
      {/* Top navigation + preloader */}
      <Header />
      <div className="row">
        {/* Sidebar is rendered inside Header; main content goes here */}
        <div id="content" className="col-md-10 split">
          <Outlet /> {/* Renders child routes like Home, About, etc. */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
