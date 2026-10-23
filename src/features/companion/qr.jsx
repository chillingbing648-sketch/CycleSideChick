/**
 * CycleSideChick — Premium Apple-Quality QR Code Generator
 * Powered by standard ISO/IEC 18004 QR specification with Level M/Q error correction,
 * crisp vector SVG rendering, guaranteed 4-module quiet zone, and high-DPI canvas export.
 *
 * Privacy rule: Encodes ONLY the invitation URL. Never cycle/health/profile data.
 */

import React, { useState, useEffect } from "react";
import QRCodeLib from "qrcode";

/**
 * Generates an ISO-compliant SVG string for a given text payload
 */
export async function generateQrSvgString(text, {
  errorCorrectionLevel = "M",
  margin = 4,
  fgColor = "#1F1625",
  bgColor = "#FFFFFF"
} = {}) {
  if (!text) return "";
  return await QRCodeLib.toString(text, {
    type: "svg",
    errorCorrectionLevel,
    margin,
    color: {
      dark: fgColor,
      light: bgColor
    }
  });
}

/**
 * Downloads a high-resolution PNG image of the QR code
 */
export async function downloadQrPng(text, filename = "CycleSideChick-Invite-QR.png", {
  width = 600,
  margin = 4,
  errorCorrectionLevel = "M",
  fgColor = "#1F1625",
  bgColor = "#FFFFFF"
} = {}) {
  try {
    const dataUrl = await QRCodeLib.toDataURL(text, {
      width,
      margin,
      errorCorrectionLevel,
      color: {
        dark: fgColor,
        light: bgColor
      }
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error("Failed to download QR code PNG:", err);
    return false;
  }
}

/**
 * Premium SVG QR Code Component
 */
export function QRCode({
  value,
  size = 200,
  errorCorrectionLevel = "M",
  margin = 4,
  fgColor = "#1F1625",
  bgColor = "#FFFFFF",
  className = "",
  style = {}
}) {
  const [svgHtml, setSvgHtml] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) {
      setSvgHtml("");
      return;
    }

    let mounted = true;
    generateQrSvgString(value, { errorCorrectionLevel, margin, fgColor, bgColor })
      .then(svg => {
        if (mounted) {
          // Ensure svg tag has width and height attributes matching props and clean styling
          const responsiveSvg = svg
            .replace(/^<svg /, `<svg width="${size}" height="${size}" shape-rendering="crispEdges" `)
            .replace(/viewBox="0 0 (\d+) (\d+)"/, `viewBox="0 0 $1 $2"`);
          setSvgHtml(responsiveSvg);
          setError(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error("[QRCode] Generation failure:", err);
          setError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [value, size, errorCorrectionLevel, margin, fgColor, bgColor]);

  if (!value) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          borderRadius: "16px",
          color: "var(--text-muted, #7A7280)",
          fontSize: "12px",
          ...style
        }}
        className={className}
      >
        Generating QR...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF4F6",
          borderRadius: "16px",
          color: "var(--rose-hot, #E05375)",
          fontSize: "12px",
          textAlign: "center",
          padding: "12px",
          ...style
        }}
        className={className}
      >
        Unable to generate QR code.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="Private Companion Invitation QR Code"
      className={`v-qr-code-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        background: bgColor,
        borderRadius: "20px",
        padding: "10px",
        boxShadow: "0 6px 24px rgba(44, 34, 48, 0.08)",
        border: "1px solid rgba(44, 34, 48, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
