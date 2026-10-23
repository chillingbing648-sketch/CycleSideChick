/**
 * CycleSideChick — Premium Apple-Quality QR Scanner Modal
 * Hardware-accelerated camera QR code scanner with fallback to pure JS (jsQR),
 * file upload decoding, manual token entry, and guaranteed camera track shutdown.
 */

import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { extractInviteToken } from "./api.js";
import { toast, haptic } from "../../app/store.js";

export { extractInviteToken };

export function QRScannerModal({ isOpen = true, onClose, onScanned }) {
  const [cameraState, setCameraState] = useState("initializing"); // "initializing" | "active" | "permission_denied" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // "environment" (rear) | "user" (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const isScannedRef = useRef(false);

  // Stop camera stream safely
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Check for multiple cameras (rear vs front)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Handle successful scan
  const handleSuccess = (rawToken) => {
    if (isScannedRef.current) return;
    isScannedRef.current = true;
    haptic(35);
    toast("QR code scanned successfully!");
    stopCamera();
    if (onScanned) {
      onScanned(rawToken);
    }
  };

  // Start video stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    isScannedRef.current = false;
    let mounted = true;

    async function startCamera() {
      stopCamera();

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        if (mounted) {
          setCameraState("error");
          setErrorMessage("Camera access is not supported by this browser.");
        }
        return;
      }

      setCameraState("initializing");
      setErrorMessage("");

      try {
        const constraints = {
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
        }

        if (mounted) {
          setCameraState("active");
          startScanningLoop();
        }
      } catch (err) {
        if (!mounted) return;
        console.warn("[QRScanner] Camera error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraState("permission_denied");
          setErrorMessage("Camera access was declined. Please enable camera permissions in your browser address bar.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraState("error");
          setErrorMessage("No camera detected on this device.");
        } else {
          setCameraState("error");
          setErrorMessage(err.message || "Could not start camera.");
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Scanning loop using Native BarcodeDetector or jsQR
  const startScanningLoop = () => {
    let hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;
    let detector = null;
    if (hasBarcodeDetector) {
      try {
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch (e) {
        detector = null;
      }
    }

    const tick = async () => {
      if (isScannedRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= video.HAVE_CURRENT_DATA && canvas) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;

        // Downsample slightly for ultra-fast frame rate
        const scanW = Math.min(w, 640);
        const scanH = Math.min(h, Math.round((640 / w) * h));

        canvas.width = scanW;
        canvas.height = scanH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, scanW, scanH);

          // 1. Try Hardware BarcodeDetector
          if (detector) {
            try {
              const barcodes = await detector.detect(canvas);
              if (barcodes && barcodes.length > 0) {
                const rawVal = barcodes[0].rawValue;
                const token = extractInviteToken(rawVal);
                if (token) {
                  handleSuccess(token);
                  return;
                }
              }
            } catch (err) {}
          }

          // 2. jsQR fallback
          if (!isScannedRef.current) {
            const imageData = ctx.getImageData(0, 0, scanW, scanH);
            const qrCode = jsQR(imageData.data, scanW, scanH, {
              inversionAttempts: "dontInvert"
            });
            if (qrCode && qrCode.data) {
              const token = extractInviteToken(qrCode.data);
              if (token) {
                handleSuccess(token);
                return;
              }
            }
          }
        }
      }

      if (!isScannedRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  // Decode uploaded image file
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code && code.data) {
          const token = extractInviteToken(code.data);
          if (token) {
            handleSuccess(token);
          } else {
            toast("QR code found, but does not contain a CycleSideChick invite.");
          }
        } else {
          toast("No QR code detected in this image. Try another photo.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Manual token submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const token = extractInviteToken(manualCode);
    if (token) {
      handleSuccess(token);
    } else {
      toast("Please enter a valid invitation link or token.");
    }
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) onClose();
  };

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scan Companion QR Code"
      maxWidth="460px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
        
        {/* Hidden offscreen canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Viewfinder Frame */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px",
          height: "320px",
          borderRadius: "24px",
          overflow: "hidden",
          background: "#1A141E",
          boxShadow: "0 8px 30px rgba(44, 34, 48, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Video feed */}
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraState === "active" ? "block" : "none"
            }}
          />

          {/* Initializing / Loading State */}
          {cameraState === "initializing" && (
            <div style={{ color: "#FFFFFF", textAlign: "center", padding: "20px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(255,255,255,0.2)",
                borderTopColor: "var(--rose-hot, #E05375)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px auto"
              }} />
              <span style={{ fontSize: "13px", opacity: 0.9 }}>Starting camera...</span>
            </div>
          )}

          {/* Camera Permission Denied / Error State */}
          {(cameraState === "permission_denied" || cameraState === "error") && (
            <div style={{ color: "#FFFFFF", textAlign: "center", padding: "24px" }}>
              <Icon name="shield" size={36} color="var(--rose-hot, #E05375)" />
              <b style={{ display: "block", marginTop: "12px", fontSize: "14px" }}>Camera Unavailable</b>
              <p style={{ fontSize: "12px", opacity: 0.8, margin: "8px 0 16px 0", lineHeight: "1.4" }}>
                {errorMessage}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Upload QR Image Instead
              </Button>
            </div>
          )}

          {/* Apple-Style Reticle Overlay */}
          {cameraState === "active" && (
            <div style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {/* Target Portal */}
              <div style={{
                position: "relative",
                width: "210px",
                height: "210px",
                borderRadius: "20px",
                boxShadow: "0 0 0 9999px rgba(26, 20, 30, 0.55)"
              }}>
                {/* 4 Corner Markers */}
                <span style={{ position: "absolute", top: 0, left: 0, width: "24px", height: "24px", borderTop: "3.5px solid #FF80A0", borderLeft: "3.5px solid #FF80A0", borderTopLeftRadius: "12px" }} />
                <span style={{ position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "3.5px solid #FF80A0", borderRight: "3.5px solid #FF80A0", borderTopRightRadius: "12px" }} />
                <span style={{ position: "absolute", bottom: 0, left: 0, width: "24px", height: "24px", borderBottom: "3.5px solid #FF80A0", borderLeft: "3.5px solid #FF80A0", borderBottomLeftRadius: "12px" }} />
                <span style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderBottom: "3.5px solid #FF80A0", borderRight: "3.5px solid #FF80A0", borderBottomRightRadius: "12px" }} />

                {/* Animated soft laser scan line */}
                <div style={{
                  position: "absolute",
                  left: "6px",
                  right: "6px",
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #FF80A0, #FFFFFF, #FF80A0, transparent)",
                  boxShadow: "0 0 8px #FF80A0",
                  animation: "scannerSweep 2.2s ease-in-out infinite"
                }} />
              </div>
            </div>
          )}

          {/* Flip Camera Button (if multiple cameras available) */}
          {hasMultipleCameras && cameraState === "active" && (
            <button
              type="button"
              onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(0,0,0,0.45)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px)"
              }}
              title="Switch camera"
            >
              <Icon name="refresh" size={16} />
            </button>
          )}
        </div>

        {/* Guidance caption */}
        <p style={{
          fontSize: "12.5px",
          color: "var(--text-muted, #7A7280)",
          textAlign: "center",
          margin: 0,
          lineHeight: "1.4"
        }}>
          Point your camera at the QR code displayed on your partner's phone.
        </p>

        {/* Alternative Actions Bar */}
        <div style={{
          display: "flex",
          gap: "10px",
          width: "100%",
          justifyContent: "center",
          marginTop: "4px"
        }}>
          {/* File Upload Input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <Icon name="camera" size={14} /> Upload QR Photo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManualInput(prev => !prev)}
          >
            {showManualInput ? "Hide Code Entry" : "Enter Code"}
          </Button>
        </div>

        {/* Manual Code Input Form */}
        {showManualInput && (
          <form
            onSubmit={handleManualSubmit}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "4px"
            }}
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste invitation link or token..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              style={{ alignSelf: "flex-end" }}
            >
              Connect with Code
            </Button>
          </form>
        )}

      </div>

      <style>{`
        @keyframes scannerSweep {
          0% { top: 6px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0; }
        }
      `}</style>
    </SheetModal>
  );
}
