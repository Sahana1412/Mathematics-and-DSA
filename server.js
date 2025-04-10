import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ GridFS setup
let gridfsBucket;

mongoose.connection.once("open", () => {
  const db = mongoose.connection.db;
  gridfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
  console.log("✅ GridFS initialized");
});

// ✅ Multer: in-memory storage for file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload endpoint (GridFS)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { phone } = req.body;
    const file = req.file;

    if (!file || !phone) {
      return res.status(400).json({ error: "Missing file or phone number" });
    }

    const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
      metadata: {
        phone,
        contentType: file.mimetype,
      },
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      res.status(201).json({ message: "✅ File uploaded successfully" });
    });

    uploadStream.on("error", (err) => {
      console.error("❌ Upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload error: " + err.message });
  }
});

// ✅ Retrieve endpoint (list files by phone)
app.post("/retrieve", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Missing phone number" });
    }

    const files = await gridfsBucket
      .find({ "metadata.phone": phone })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    const fileList = files.map((file) => ({
      id: file._id,
      filename: file.filename,
    }));

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.error("❌ Retrieve error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ✅ Download endpoint (serve file stream)
app.get("/download/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const files = await gridfsBucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).send("❌ File not found");
    }

    res.set("Content-Type", files[0].metadata.contentType || "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${files[0].filename}"`);

    const readStream = gridfsBucket.openDownloadStream(fileId);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).send("Error streaming file");
    });
  } catch (err) {
    console.error("❌ Download failed:", err);
    res.status(500).send("Internal server error");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
