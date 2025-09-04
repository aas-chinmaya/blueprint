
"use client";
import {axiosInstance3} from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";

export default function CodeVerificationModal({
  isOpen,
  onClose,
  verificationUrl,
}) {
  const [codeInput, setCodeInput] = useState("");

  const handleGetCode = () => {
    if (!verificationUrl) {
      alert("❌ Verification URL missing.");
      return;
    }

    window.open(verificationUrl, "_blank");
  };
  const handleVerifyCode = async () => {
    if (!codeInput) {
      toast.info("❌ Please enter the code.");
      return;
    }

    try {
      const res = await axiosInstance3.get(`/oauth2callback?code=${codeInput}`);
toast.success("✅ Verification successful!");
      setCodeInput("");
      onClose(); // close modal
    } catch (err) {
toast.error("❌ Verification failed. Please try again.");}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-5 shadow-xl relative">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-center">Verify Account</h2>

        <div className="text-sm text-gray-600 border p-3 rounded-md bg-gray-50">
          <p>
            1. Click <strong>Get Code</strong> and complete the OAuth process in
            the new window.
          </p>
          <p>2. Copy the verification code.</p>
          <p>
            3. Paste it below and click <strong>Verify</strong>.
          </p>
        </div>

        <input
          type="text"
          placeholder="Paste verification code"
          className="w-full border p-2 rounded-md outline-green-500"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4 gap-4">
          <button
            onClick={handleGetCode}
            className="w-full px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Get Code
          </button>

          <button
            onClick={handleVerifyCode}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
