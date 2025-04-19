"use client";
import React, { useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import Search from "./Search";
import logo from "../assets/Icons/logo.png";

const Navbar = () => {
  const { currentUser } = useUser() || "";
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;
  const currentPage = useLocation().pathname;

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 300) navbar?.classList.add("nav-scroll");
      else navbar?.classList.remove("nav-scroll");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navbar

  function handleScroll() {
    const bodyScroll = window.scrollY;
    const navbar = document.querySelector(".navbar");

    if (bodyScroll > 300) navbar.classList.add("nav-scroll");
    else navbar.classList.remove("nav-scroll");
  }
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  function handleDropdownMouseMove(event) {
    event.currentTarget.querySelector(".dropdown-menu").classList.add("show");
  }

  function handleDropdownMouseLeave(event) {
    event.currentTarget
      .querySelector(".dropdown-menu")
      .classList.remove("show");
  }
  function handleToggleNav() {
    if (
      document
        .querySelector(".navbar .navbar-collapse")
        .classList.contains("show")
    ) {
      document
        .querySelector(".navbar .navbar-collapse")
        .classList.remove("show");
    } else if (
      !document
        .querySelector(".navbar .navbar-collapse")
        .classList.contains("show")
    ) {
      document.querySelector(".navbar .navbar-collapse").classList.add("show");
    }
  }
  // If user is NOT logged in
  if (!currentUser) {
    return (
      <>
        <nav className="navbar navbar-expand-lg bord blur">
          <div className="container o-hidden">
            <a className="logo icon-img-100" href="#">
              <img src="/assets/imgs/logo.png" className="logo" alt="logo" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              onClick={() =>
                document
                  .querySelector(".navbar .navbar-collapse")
                  ?.classList.toggle("show")
              }
            >
              <span className="icon-bar">
                <i className="fas fa-bars"></i>
              </span>
            </button>
            <div
              className="collapse navbar-collapse justify-content-center"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav">
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link dropdown-toggle"
                    data-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Home</span>
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#about">
                        About us
                      </a>
                    </li>
                  </ul>
                </li>
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link"
                    href="#stock"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Stock</span>
                  </a>
                </li>
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link"
                    href="#services"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Services</span>
                  </a>
                </li>
                {/* <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link dropdown-toggle"
                    data-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Services</span>
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#hot">
                        Hot
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Printable">
                        Printable
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Models">
                        Models
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Textures">
                        Textures
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Scripts">
                        Scripts
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Shaders">
                        Shaders
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#Plugins">
                        Plugins
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#HDRIs">
                        HDRIs
                      </a>
                    </li>
                  </ul>
                </li> */}
                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link"
                    href="#portfolio"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Portfolio</span>
                  </a>
                </li>

                <li
                  onMouseLeave={handleDropdownMouseLeave}
                  onMouseMove={handleDropdownMouseMove}
                  className="nav-item dropdown"
                >
                  <a
                    className="nav-link"
                    href="#blog"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="rolling-text">Blogs</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact">
                    <span className="rolling-text">Contact Us</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="contact-button">
              <Link
                to="/login"
                className="butn butn-sm butn-bg main-colorbg radius-5"
              >
                <span className="text">Sign In</span>
              </Link>
            </div>
          </div>
        </nav>

        {["/stock"].includes(currentPage) && (
          <div className="bottom-bar">
            <div className="links">
              <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
                {[
                  { path: "/hot", label: "Hot" },
                  { path: "/Videos", label: "Videos" },
                  { path: "/Models", label: "3D Models" },
                  { path: "/templates", label: "Video Template" },
                  { path: "/images", label: "Pictures" },
                  { path: "/graphics", label: "Graphic Templates" },
                  { path: "/Mockups", label: "Mockups" },
                  { path: "/Fonts", label: "Fonts" },
                  { path: "/More", label: "More" },
                ].map(({ path, icon, label }) => {
                  if (label == "More") {
                    return (
                      <nav
                        key={path}
                        style={{ position: "relative" }}
                        className="navbar navbar-expand-lg"
                      >
                        <div className="">
                          <div
                            className="collapse navbar-collapse justify-content-center"
                            id="navbarSupportedContent"
                          >
                            <span className="navbar-nav">
                              <li
                                onMouseLeave={handleDropdownMouseLeave}
                                onMouseMove={handleDropdownMouseMove}
                                className="nav-item dropdown"
                              >
                                <p
                                  className="nav-link dropdown-toggle"
                                  data-toggle="dropdown"
                                  href="#"
                                  role="button"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <span
                                    style={{ marginTop: "3px" }}
                                    className="rolling-text"
                                  >
                                    More
                                  </span>
                                </p>
                                <ul
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                  className="dropdown-menu"
                                >
                                  {[
                                    { label: "Icons", href: "#icons" },
                                    { label: "Textures", href: "#Textures" },
                                    { label: "Scripts", href: "#Scripts" },
                                    { label: "Plugins", href: "#Plugins" },
                                    { label: "HDRIs", href: "#HDRIs" },

                                    // { label: "Printable", href: "#Printable" },
                                    // { label: "Models", href: "#" },
                                    // { label: "Shaders", href: "#Shaders" },
                                  ].map(({ label, href }) => (
                                    <li key={href}>
                                      <a className="dropdown-item" href={href}>
                                        {label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            </span>
                          </div>
                        </div>
                      </nav>
                    );
                  }
                  return (
                    <li key={path}>
                      <NavLink
                        className={({ isActive }) =>
                          isActive ? "active" : undefined
                        }
                        to={path}
                      >
                        <i className={`fa-solid ${icon}`}></i>
                        {label}
                      </NavLink>
                    </li>
                  );
                })}
                {/* Separate Navigation Bar */}
              </ul>
            </div>

            <div className="buttons">
              {/* <Link to="/Upload">
               <button>
                 <i className="icon fa-solid fa-plus"></i> Upload
               </button>
             </Link> */}

              <Link to={currentUser?.uid ? "/Trade" : "/Login"}>
                <button>
                  <i className="icon fa-solid fa-right-left"></i> Trade
                </button>
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="navbar navbar-expand-lg bord blur">
        {/* <nav className="navbar navbar-expand-lg bord blur"> */}

        <a className="logo icon-img-100" href="#">
          <img src="/assets/imgs/logo.png" className="logo" alt="logo" />
        </a>
        <Link to="stock">
          <div className="ml-auto vi-more">
            <a href="#stock" className="butn butn-sm butn-bord radius-30">
              <span>Explore</span>
            </a>
            <span className="icon ti-arrow-top-right"></span>
          </div>
        </Link>
        <Search />
        <div className="right">
          <div className="nav_buttons">
            <Link to="/Cart">
              <button>
                <i className="icon fa-solid fa-shopping-cart"></i>
                {cartCount > 0 && (
                  <span className="cart_count">{cartCount}</span>
                )}
              </button>
            </Link>
            <div className="navbar_dropdown">
              {currentUser?.uid ? (
                <Link to={`/Profile/${currentUser?.uid}`}>
                  <button className="signed_in">
                    <i className="icon fa-solid fa-user"></i>
                    <span className="username">
                      {currentUser?.displayName || "User"}
                    </span>
                  </button>
                </Link>
              ) : (
                <Link to="/Login">
                  <button className="">Sign In</button>
                </Link>
              )}

              <div className={currentUser?.uid ? "dropdown" : "hidden none"}>
                <ul className="links">
                  <li>
                    <Link to="/MyDownloads">My Downloads</Link>
                  </li>
                  <li>
                    {/* <Link to="/Library">My Library</Link> */}
                    <Link to="/Favorites">My Favorites</Link>
                  </li>

                  <li>
                    <Link to={`/Profile/${currentUser?.uid}`}>Profile</Link>
                  </li>
                  <li>
                    <Link to="/Trade">Trade</Link>
                  </li>
                  <li>
                    <Link to="/Upload">Upload</Link>
                  </li>
                  <li>
                    <Link to="/Support">Support</Link>
                  </li>
                  <li>
                    <Link className="logout" to="/Logout">
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!["/", "/Login", "/Upload", "/reset"].includes(currentPage) && (
        <div className="bottom-bar">
          <div className="links">
            <ul style={{ whiteSpace: "nowrap", alignItems: "center" }}>
              {[
                { path: "/hot", label: "Hot" },
                { path: "/Videos", label: "Videos" },
                { path: "/Models", label: "3D Models" },
                { path: "/templates", label: "Video Template" },
                { path: "/images", label: "Pictures" },
                { path: "/graphics", label: "Graphic Templates" },
                { path: "/Mockups", label: "Mockups" },
                { path: "/Fonts", label: "Fonts" },
                { path: "/More", label: "More" },
              ].map(({ path, icon, label }) => {
                if (label == "More") {
                  return (
                    <nav
                      key={path}
                      style={{ position: "relative" }}
                      className="navbar navbar-expand-lg"
                    >
                      <div className="">
                        <div
                          className="collapse navbar-collapse justify-content-center"
                          id="navbarSupportedContent"
                        >
                          <span className="navbar-nav">
                            <li
                              onMouseLeave={handleDropdownMouseLeave}
                              onMouseMove={handleDropdownMouseMove}
                              className="nav-item dropdown"
                            >
                              <p
                                className="nav-link dropdown-toggle"
                                data-toggle="dropdown"
                                href="#"
                                role="button"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <span
                                  style={{ marginTop: "3px" }}
                                  className="rolling-text"
                                >
                                  More
                                </span>
                              </p>
                              <ul
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                                className="dropdown-menu"
                              >
                                {[
                                  { label: "Icons", href: "#icons" },
                                  { label: "Textures", href: "#Textures" },
                                  { label: "Scripts", href: "#Scripts" },
                                  { label: "Plugins", href: "#Plugins" },
                                  { label: "HDRIs", href: "#HDRIs" },

                                  // { label: "Printable", href: "#Printable" },
                                  // { label: "Models", href: "#" },
                                  // { label: "Shaders", href: "#Shaders" },
                                ].map(({ label, href }) => (
                                  <li key={href}>
                                    <a className="dropdown-item" href={href}>
                                      {label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          </span>
                        </div>
                      </div>
                    </nav>
                  );
                }
                return (
                  <li key={path}>
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? "active" : undefined
                      }
                      to={path}
                    >
                      <i className={`fa-solid ${icon}`}></i>
                      {label}
                    </NavLink>
                  </li>
                );
              })}
              {/* Separate Navigation Bar */}
            </ul>
          </div>

          <div className="buttons">
            {/* <Link to="/Upload">
              <button>
                <i className="icon fa-solid fa-plus"></i> Upload
              </button>
            </Link> */}

            <Link to={currentUser?.uid ? "/Trade" : "/Login"}>
              <button>
                <i className="icon fa-solid fa-right-left"></i> Trade
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
