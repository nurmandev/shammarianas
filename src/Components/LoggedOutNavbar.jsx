"use client";
import React, { useEffect } from "react";

import { NavLink, Link } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import { useLocation } from "react-router-dom";
function Navbar() {
  const { currentUser } = useUser();

  const cart = JSON.parse(localStorage.getItem("cart"));

  if (cart) {
    var cartCount = cart.length;
  }

  const currentPage = useLocation().pathname;

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
  return (
    <nav className="navbar navbar-expand-lg bord blur">
      <div className="container o-hidden">
        <a className="logo icon-img-100" href="#">
          <img src="/assets/imgs/logo.png" alt="logo" />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={handleToggleNav}
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
                className="nav-link"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="rolling-text">Home</span>
              </a>
            </li>
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
            </li>
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
          <a
            href="#login"
            className="butn butn-sm butn-bg main-colorbg radius-5"
          >
            <span className="text">Account</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
