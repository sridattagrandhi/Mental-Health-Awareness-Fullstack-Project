import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Sidebar from "./Sidebar";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) {
      console.error("Cannot send an empty message");
      return;
    }

    const userMessage = { role: "user", text: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send the user's message to the backend
      const response = await axios.post("http://localhost:8000/api/chatbot/chat", {
        message: currentMessage,
      });

      // Append the chatbot's response to the messages
      const botReply = { role: "chatbot", text: response.data.response };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error.stack || error.message);
      setMessages((prev) => [
        ...prev,
        { role: "chatbot", text: "Failed to generate chatbot response." },
      ]);
    } finally {
      setCurrentMessage("");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  const renderMessage = (message, index) => (
    <div key={index} className={`message ${message.role}`}>
      {message.role === "chatbot" ? (
        <ReactMarkdown>{message.text}</ReactMarkdown>
      ) : (
        message.text
      )}
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
