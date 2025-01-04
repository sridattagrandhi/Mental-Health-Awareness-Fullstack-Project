import React, { useState, useEffect } from "react";
import "./Chatbot.css";
import Sidebar from "./Sidebar";
import axios from "axios";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (currentMessage.trim()) {
            const userMessage = { sender: "user", text: currentMessage };
            setMessages([...messages, userMessage]);
            setCurrentMessage("");
            setIsLoading(true);

            try {
                const token = localStorage.getItem("auth");
                const sessionResponse = await axios.post(
                    "http://localhost:8000/api/chatbot/session",
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const { sessionId } = sessionResponse.data;

                const response = await axios.post(
                    "http://localhost:8000/api/chatbot/generate",
                    { prompt: currentMessage, sessionId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const botMessage = {
                    sender: "chatbot",
                    text: response.data.reply,
                };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error("Error communicating with chatbot:", error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        setCurrentMessage(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-page">
            <Sidebar />
            <div className="chatbot-container">
                <h1 className="chatbot-header">Mental Health Chatbot</h1>
                <div className="chatbot-messages">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chatbot-message ${
                                message.sender === "user" ? "user-message" : "chatbot-message"
                            }`}
                        >
                            {message.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chatbot-message chatbot-message">
                            Typing...
                        </div>
                    )}
                </div>
                <div className="chatbot-input-container">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="chatbot-input"
                    />
                    <button onClick={handleSendMessage} className="chatbot-send-button">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
