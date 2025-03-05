import React, { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("upload");

  return (
    <div>
      <nav className="navbar">
        <h2 className="logo">Hospital Portal</h2>
        <ul>
          <li onClick={() => setPage("upload")}>Upload Medical Records</li>
          <li onClick={() => setPage("retrieve")}>Retrieve Medical Records</li>
          <li onClick={() => setPage("contact")}>Contact</li>
        </ul>
      </nav>

      <div className="container">
        {page === "upload" && <UploadPage />}
        {page === "retrieve" && <RetrievePage />}
        {page === "contact" && <ContactPage />}
      </div>
    </div>
  );
}

function UploadPage() {
  const [aadhaar, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!aadhaar || !password || !file) {
      setMessage("Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("aadhaar", aadhaar);
    formData.append("password", password);

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setMessage(result.message);
  };

  return (
    <div>
      <h2>Upload Medical Records</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Aadhaar Number"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}

function RetrievePage() {
  const [aadhaar, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (!aadhaar || !password) {
      setMessage("Please enter Aadhaar and password.");
      return;
    }

    const response = await fetch(`http://localhost:5000/retrieve/${aadhaar}/${password}`);
    const result = await response.json();

    if (result.error) {
      setMessage(result.error);
    } else {
      setFiles(result);
      setMessage(`${result.length} file(s) retrieved.`);
    }
  };

  return (
    <div>
      <h2>Retrieve Medical Records</h2>
      <form onSubmit={handleRetrieve}>
        <input
          type="text"
          placeholder="Aadhaar Number"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Retrieve</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {files.length > 0 && (
        <div>
          <h3>Retrieved Files:</h3>
          {files.map((file, index) => (
            <p key={index}>
              📄 {file.filename} - <a href={`http://localhost:5000/download/${file.filename}`} download>Download</a>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactPage() {
  return (
    <div>
      <h2>Contact Us</h2>
      <p>Email: support@hospitalportal.com</p>
      <p>Phone: +91 98765 43210</p>
    </div>
  );
}

export default App;
