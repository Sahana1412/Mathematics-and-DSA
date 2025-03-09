import React, { useState } from "react";
import "./App.css";

const RetrievePage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [aadhar, setAadhar] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");

  const handleRetrieve = async (e) => {
    e.preventDefault();
    setError("");
    setRecords(null);

    try {
      const formData = new FormData();
      formData.append("aadhaar", aadhar);
      formData.append("password", password);

      const response = await fetch(`${backendUrl}/retrieve`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setRecords(data.records);
      } else {
        setError(data.detail || "Failed to retrieve records.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    }
  };

  return (
    <div className="container">
      <h2>Retrieve Medical Records</h2>
      <form onSubmit={handleRetrieve}>
        <input
          type="text"
          placeholder="Aadhaar Number"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Retrieve</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {records && (
        <div className="records">
          <h3>Retrieved Records:</h3>
          <ul>
            {records.map((record, index) => (
              <li key={index}>
                <strong>{record.file_name}</strong>:{" "}
                <a href={`${backendUrl}/download/${record.file_id}`} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RetrievePage;
