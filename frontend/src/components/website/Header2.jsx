import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Header2 = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((v) => !v);

  return (
    <>
      {/* Sidebar */}
      <div id="sidebar" className="split col-md-2">
        <div className="affix-sidebar col-md-12">
          <div className="sidebar-nav">
            <div className="navbar navbar-default" role="navigation">
              <div className="navbar-header">
                {/* collapse button (pure React, no jQuery) */}
                <button
                  type="button"
                  className="navbar-toggle"
                  onClick={toggleSidebar}
                  aria-expanded={isCollapsed}
                  aria-controls="sidenav01"
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
              </div>

              {/* nav links */}
              <div
                className={`navbar-collapse ${
                  isCollapsed ? "" : "collapse"
                } sidebar-navbar-collapse`}
                id="sidenav01"
              >
                <ul className="nav navbar-nav">
                  <li>
                    <NavLink to="/" end>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/services">Our Services</NavLink>
                  </li>
                  <li>
                    <NavLink to="/about">About Us</NavLink>
                  </li>
                  <li>
                    <NavLink to="/gallery">Gallery</NavLink>
                  </li>
                  <li>
                    <NavLink to="/menu">Menu</NavLink>
                  </li>
                  <li>
                    <NavLink to="/contact">Contact</NavLink>
                  </li>

                  <li className="dropdown">
                    {/* Make the dropdown toggle a button to avoid page jump */}
                    <button
                      type="button"
                      className="dropdown-toggle"
                      data-toggle="dropdown"
                      onClick={(e) =>
                        e.currentTarget.parentElement.classList.toggle("open")
                      }
                      aria-haspopup="true"
                      aria-expanded="false"
                      style={{ background: "transparent", border: 0 }}
                    >
                      Pages <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <NavLink to="/blog">Blog Home</NavLink>
                      </li>
                      {/* Define this route later or remove the item */}
                      <li>
                        <NavLink to="/blog-single">Blog Single</NavLink>
                      </li>
                      <li>
                        <NavLink to="/elements">Elements page</NavLink>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
              {/*/.nav-collapse */}
            </div>
            {/*/navbar */}
          </div>
          {/*/sidebar-nav */}

          {/* Sidebar info */}
          <div className="navbar-info hidden-sm hidden-xs hidden-md">
            <p className="small-text">
              <i className="fas fa-map-marker-alt margin-icon"></i>
              496/6 Anurapura Rd, Damulla
            </p>
            <p className="small-text">
              <i className="fas fa-phone margin-icon"></i>(+94) 77-123-4567
            </p>
            <p className="small-text">
              <i className="far fa-clock margin-icon"></i>Mon–Sat: 9am–5pm
            </p>
            <div className="social-media">
              <a href="#" title="Email" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" title="Facebook" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        {/* /affix-sidebar */}
      </div>
    </>
  );
};

export default Header2;
