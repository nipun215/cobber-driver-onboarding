import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function UploadFormBase64() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setUploading(true);

    try {
      const base64 = await convertToBase64(file);

      await addDoc(collection(db, "driverDocumentsBase64"), {
        fileName: file.name,
        content: base64,
        uploadedAt: new Date(),
      });

      setMessage("✅ Upload successful!");
    } catch (error) {
      setMessage("❌ Upload failed: " + error.message);
    }

    setUploading(false);
  };

  return (
    <div className="p-4 border max-w-md mx-auto mt-10 rounded">
      <h2 className="text-xl font-semibold mb-3">Upload Document (No Storage)</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 mt-3 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

export default UploadFormBase64;
