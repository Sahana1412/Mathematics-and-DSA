import React, { useEffect, useState } from "react";
import { auth, firebase } from "./firebase";
import axios from "axios";

const UploadPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: () => console.log("✅ reCAPTCHA verified"),
      });
      window.recaptchaVerifier.render();
    }
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

  const handleUpload = async () => {
    if (!otpVerified) return alert("Verify OTP first");
    if (!file || !phone) return alert("File and phone required");

    const formData = new FormData();
    formData.append("phone_number", phone);
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/upload", formData);
      alert("✅ File uploaded to MongoDB GridFS");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Medical Record</h2>
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={sendOtp}>Send OTP</button>

        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <button onClick={verifyOtp}>Verify OTP</button>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={!otpVerified}>Upload</button>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default UploadPage;
