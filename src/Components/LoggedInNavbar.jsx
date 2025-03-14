// LoggedInNavbar.js
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import Search from "./Search";
import logo from "../assets/Icons/logo.png";

const LoggedInNavbar = () => {
  const { currentUser } = useUser();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.length;

  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="logo" />
          <span>Shammarianas</span>
        </Link>
      </div>
      <Search />
      <div className="right">
        <div className="nav_buttons">
          <Link to="/Cart">
            <button>
              <i className="icon fa-solid fa-shopping-cart"></i>
              {cartCount > 0 && <span className="cart_count">{cartCount}</span>}
            </button>
          </Link>
          <div className="navbar_dropdown">
            <Link to={`/Profile/${currentUser.uid}`}>
              <button className="signed_in">
                <i className="icon fa-solid fa-user"></i>
                <span className="username">{currentUser.displayName || "User"}</span>
              </button>
            </Link>
            <div className="dropdown">
              <ul className="links">
                <li><Link to="/Library">Library</Link></li>
                <li><Link to={`/Profile/${currentUser.uid}`}>Profile</Link></li>
                <li><Link to="/Trade">Trade</Link></li>
                <li><Link to="/Upload">Upload</Link></li>
                <li><Link className="logout" to="/Logout">Logout</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedInNavbar;