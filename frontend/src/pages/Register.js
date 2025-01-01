import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css"; // Import the CSS file

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validateInput = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

        if (username.length < 5) {
            setError("Username must be at least 5 characters long.");
            return false;
        }
        if (!passwordRegex.test(password)) {
            setError(
                "Password must be at least 6 characters, include an uppercase letter, a number, and a special character."
            );
            return false;
        }
        setError("");
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateInput()) return;

        try {
            const res = await axios.post("http://localhost:8000/api/auth/register", {
                username,
                password,
            });
            setSuccess(res.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data.message || "Error registering user.");
        }
    };

    return (
        <div className="register-container">
            <h1>Register</h1>
            <form onSubmit={handleRegister} className="register-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="register-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="register-input"
                />
                <button type="submit" className="register-button">
                    Register
                </button>
                {error && <p className="register-error">{error}</p>}
                {success && <p className="register-success">{success}</p>}
            </form>
            <p className="register-footer">
                Already have an account?{" "}
                <a href="/login" className="register-link">
                    Login here
                </a>
            </p>

        </div>
    );
};

export default Register;
