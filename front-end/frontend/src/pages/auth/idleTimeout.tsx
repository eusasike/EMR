import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { refreshApi } from "../../api/auth/auth";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
const WARNING_TIMEOUT_MS = 60 * 1000; // Show warning 1 minute before forcing logout

export const IdleTimeoutModal: React.FC = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const logoutUser = useCallback(() => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  }, [navigate]);

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(60);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current)
            clearInterval(countdownIntervalRef.current);
          logoutUser();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [logoutUser]);

  const resetTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    setShowWarning(false);

    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, IDLE_TIMEOUT_MS - WARNING_TIMEOUT_MS);
  }, [startWarningCountdown]);

  const handleRefreshSession = useCallback(async () => {
    try {
      const data = await refreshApi();
      const newAccessToken = data.accessToken || data.tokens?.accessToken;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        const newRefreshToken = data.refreshToken || data.tokens?.refreshToken;
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        setShowWarning(false);
        resetTimers();
      } else {
        logoutUser();
      }
    } catch {
      logoutUser();
    }
  }, [logoutUser, resetTimers]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Start the initial idle timer without causing a synchronous setState during render/effect cascade
    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, IDLE_TIMEOUT_MS - WARNING_TIMEOUT_MS);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, startWarningCountdown]);

  if (!showWarning) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{ maxWidth: "400px", textAlign: "center" }}
      >
        <h3 style={{ marginTop: 0, color: "#1f2937" }}>
          Session Inactivity Warning
        </h3>
        <p style={{ color: "#4b5563", fontSize: "14px", margin: "16px 0" }}>
          You have been inactive for a while. Your session will expire in{" "}
          <strong style={{ color: "#dc2626" }}>{countdown} seconds</strong>. Do
          you want to continue working?
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleRefreshSession}
            style={{
              padding: "8px 16px",
              backgroundColor: "#047857",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Yes, Continue
          </button>
          <button
            type="button"
            onClick={logoutUser}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e5e7eb",
              color: "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
