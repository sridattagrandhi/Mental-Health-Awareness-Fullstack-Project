import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./RecoveryPlan.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function RecoveryPlan() {
  const [goals, setGoals] = useState([]);
  const [actionPoints, setActionPoints] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [crisisPlans, setCrisisPlans] = useState([]);
  const [editIndices, setEditIndices] = useState({}); // Track edit indices per section
  const [editValue, setEditValue] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Fetch recovery plan from backend
  useEffect(() => {
    const fetchRecoveryPlan = async () => {
      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          console.error("No token found in local storage");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/recovery", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const data = response.data;
          console.log("Fetched recovery plan:", data);
          setGoals(data.goals || []);
          setActionPoints(data.actionPoints || []);
          setTriggers(data.triggers || []);
          setCrisisPlans(data.crisisPlan || []);
        }
      } catch (error) {
        console.error("Error fetching recovery plan:", error.message);
      }
    };

    fetchRecoveryPlan();
  }, []);

  // Save recovery plan to backend
  const saveRecoveryPlan = async (updatedData) => {
    try {
      const token = localStorage.getItem("auth");
      if (!token) {
        console.error("No token found in local storage");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/recovery",
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Recovery plan saved:", response.data);
    } catch (error) {
      console.error("Error saving recovery plan:", error.message);
    }
  };

  const handleAddItem = (setter, items, key) => (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input[type='text']");
    if (input && input.value.trim()) {
      const updatedItems = [...items, input.value.trim()];
      setter(updatedItems);
      saveRecoveryPlan({ goals, actionPoints, triggers, crisisPlan: crisisPlans, [key]: updatedItems });
      input.value = "";
    }
  };

  const handleEditItem = (index, key) => {
    setEditIndices((prev) => ({ ...prev, [key]: index })); // Set edit index for the specific section
    const itemsMap = { goals, actionPoints, triggers, crisisPlan: crisisPlans };
    setEditValue(itemsMap[key][index]);
  };

  const handleSaveEdit = (index, setter, items, key) => {
    const updatedItems = [...items];
    updatedItems[index] = editValue;
    setter(updatedItems);
    setEditIndices((prev) => ({ ...prev, [key]: null })); // Reset edit index for the specific section
    setEditValue("");
    saveRecoveryPlan({ goals, actionPoints, triggers, crisisPlan: crisisPlans, [key]: updatedItems });
  };

  const handleCancelEdit = (key) => {
    setEditIndices((prev) => ({ ...prev, [key]: null })); // Reset edit index for the specific section
    setEditValue("");
  };

  const handleDeleteItem = () => {
    const setters = {
      goals: setGoals,
      actionPoints: setActionPoints,
      triggers: setTriggers,
      crisisPlans: setCrisisPlans,
    };

    const items = {
      goals,
      actionPoints,
      triggers,
      crisisPlans,
    };

    if (deleteType in items) {
      const updatedItems = items[deleteType].filter((_, i) => i !== deleteIndex);
      setters[deleteType](updatedItems);
      saveRecoveryPlan({ goals, actionPoints, triggers, crisisPlan: crisisPlans, [deleteType]: updatedItems });
    }

    setDeleteIndex(null);
    setDeleteType("");
  };

  const handleCheckboxDelete = async (index, items, setter, key) => {
    try {
      const token = localStorage.getItem("auth");
      if (!token) {
        console.error("No token found in local storage");
        return;
      }

      // Delete the item from the backend
      await axios.delete(`http://localhost:8000/api/recovery/${key}/${index}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the frontend state
      const updatedItems = items.filter((_, i) => i !== index);
      setter(updatedItems);

      console.log(`Deleted item from ${key} at index ${index}`);
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  const renderDeleteConfirmation = () => (
    <div className="delete-popup">
      <p>Are you sure you want to delete this?</p>
      <div className="popup-buttons">
        <button onClick={() => setDeleteIndex(null)}>No</button>
        <button onClick={handleDeleteItem}>Yes</button>
      </div>
    </div>
  );

  const renderSection = (title, items, setter, key) => {
    const inputRef = React.createRef();

    return (
      <section className="recovery-section">
        <h2>{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = inputRef.current.value.trim();
            if (value) {
              const updatedItems = [...items, value];
              setter(updatedItems);
              saveRecoveryPlan({ goals, actionPoints, triggers, crisisPlan: crisisPlans, [key]: updatedItems });
              inputRef.current.value = "";
            }
          }}
        >
          <input
            type="text"
            ref={inputRef}
            placeholder={`Add a new ${title.toLowerCase()}...`}
          />
          <button type="submit">Add</button>
        </form>
        <ul>
          {items.map((item, index) => (
            <li key={index} className="recovery-item">
              {editIndices[key] === index ? (
                <div className="edit-controls">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                  <button onClick={() => handleSaveEdit(index, setter, items, key)}>Save</button>
                  <button onClick={() => handleCancelEdit(key)}>Cancel</button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    id={`${title}-${index}`}
                    onChange={() => handleCheckboxDelete(index, items, setter, key)} // Trigger permanent delete on change
                  />
                  <label htmlFor={`${title}-${index}`}>{item}</label>
                  <div className="icon-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditItem(index, key)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => {
                        setDeleteIndex(index);
                        setDeleteType(key);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="recovery-plan-container">
      <Sidebar />
      <div className="recovery-plan-content">
        <header className="recovery-header">
          <h1>Develop Your Recovery Plan</h1>
          <p>
            Recovery is a process of change where individuals improve their health
            and wellness, live a self-directed life, and strive to reach their full
            potential.
          </p>
        </header>
        <main>
          {renderSection("Goals", goals, setGoals, "goals")}
          {renderSection("Action Points", actionPoints, setActionPoints, "actionPoints")}
          {renderSection("Trigger Events", triggers, setTriggers, "triggers")}
          {renderSection("Crisis Plan", crisisPlans, setCrisisPlans, "crisisPlan")}
        </main>
        {deleteIndex !== null && renderDeleteConfirmation()}
      </div>
    </div>
  );
}

export default RecoveryPlan;
