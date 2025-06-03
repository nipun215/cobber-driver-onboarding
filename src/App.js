
import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CobberDriverOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", email: "" });
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
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "drivers"), formData);
      alert("Form submitted successfully!");
      setFormData({ fullName: "", email: "" });
      setStep(1);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Cobber Driver Onboarding System
        </h1>

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Step 1: Driver Info</h2>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
            <p className="mb-2">
              <strong>Name:</strong> {formData.fullName}
            </p>
            <p className="mb-4">
              <strong>Email:</strong> {formData.email}
            </p>
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
