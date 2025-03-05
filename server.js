import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ✅ Define Schema & Model for Medical Records
const medicalRecordSchema = new mongoose.Schema({
  aadhaar: { type: String, required: true },
  password: { type: String, required: true },
  filename: { type: String, required: true },
  fileData: { type: Buffer, required: true },
  contentType: { type: String, required: true },
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

// ✅ Multer Storage (Stores files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ API to Upload File
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { aadhaar, password } = req.body;
    const file = req.file;

    if (!aadhaar || !password || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecord = new MedicalRecord({
      aadhaar,
      password,
      filename: file.originalname,
      fileData: file.buffer,
      contentType: file.mimetype,
    });

    await newRecord.save();
    res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// ✅ API to Retrieve File
app.post("/retrieve", async (req, res) => {
  try {
    const { aadhaar, password } = req.body;
    const record = await MedicalRecord.findOne({ aadhaar, password });

    if (!record) {
      return res.status(404).json({ error: "No record found" });
    }

    res.set("Content-Type", record.contentType);
    res.send(record.fileData);
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
