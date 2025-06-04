import React, { useState } from "react";

const SignNowButton = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSign = async () => {
    if (!fullName || !email) {
      setError("Please provide full name and email.");
      return;
    }

    try {
      const response = await fetch("https://cobber-driver-onboarding.vercel.app/api/sign", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ fullName, email }),
  credentials: "include", // ✅ ADD THIS
});




      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setError("Failed to generate signature link.");
      }
    } catch (err) {
      console.error("Signing error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>Step 4: DocuSign Signature</h2>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ display: "block", margin: "0.5rem 0" }}
      />

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "0.5rem 0" }}
      />

      <button onClick={handleSign}>Sign Document</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default SignNowButton;
