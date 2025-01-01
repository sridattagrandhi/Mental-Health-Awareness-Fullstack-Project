import React, { useState, useEffect } from "react";
import "./Journal.css";
import Sidebar from "./Sidebar";
import axios from "axios";

const Journal = () => {
    const [entries, setEntries] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [currentEntry, setCurrentEntry] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [viewingEntry, setViewingEntry] = useState(null);

    useEffect(() => {
        const fetchJournalEntry = async () => {
            try {
                const token = localStorage.getItem("auth");
                if (!token) {
                    console.error("No token found in local storage");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/journal", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
                    const data = response.data;
                    console.log("Fetched journal entries:", data);
                    setEntries(data); // Set entries to state
                }
            } catch (error) {
                console.error("Error fetching journal entries:", error.message);
            }
        };

        fetchJournalEntry();
    }, []);

    const handleNewEntry = () => {
        setIsWriting(true);
        setCurrentEntry("");
        setEditingIndex(null);
    };

    const handleSaveEntry = async () => {
        if (currentEntry.trim()) {
            const token = localStorage.getItem("auth");
            if (!token) {
                console.error("No token found in local storage");
                return;
            }
            try {
                if (editingIndex !== null) {
                    // Editing an existing entry
                    const entryToEdit = entries[editingIndex];
                    const editURL = `http://localhost:8000/api/journal/${entryToEdit._id}`;
                    console.log("EDIT URL:", editURL); // Debug log
    
                    // Send PUT request to update the entry
                    const response = await axios.put(
                        editURL,
                        { title: entryToEdit.title || "Edited Entry", content: currentEntry },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
    
                    // Update the state with the updated entry from the server response
                    const updatedEntries = [...entries];
                    updatedEntries[editingIndex] = response.data; // Updated entry returned by the backend
                    setEntries(updatedEntries);
    
                    console.log("Entry updated successfully:", response.data);
                } else {
                    // Creating a new entry
                    const response = await axios.post(
                        "http://localhost:8000/api/journal",
                        { title: "New Entry", content: currentEntry },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
    
                    setEntries([...entries, response.data]); // Append the new entry
                }
            } catch (error) {
                console.error("Error saving entry:", error.message);
            }
        }
    
        setIsWriting(false); // Exit writing mode
        setCurrentEntry("");
        setEditingIndex(null);
    };    

    const handleExitWriting = () => {
        setIsWriting(false);
        setCurrentEntry("");
        setEditingIndex(null);
    };

    const handleEditEntry = (index) => {
        const entry = entries[index];
        setCurrentEntry(entry.content); // Ensure you're accessing the correct property
        setIsWriting(true);
        setEditingIndex(index);
    };

    const confirmDeleteEntry = async () => {
        const token = localStorage.getItem("auth");
        if (!token) {
            console.error("No token found in local storage");
            return;
        }
    
        try {
            // Get the entry to delete based on `deleteIndex`
            const entryToDelete = entries[deleteIndex];
            if (!entryToDelete || !entryToDelete._id) {
                console.error("No valid entry or ID to delete");
                return;
            }
    
            // Include the `_id` in the URL
            const deleteURL = `http://localhost:8000/api/journal/${entryToDelete._id}`;
            console.log("DELETE URL:", deleteURL); // Debug log to verify
    
            await axios.delete(deleteURL, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // Update state after successful deletion
            const updatedEntries = [...entries];
            updatedEntries.splice(deleteIndex, 1);
            setEntries(updatedEntries);
    
            console.log("Entry deleted successfully.");
        } catch (error) {
            console.error("Error deleting entry:", error.message);
        }
        setDeleteIndex(null);
    };
    

    const handleDeleteClick = (index) => {
        setDeleteIndex(index);
    };

    const handleViewEntry = (entry) => {
        setViewingEntry(entry);
    };

    const groupedEntries = entries.reduce((acc, entry) => {
        const entryDate = new Date(entry.date);
        const monthYear = entryDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(entry);
        return acc;
    }, {});

    return (
        <div className="journal-page">
            <Sidebar />
            <div className="journal-container">
                {isWriting ? (
                    <div className="journal-writing-mode">
                        <textarea
                            placeholder="Hi, what's on your mind?"
                            value={currentEntry}
                            onChange={(e) => setCurrentEntry(e.target.value)}
                        />
                        <button className="exit-button" onClick={handleExitWriting}>✖</button>
                        <div className="bottom-actions">
                            <button className="save-checkmark" onClick={handleSaveEntry}>✔</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="journal-header">
                            <h1 className="journal-title">Journal</h1>
                            <button className="new-entry-button" onClick={handleNewEntry}>+ New Entry</button>
                        </div>
                        {Object.keys(groupedEntries).length === 0 ? (
                            <p>No journal entries yet!</p>
                        ) : (
                            <div className="journal-entries">
                                {Object.entries(groupedEntries).map(([monthYear, entries]) => (
                                    <div key={monthYear} className="journal-group">
                                        <h2 className="month-year-header">{monthYear}</h2>
                                        {entries.map((entry, index) => (
                                            <div
                                                key={index}
                                                className="journal-entry"
                                                onClick={() => handleViewEntry(entry)}
                                            >
                                                <div>
                                                    <div className="entry-date">
                                                        {new Date(entry.date).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "2-digit",
                                                        })}
                                                    </div>
                                                    <div className="entry-text">
                                                        {entry.content.length > 50
                                                            ? entry.content.slice(0, 50) + "..."
                                                            : entry.content}
                                                    </div>
                                                </div>
                                                <div
                                                    className="entry-actions"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button onClick={() => handleEditEntry(index)}>✎</button>
                                                    <button onClick={() => handleDeleteClick(index)}>✖</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {deleteIndex !== null && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <h2>Are you sure?</h2>
                        <p>This entry will be permanently deleted.</p>
                        <div className="popup-actions">
                            <button className="delete-button" onClick={confirmDeleteEntry}>Delete Entry</button>
                            <button className="cancel-button" onClick={() => setDeleteIndex(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {viewingEntry && (
                <div className="popup-overlay" onClick={() => setViewingEntry(null)}>
                    <div className="popup-container view-entry" onClick={(e) => e.stopPropagation()}>
                        <h2>{new Date(viewingEntry.date).toDateString()}</h2>
                        <p>{viewingEntry.content}</p>
                        <button className="cancel-button" onClick={() => setViewingEntry(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;
