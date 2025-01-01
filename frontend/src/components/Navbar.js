import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, setAuth }) => {
    const handleLogout = () => {
        setAuth(false); // Update authentication state
        localStorage.removeItem("auth"); // Clear stored auth data
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">Mental Health Support</Link>
            </div>
            <ul className="nav-links">
                {!isAuthenticated ? (
                    // Show these options if NOT logged in
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register" className="register-btn">
                                Register
                            </Link>
                        </li>
                    </>
                ) : (
                    // Show these options if logged in
                    <>
                        <li>
                            <Link to="/mood">Mood Log</Link>
                        </li>
                        <li>
                            <Link to="/forum">Forum</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
