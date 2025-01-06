import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  const sendMessage = async () => {
    if (!currentMessage.trim()) {
      console.error("Cannot send an empty message");
      return;
    }

    const userMessage = { role: "user", text: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/chatbot/chat", {
        message: currentMessage, // Correct field name for the backend
        history: messages.length > 0
          ? messages.map((msg) => ({
              role: msg.role,
              parts: [{ text: msg.text }],
            }))
          : [],
      });

      console.log(response);

      const botReply = { role: "chatbot", text: response.data.response };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error.message);
      const errorMessage = {
        role: "chatbot",
        text: error.response?.data?.error || "Something went wrong. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setCurrentMessage("");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message, index) => (
    <div key={index} className={`message ${message.role}`}>
      {message.text}
    </div>
  );

  return (
    <div className="chatbot-page">
      <Sidebar />
      <div className="chatbot-container">
        <div className="chat-header">
          <h1>Chat with Lena</h1>
        </div>
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((message, index) => renderMessage(message, index))}
          {loading && <div className="message chatbot">Lena is typing...</div>}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !currentMessage.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
