import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import UploadFormBase64 from "./UploadFormBase64";
import SignNowButton from "./SignNowButton";

export default function CobberDriverOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStepOne = () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("All fields are required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStepOne()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3); // Continue to review step
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "drivers"), formData);
      alert("Form submitted successfully!");
      setFormData({ fullName: "", email: "" });
      setStep(4);
    } catch (err) {
      alert("Submission failed.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Cobber Driver Onboarding System</h1>

      {step === 1 && (
        <div>
          <h2>Step 1: Driver Info</h2>
          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <button onClick={handleNext}>Next</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Upload Documents</h2>
          <UploadFormBase64 />
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Review & Submit</h2>
          <p><strong>Name:</strong> {formData.fullName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Thank you for submitting!</h2>
          <SignNowButton />
        </div>
      )}
    </div>
  );
}
