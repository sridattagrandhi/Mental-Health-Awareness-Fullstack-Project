import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("auth"); // Clear authentication
        navigate("/login"); // Redirect to login page
    };

    return (
        <div className="sidebar">
            <h2>Menu</h2>
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/mood">Mood Log</Link>
                </li>
                <li>
                    <Link to="/journal">Journal</Link>
                </li>
                <li>
                    <Link to="/recoveryplan">Recovery Plan</Link> {/* Updated path */}
                </li>
            </ul>
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
