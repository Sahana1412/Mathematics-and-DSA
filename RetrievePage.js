import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, firebase } from "./firebase";

const RetrievePage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Clear previous verifier if it exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
    }
  
    setTimeout(() => {
      try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("✅ reCAPTCHA verified");
          },
        });
  
        window.recaptchaVerifier.render();
      } catch (err) {
        console.error("❌ reCAPTCHA setup failed:", err);
      }
    }, 200); // wait a bit to ensure DOM is ready
  }, []);
  

  const sendOtp = () => {
    const fullPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    auth
      .signInWithPhoneNumber(fullPhone, window.recaptchaVerifier)
      .then((result) => {
        setConfirmationResult(result);
        alert("OTP sent ✅");
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
        alert("Failed to send OTP");
      });
  };

  const verifyOtp = () => {
    if (!confirmationResult) return alert("Please send OTP first");
    confirmationResult
      .confirm(otp)
      .then(() => {
        alert("OTP verified ✅");
        setOtpVerified(true);
      })
      .catch(() => alert("Invalid OTP ❌"));
  };

  const fetchFiles = async () => {
    if (!otpVerified) return alert("Verify OTP first");

    const formData = new FormData();
    formData.append("phone_number", phone);

    try {
      const res = await axios.post("http://localhost:8000/retrieve", formData);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      alert("Fetch failed");
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Retrieve Medical Records</h2>

        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={sendOtp}>Send OTP</button>

        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <button onClick={verifyOtp}>Verify OTP</button>

        <button onClick={fetchFiles}>Retrieve Files</button>

        <ul>
          {files.map((file) => (
            <li key={file._id}>
              <a href={`http://localhost:8000/download/${file._id}`} target="_blank" rel="noreferrer">
                {file.filename}
              </a>
            </li>
          ))}
        </ul>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default RetrievePage;
