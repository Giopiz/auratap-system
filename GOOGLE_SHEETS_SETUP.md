# Google Sheets MCP Setup Guide

## Your Google Sheet ID
`1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ`

## Current Status
✅ **Code Integration Complete** - Your AuraTap system is now configured to fetch WiFi credentials from Google Sheets.

⚠️ **No Server Required** - Your AuraTap system now connects directly to Google Sheets. You do **not** need to run a separate MCP server on your computer anymore.

## Quick Start (2 Steps)

### Step 2: Set Up Google Cloud Credentials (The "Key")
Think of this as creating a "mini-user" (Service Account) that can read your sheet.

1.  **Open the Console**: Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **New Project**: Click the project dropdown (top left) → **"New Project"**. Call it `AuraTap`.
3.  **Enable API**: In the search bar at the top, type **"Google Sheets API"** and click **Enable**.
4.  **Create the "Mini-User"**:
    *   Search for **"Service Accounts"** in the top bar.
    *   Click **+ Create Service Account**.
    *   Name: `auratap-access`.
    *   Click **Create and Continue**.
    *   **Grant Access**: For the "Role", select **Basic** → **Editor**.
    *   Click **Continue** then **Done**.
5.  **Download the Key**:
    *   In the list of service accounts, click on your new `auratap-access` email.
    *   Click the **Keys** tab at the top.
    *   Click **Add Key** → **Create new key**.
    *   Select **JSON** and click **Create**.
    *   **IMPORTANT**: A file will download. Rename it to `google-service-account.json`.
    *   **Save it here**: `C:\Users\User\Desktop\AURATAP\auratap-system\secrets\google-service-account.json`
6.  **Share Your Sheet**:
    *   Open your Google Sheet.
    *   Open the JSON file you just downloaded and copy the email address (it looks like `auratap-access@...iam.gserviceaccount.com`).
    *   Click the **Share** button in the Google Sheet and paste that email with **Editor** access.

### Step 3: Run the System
Your system is already configured! 
1. Place your `google-service-account.json` in the `secrets/` folder.
2. The `npm run dev` server (which is already running) will automatically pick up your live data.

## Expected Google Sheet Format

Your sheet should have these columns:

| clientId   | ssid            | password         | theme  | securityType |
|------------|-----------------|------------------|--------|--------------|
| client1    | AuraTap_Guest   | supersecretpass  | marble | WPA          |
| client2    | VIP_Lounge      | luxurylife       | steel  | WPA          |
| cafe-spot  | Cafe_Free_WiFi  |                  | wood   | nopass       |

## Testing

1. Start MCP server (Step 3 above)
2. Your Next.js dev server is already running
3. Visit: `http://localhost:3000/client1`
4. Check browser console - you should see: `✅ Fetched from Google Sheets`

## Fallback Behavior

If the MCP server isn't running, the system automatically falls back to mock data (no errors, seamless experience).

## Troubleshooting

**"Server not found" error?**
- Make sure the MCP server is running on port 3001
- Check that `GOOGLE_APPLICATION_CREDENTIALS` is set correctly

**"Permission denied" from Google?**
- Verify you shared the sheet with the service account email
- Check the service account has Editor permissions

**Still seeing mock data?**
- Check the browser console for error messages
- Verify the `clientId` exists in your Google Sheet
