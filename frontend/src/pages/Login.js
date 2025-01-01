import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/auth/login", {
                username,
                password,
            });
    
            const token = res.data.token;
    
            // Save token in localStorage
            localStorage.setItem("auth", token);
            console.log("Token saved to localStorage:", token);
    
            // Update auth state and navigate to dashboard
            setAuth(true);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Error logging in");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleLogin} className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="login-error">{error}</p>}
            </form>
            <p className="login-footer">
                Don't have an account?{" "}
                <a href="/register" className="login-link">
                    Register here
                </a>
            </p>
        </div>
    );
};

export default Login;
