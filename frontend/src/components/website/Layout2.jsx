import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header2";

const Layout = () => {
  return (
    <div className="website-container container-fluid">
      {/* Row wraps sidebar (in Header2) + content */}
      <div className="row">
        <Header />
        <div id="content" className="col-md-10 split">
          <Outlet /> {/* children from nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
