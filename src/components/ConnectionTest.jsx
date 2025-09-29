import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

const ConnectionTest = () => {
  const [message, setMessage] = useState("Testing connection...");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      const result = await apiService.testConnection();
      setMessage(result.message);
      setConnected(true);
    } catch (error) {
      setMessage("Failed to connect to backend: " + error.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        margin: "10px 0",
        backgroundColor: connected ? "#d4edda" : "#f8d7da",
        border: `1px solid ${connected ? "#c3e6cb" : "#f5c6cb"}`,
        borderRadius: "5px",
        color: connected ? "#155724" : "#721c24",
        fontSize: "14px",
      }}
    >
      {loading ? (
        <span>Testing backend connection...</span>
      ) : (
        <>
          <strong>Backend Status:</strong> {message}
          <button
            onClick={testConnection}
            style={{
              marginLeft: "10px",
              padding: "2px 8px",
              backgroundColor: "transparent",
              border: `1px solid ${connected ? "#155724" : "#721c24"}`,
              borderRadius: "3px",
              color: connected ? "#155724" : "#721c24",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectionTest;
