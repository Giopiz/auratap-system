# AuraTap Deployment Guide

To make AuraTap accessible to guests via NFC tags at your venue, you need to "upload" (deploy) it to a web host. The recommended path is **Vercel**.

## Phase 1: Push to GitHub
I have already initialized Git and created your first commit!

1.  **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new **Private** repository named `auratap-system`.
3.  **Push Code**: Follow the instructions on GitHub to link your local folder:
    ```powershell
    git remote add origin https://github.com/YOUR_USERNAME/auratap-system.git
    git branch -M main
    git push -u origin main
    ```

## Phase 2: Deploy to Vercel
1.  **Sign Up**: Go to [Vercel](https://vercel.com) and sign in with your GitHub account.
2.  **Import Project**: Click **"Add New"** → **"Project"**.
3.  **Select Repo**: Click **"Import"** next to your `auratap-system` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (Automatic).
    *   **Environment Variables**: Add `GOOGLE_SHEET_ID` with your ID: `1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ`.
5.  **Deploy**: Click **"Deploy"**. Vercel will give you a public URL (e.g., `auratap-system.vercel.app`).

## Phase 3: Production Data (Google Sheets)
In production, your local MCP server won't be reachable. You have two options:

### Option A: Direct API Integration (Recommended for Production)
Instead of an MCP server, we can update the code to use the `google-spreadsheet` npm package directly in a Next.js Server Action. This is more stable for 24/7 web access.

### Option B: Keep MCP (Advanced)
You would need to host your MCP server on a platform like Heroku or a VPS and update the `MCP_SERVER_URL` in your Vercel settings.

---

### Need Help?
If you're ready, I can help you prepare the code for **Option A** (Direct API) so you don't need to run anything on your computer for the system to work!
