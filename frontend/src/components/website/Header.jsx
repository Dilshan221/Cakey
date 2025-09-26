import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Preloader */}
      <div id="preloader">
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </div>

      {/* Sidebar */}
      <div id="sidebar" className="split col-md-2">
        <div className="affix-sidebar col-md-12">
          <div className="sidebar-nav">
            <div className="navbar navbar-default" role="navigation">
              <div className="navbar-header">
                {/* collapse button */}
                <button
                  type="button"
                  className="navbar-toggle"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                {/* Logo */}
                <div className="brand">
                  <Link to="/">
                    <img
                      src="assets/img/logo.png"
                      alt="Cake & Bake"
                      className="img-responsive center-block"
                    />
                  </Link>
                </div>
                {/* /brand */}
              </div>
              {/* /navbar-header  */}
              <div
                className={`navbar-collapse ${
                  isCollapsed ? "" : "collapse"
                } sidebar-navbar-collapse`}
              >
                <ul className="nav navbar-nav" id="sidenav01">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/services">Our Services</Link>
                  </li>
                  <li>
                    <Link to="/about">About Us</Link>
                  </li>
                  <li>
                    <Link to="/gallery">Gallery</Link>
                  </li>
                  <li>
                    <Link to="/menu">Menu</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
                  </li>
                  <li className="dropdown">
                    <a
                      className="dropdown-toggle"
                      data-toggle="dropdown"
                      href="#"
                    >
                      Pages
                      <span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <Link to="/blog">Blog Home</Link>
                      </li>
                      <li>
                        <Link to="/blog-single">Blog Single</Link>
                      </li>
                      <li>
                        <Link to="/elements">Elements page</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                {/* navbar-nav */}
              </div>
              {/*/.nav-collapse */}
            </div>
            {/*/navbar */}
          </div>
          {/*/sidebar-nav */}
          <div className="navbar-info hidden-sm hidden-xs hidden-md">
            <p className="small-text">
              <i className="fas fa-map-marker-alt margin-icon"></i>496/6
              Anurapura Rd,Damulla
            </p>
            <p className="small-text">
              <i className="fas fa-phone margin-icon"></i>(+94) 77- 123-4567
            </p>
            <p className="small-text">
              <i className="far fa-clock margin-icon"></i>Mon-Sat: 9am-5pm
            </p>
            {/*Social icons */}
            <div className="social-media">
              <a href="#" title="Email">
                <i className="fas fa-envelope"></i>
              </a>
              <a href="#" title="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" title="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" title="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          {/* /navbar-info */}
        </div>
        {/* /affix-sidebar  */}
      </div>
    </>
  );
};

export default Header;
