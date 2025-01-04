import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoodTracker from "./components/MoodTracker";
import Dashboard from "./pages/Dashboard";
import Journal from "./components/Journal";
import RecoveryPlan from "./components/RecoveryPlan";
import Chatbot from "./components/Chatbot"; // Import Chatbot

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem("auth");
        setIsAuthenticated(!!auth);
    }, []);

    const ProtectedRoute = ({ children }) => {
        const auth = localStorage.getItem("auth");
        return auth ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Navbar isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />} />
                    <Route path="/login" element={<Navbar isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />} />
                    <Route path="/register" element={<Navbar isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />} />
                </Routes>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mood"
                        element={
                            <ProtectedRoute>
                                <MoodTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/journal"
                        element={
                            <ProtectedRoute>
                                <Journal />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recoveryplan"
                        element={
                            <ProtectedRoute>
                                <RecoveryPlan />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chatbot"
                        element={
                            <ProtectedRoute>
                                <Chatbot />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
