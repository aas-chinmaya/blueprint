


"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, verifyOtp, checkAuth } from "@/features/shared/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Home, Shield, LogInIcon } from "lucide-react";
import { toast } from "sonner";

const LoginForm = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isTokenChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch {}
      finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    if (isTokenChecked && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isTokenChecked, isAuthenticated, router]);

  useEffect(() => {
    let countdown;
    if (mode === "otp" && otpSent) {
      setTimer(60);
      setIsResendDisabled(true);
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [mode, otpSent]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !password) {
      setError("Please enter valid email and password");
      return;
    }
    setIsLoginLoading(true);
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response.message === "OTP sent successfully") {
        setError("");
        setOtpSent(true);
        setMode("otp");
        setOtp(Array(6).fill(""));
        setOtpError("");
        toast.success("OTP sent successfully to your email!"); // Added toast for clarity
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Please enter a 6-digit OTP");
      return;
    }
    setIsVerifyLoading(true);
    try {
      const response = await dispatch(verifyOtp({ email, otp: otpValue })).unwrap();
      if (response.message === "Login successful") {
        toast.success("Login successful! Redirecting...");
        setMode("login");
        router.push("/dashboard");
      } else {
        setOtpError("Invalid OTP. Please try again.");
        setOtp(Array(6).fill(""));
      }
    } catch (err) {
      setOtpError(err?.message || "Invalid OTP. Please try again.");
      setOtp(Array(6).fill(""));
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled || isResendLoading) return;
    setIsResendLoading(true);
    setOtp(Array(6).fill(""));
    setOtpError("");
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      if (response.message === "OTP sent successfully") {
        setOtpSent(true); // Triggers timer reset via useEffect
        setError("");
        toast.success("Fresh OTP sent successfully!"); // Added toast for feedback
      } else {
        setOtpError(response.message || "Failed to resend OTP");
        setIsResendDisabled(false); // Allow retry if resend fails
      }
    } catch (err) {
      setOtpError(err?.message || "Error resending OTP");
      setIsResendDisabled(false); // Allow retry if resend fails
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "").trim().slice(-1);
    if (val) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (otpError) setOtpError("");
      if (index < 5) {
        const next = document.getElementById(`otp-input-${index + 1}`);
        next?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    const key = e.key;
    if (key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const prev = document.getElementById(`otp-input-${index - 1}`);
        prev?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    } else if (key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    } else if (key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    } else if (key === "Enter") {
      handleOtpSubmit();
    }
  };

  const renderOtpInputs = (otpArray, handleChange, handleKeyDown, idPrefix) => (
    <div className="flex justify-center space-x-3 mb-6">
      {otpArray.map((digit, index) => (
        <Input
          key={index}
          id={`${idPrefix}-input-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-14 h-16 text-center text-2xl font-bold border-3 border-blue-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    const maskedName = name.length > 4
      ? `${name.slice(0, 3)}${"*".repeat(name.length - 3)}`
      : `${name.charAt(0)}${"*".repeat(name.length - 1)}`;
    return `${maskedName}@${domain}`;
  };

  const handleBackToHome = () => router.push("/");

  return (
    <Card className="max-w-md w-full rounded-3xl shadow-2xl p-8 border-0 relative overflow-hidden z-10">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>

      {mode === "login" && (
        <>
          <CardHeader className="mb-8 text-center">
            <CardTitle className="text-4xl font-black from-blue-600 via-blue-600 to-blue-600">
              Welcome Back!
            </CardTitle>
            <p className="text-gray-700 mt-3 text-lg font-medium">
              Step into your productivity! 🚀
            </p>
          </CardHeader>

          {error && (
            <Alert variant="destructive" className="mb-6 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <AlertDescription className="text-red-700 font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-blue-700">📧 Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
                placeholder="user@aas.technology"
                className="h-14 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-300 border-2 border-blue-200 font-medium placeholder-blue-500 transition-all duration-300 hover:shadow-xl" />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-bold text-blue-700">🔐 Password</Label>
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                placeholder="Enter your password"
                className="h-14 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-300 border-2 border-blue-200 font-medium placeholder-blue-500 pr-14 transition-all duration-300 hover:shadow-xl" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-11 text-blue-600 hover:text-blue-600" tabIndex={-1}>
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <Button type="submit" disabled={isLoginLoading} className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 font-bold rounded-2xl h-14 text-lg text-white shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl">
              {isLoginLoading ? <div className="flex items-center gap-3"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Sending OTP...</div>
                : <div className="flex items-center gap-2"><Shield size={20} />Login!</div>}
            </Button>
          </form>

          <div className="text-center mt-8">
            <button onClick={handleBackToHome}
              className="inline-flex items-center space-x-2 text-blue-700 font-bold bg-gradient-to-r from-blue-100 to-blue-100 px-6 py-3 rounded-full shadow-md border border-blue-200">
              <Home size={25} /><span>Back to Home</span>
            </button>
          </div>
        </>
      )}

      {mode === "otp" && (
        <>
          <CardHeader className="mb-6 text-center">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent">
              Security Check! 🔐
            </CardTitle>
            <p className="text-gray-700 mt-3">
              We sent a fresh OTP to{" "}
              <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-200">{maskEmail(email)}</span>
              <br />
              <span className="text-sm text-blue-600 font-semibold mt-2 block">🌿 Enter the 6-digit OTP!</span>
            </p>
          </CardHeader>

          {otpError && (
            <Alert variant="destructive" className="mb-4 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <AlertDescription className="text-red-700 font-semibold">{otpError}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <AlertDescription className="text-red-700 font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          {renderOtpInputs(otp, handleOtpChange, handleOtpKeyDown, "otp")}

          <div className="flex justify-between items-center mb-8 gap-4">
            <Button
              variant="outline"
              disabled={isResendDisabled || isResendLoading}
              onClick={handleResendOtp}
              className="text-blue-700 font-bold border-2 border-blue-300  rounded-2xl shadow-md hover:scale-105"
            >
              {isResendLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"></div>
                  Sending Fresh OTP...
                </div>
              ) : isResendDisabled ? (
                `⏱️ Fresh OTP in ${timer}s`
              ) : (
                `🔄 Send Fresh OTP`
              )}
            </Button>

            <Button
              onClick={handleOtpSubmit}
              disabled={isVerifyLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 font-bold rounded-2xl shadow-xl text-white hover:scale-105"
            >
              {isVerifyLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">✅ Verify OTP</div>
              )}
            </Button>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                setMode("login");
                setOtp(Array(6).fill(""));
                setOtpError("");
                setError("");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-blue-700 font-semibold border border-blue-300 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-white shadow-sm hover:shadow-md hover:scale-105"
            >
              <LogInIcon className="w-5 h-5 text-blue-600" />
              Back to Login
            </button>
          </div>
        </>
      )}
    </Card>
  );
};

export default LoginForm;