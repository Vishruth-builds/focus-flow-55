# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first
   - Application type: **Web application**
   - Name: "Focus Flow App" (or any name)
   - Authorized redirect URIs: Add this URL:
     ```
     https://gvliedgajeriwydduzpr.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these in Step 2)

## Step 2: Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (ID: `gvliedgajeriwydduzpr`)
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and toggle it **ON**
5. Enter your Google credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
6. Click **Save**

## Step 3: Configure Site URL (if needed)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to:
   - For local development: `http://localhost:5173`
   - For production: Your actual domain URL
3. Add to **Redirect URLs**:
   - `http://localhost:5173/**` (for local dev)
   - Your production URL (for production)

## Step 4: Test

After completing the above steps, try signing in with Google again in your app.

## Troubleshooting

- **Error: "provider is not enabled"**: Make sure Google is toggled ON in Supabase
- **Error: "redirect_uri_mismatch"**: Verify the redirect URI in Google Cloud Console matches exactly: `https://gvliedgajeriwydduzpr.supabase.co/auth/v1/callback`
- **Error: "invalid_client"**: Double-check your Client ID and Client Secret are correct
