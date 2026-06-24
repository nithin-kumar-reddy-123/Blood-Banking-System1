import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import "./Auth.css";

const VerifyEmail = () => {
  const [status, setStatus] = useState({ loading: true, message: "Verifying email...", success: false });
  const [searchParams] = useSearchParams();
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus({ loading: false, message: "Verification token is missing.", success: false });
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get(`/donors/verify?token=${encodeURIComponent(token.trim())}`);
        setStatus({ loading: false, message: response.data.message || "Email verified successfully.", success: true });
      } catch (err) {
        const error = err.response?.data?.error || "Unable to verify email.";
        setStatus({ loading: false, message: error, success: false });
      }
    };

    verify();
  }, [searchParams]);

  const handleResend = async () => {
    if (!resendEmail) {
      setResendStatus("Please enter your registered email to resend verification.");
      return;
    }
    try {
      const resp = await api.post("/donors/resend-verification", { email: resendEmail });
      setResendStatus(resp.data.message || "Verification email resent. Check your inbox.");
    } catch (err) {
      setResendStatus(err.response?.data?.error || "Unable to resend verification email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form glass-panel">
        <h2>{status.loading ? "Verifying Email" : status.success ? "Email Verified" : "Verification Failed"}</h2>
        <p className="subtitle">{status.message}</p>
        <button className="btn-primary auth-submit-btn" onClick={() => navigate("/login?verified=true")}>Go to Login</button>

        {!status.success && !status.loading && (
          <>
            <p className="auth-info" style={{ marginTop: "1rem" }}>
              If you still have issues, enter your registered email below to resend verification.
            </p>
            <div className="form-group" style={{ marginTop: "0.5rem" }}>
              <input
                type="email"
                placeholder="Registered email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <button className="btn-secondary auth-submit-btn" onClick={handleResend} style={{ marginTop: "0.5rem" }}>
              Resend Verification Email
            </button>
            {resendStatus && <p className="auth-info" style={{ marginTop: "0.5rem" }}>{resendStatus}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
