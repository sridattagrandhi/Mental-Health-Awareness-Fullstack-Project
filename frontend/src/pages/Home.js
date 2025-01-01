import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to the Mental Health Support Platform</h1>
            <p>
                Your safe space for mood tracking, forums, and self-care resources.
                Join us in fostering mental well-being for everyone.
            </p>
            <div className="home-buttons">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        </div>
    );
}

export default Home;
