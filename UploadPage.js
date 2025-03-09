import React, { useState } from "react";
import "./App.css"; // Import styles

const UploadPage = () => {
  const [aadhar, setAadhar] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("aadhaar", aadhar);
    formData.append("password", password);
    formData.append("file", file);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/upload`, { // Ensure correct API endpoint
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("File uploaded successfully!");
      } else {
        setMessage(data.detail || "File upload failed.");
      }
    } catch (error) {
      setMessage("Error connecting to the server.");
    }

    setAadhar("");
    setPassword("");
    setFile(null);
  };

  return (
    <div className="container">
      <h2>Upload Medical Records</h2>
      <form onSubmit={handleUpload}>
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
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadPage;
