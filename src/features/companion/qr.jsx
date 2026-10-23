/**
 * CycleSideChick — Self-Contained SVG QR Code Generator
 * Pure JS QR code matrix generator (Level M/L, Byte mode).
 * Produces crisp, beautiful SVG vector output.
 * Privacy rule: Encodes ONLY the invitation URL. Never cycle/health/profile data.
 */

import React from "react";

// Standard Galois field and Reed-Solomon polynomial math for QR generation
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF256() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // Generator polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const factor = GF256_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCalculateEcc(msgBytes, eccLength) {
  const genPoly = rsGeneratorPoly(eccLength);
  const out = new Array(eccLength).fill(0);
  for (let i = 0; i < msgBytes.length; i++) {
    const factor = msgBytes[i] ^ out[0];
    for (let j = 0; j < eccLength - 1; j++) {
      out[j] = out[j + 1] ^ gfMul(genPoly[j + 1], factor);
    }
    out[eccLength - 1] = gfMul(genPoly[eccLength], factor);
  }
  return out;
}

// Version capacities (byte mode, ECC Level L & M)
const VERSION_SPECS = [
  null,
  { size: 21, totalBytes: 26, dataBytes: 19, ecBytes: 7, alignment: [] },
  { size: 25, totalBytes: 44, dataBytes: 34, ecBytes: 10, alignment: [6, 18] },
  { size: 29, totalBytes: 70, dataBytes: 55, ecBytes: 15, alignment: [6, 22] },
  { size: 33, totalBytes: 100, dataBytes: 80, ecBytes: 20, alignment: [6, 26] },
  { size: 37, totalBytes: 134, dataBytes: 108, ecBytes: 26, alignment: [6, 30] },
  { size: 41, totalBytes: 172, dataBytes: 136, ecBytes: 36, alignment: [6, 34] },
  { size: 45, totalBytes: 196, dataBytes: 156, ecBytes: 40, alignment: [6, 22, 38] },
  { size: 49, totalBytes: 242, dataBytes: 194, ecBytes: 48, alignment: [6, 24, 42] },
  { size: 53, totalBytes: 292, dataBytes: 232, ecBytes: 60, alignment: [6, 26, 46] },
  { size: 57, totalBytes: 346, dataBytes: 274, ecBytes: 72, alignment: [6, 28, 50] }
];

export function generateQrMatrix(text) {
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);
  const textLen = utf8.length;

  let version = 1;
  while (version < VERSION_SPECS.length && VERSION_SPECS[version].dataBytes - 3 < textLen) {
    version++;
  }
  if (version >= VERSION_SPECS.length) {
    version = VERSION_SPECS.length - 1;
  }

  const spec = VERSION_SPECS[version];
  const size = spec.size;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const isReserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setReserved(r, c, val) {
    matrix[r][c] = val;
    isReserved[r][c] = true;
  }

  // 1. Finder patterns
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          setReserved(nr, nc, 1);
        } else {
          setReserved(nr, nc, 0);
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) setReserved(6, i, i % 2 === 0 ? 1 : 0);
    if (matrix[i][6] === null) setReserved(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // 3. Alignment patterns
  const align = spec.alignment;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      const ar = align[i];
      const ac = align[j];
      if (matrix[ar][ac] !== null) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
            setReserved(ar + r, ac + c, 1);
          } else {
            setReserved(ar + r, ac + c, 0);
          }
        }
      }
    }
  }

  // 4. Reserve format bits around finders
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) setReserved(8, i, 0);
    if (matrix[i][8] === null) setReserved(i, 8, 0);
  }
  for (let i = size - 8; i < size; i++) {
    if (matrix[8][i] === null) setReserved(8, i, 0);
    if (matrix[i][8] === null) setReserved(i, 8, 0);
  }

  // 5. Encode data stream
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4);
  pushBits(textLen, 8);
  for (let i = 0; i < textLen; i++) {
    pushBits(utf8[i], 8);
  }
  for (let i = 0; i < 4 && bitStream.length < spec.dataBytes * 8; i++) {
    bitStream.push(0);
  }
  while (bitStream.length % 8 !== 0) bitStream.push(0);
  let padByte = 0xec;
  while (bitStream.length < spec.dataBytes * 8) {
    pushBits(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const dataBytes = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitStream[i + j];
    }
    dataBytes.push(b);
  }

  const eccBytes = rsCalculateEcc(dataBytes, spec.ecBytes);
  const totalCodewords = [...dataBytes, ...eccBytes];

  const allBits = [];
  for (let b of totalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((b >> i) & 1);
    }
  }

  // 7. Place bits in zigzag pattern
  let bitIdx = 0;
  let dir = -1;
  let row = size - 1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--;
    for (let c = 0; c < 2; c++) {
      const curCol = col - c;
      if (!isReserved[row][curCol]) {
        const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
        const mask = (row + curCol) % 2 === 0 ? 1 : 0;
        matrix[row][curCol] = bit ^ mask;
      }
    }
    row += dir;
    if (row < 0 || row >= size) {
      dir = -dir;
      row += dir;
      col -= 2;
    }
  }

  // 8. Place format info
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  let fIdx = 0;
  for (let c = 0; c <= 8; c++) {
    if (c === 6) continue;
    matrix[8][c] = formatBits[fIdx++];
  }
  for (let r = 7; r >= 0; r--) {
    if (r === 6) continue;
    matrix[r][8] = formatBits[fIdx++];
  }

  fIdx = 0;
  for (let r = size - 1; r >= size - 7; r--) {
    matrix[r][8] = formatBits[fIdx++];
  }
  matrix[8][size - 8] = formatBits[fIdx++];
  for (let c = size - 7; c < size; c++) {
    matrix[8][c] = formatBits[fIdx++];
  }

  return matrix;
}

export function QRCode({ value, size = 180, fgColor = "#2C2230", bgColor = "#FFFFFF" }) {
  if (!value) return null;

  let matrix;
  try {
    matrix = generateQrMatrix(value);
  } catch (e) {
    return (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", borderRadius: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
        Unable to generate QR
      </div>
    );
  }

  const modCount = matrix.length;
  const margin = 2;
  const viewBoxSize = modCount + margin * 2;

  let pathData = "";
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (matrix[r][c] === 1) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return (
    <svg
      role="img"
      aria-label="Private invitation QR code"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      style={{
        borderRadius: "16px",
        background: bgColor,
        padding: "8px",
        boxShadow: "0 4px 16px rgba(44, 34, 48, 0.08)",
        display: "block"
      }}
    >
      <rect width="100%" height="100%" fill={bgColor} rx="8" />
      <path d={pathData} fill={fgColor} />
    </svg>
  );
}
