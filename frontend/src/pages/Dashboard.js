import React from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <h1>Welcome to your Dashboard!</h1>
                <div className="dashboard-widgets">
                    <div className="widget">
                        <h3>Your Statistics</h3>
                        <p>View your mood trends and activity stats here.</p>
                    </div>
                    <div className="widget">
                        <h3>Recent Activities</h3>
                        <p>See your latest forum posts and mood logs.</p>
                    </div>
                    <div className="widget">
                        <h3>Quick Links</h3>
                        <ul>
                            <li>Mood Log</li>
                            <li>Forum</li>
                            <li>Settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
