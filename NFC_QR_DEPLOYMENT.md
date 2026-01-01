# AuraTap Physical Deployment Guide

This guide explains how to link your physical NFC tags and QR codes to the AuraTap system for a seamless "tap-to-connect" experience.

## 1. QR Code Deployment
The AuraTap Dashboard now includes a built-in QR generator for each client.

1.  **Generate**: Go to `/dashboard` and click the **QR** button next to a client.
2.  **Display**: You can print this QR code or display it on a screen at your venue.
3.  **Action**: When a guest scans the QR, they are taken to the dynamic landing page: `https://your-domain.com/[clientId]`.

---

## 2. NFC Tag Encoding
For the true "One-Tap" experience, you can encode cheap NTAG213/215 stickers.

### Recommended Tool
- **App**: NFC Tools (Available on [iOS](https://apps.apple.com/app/nfc-tools/id1252962749) and [Android](https://play.google.com/store/apps/details?id=com.wakdev.nfctools.pro)).

### Encoding Steps
1.  Open **NFC Tools**.
2.  Go to **Write** → **Add a record**.
3.  Select **URL / URI**.
4.  Enter your AuraTap URL: `https://your-domain.com/client1` (replacing `client1` with the specific Client ID).
5.  Tap **Write** and bring your NFC tag close to the phone.
6.  **Verify**: Lock your phone, then tap the tag. Your AuraTap landing page should trigger instantly.

---

## 3. The "Instant Social" Experience
Unlike traditional Wi-Fi signs, AuraTap feels like a premium social interaction. 

### Recommendations
- **Placement**: Place NFC tags inside coasters, menu stands, or under table surfaces (if thin wood/marble).
- **Branding**: Use the QR codes on high-end acrylic signs or minimal "Wi-Fi" cards that match your venue's aesthetic.
- **Security**: The landing page handles the complex `WIFI:` URI, so guests don't have to navigate to Settings or type passwords.

---

## Troubleshooting
- **Metal Surfaces**: Standard NFC tags don't work on metal. Use specialized "On-Metal" NFC stickers if placing on brushed steel or aluminum.
- **iPhone Scanning**: Ensure you use the top-back area of the iPhone for scanning (near the camera).
- **Android Scanning**: Ensure NFC is enabled in system settings; the scan area is usually in the middle-back of the device.
