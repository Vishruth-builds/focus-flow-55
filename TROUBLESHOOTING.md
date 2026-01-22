# Google OAuth Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Browser Console
Open your browser DevTools (F12) → Console tab, then try signing in with Google. Look for these messages:

**If you see:**
```
Attempting Google sign in...
Supabase URL: https://gvliedgajeriwydduzpr.supabase.co
Current origin: http://localhost:8080
Google sign in error: {...}
```

**Copy the full error object** and check what it says.

### 2. Most Common Error: "provider is not enabled"

**This means Google OAuth is not enabled in Supabase.**

**Fix:**
1. Go to: https://supabase.com/dashboard/project/gvliedgajeriwydduzpr
2. Click: **Authentication** → **Providers**
3. Scroll to **Google**
4. **Toggle the switch to ON** (it should turn blue/green)
5. Fill in:
   - **Client ID (for OAuth)**: Your Google OAuth Client ID
   - **Client Secret (for OAuth)**: Your Google OAuth Client Secret
6. **Click the SAVE button** (very important!)
7. Wait 1-2 minutes for changes to propagate
8. Try again

### 3. Verify Supabase URL Configuration

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. **Site URL**: Should be `http://localhost:8080`
3. **Redirect URLs**: Should include `http://localhost:8080/**`
4. Click **Save**

### 4. Verify Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click to edit
5. **Authorized redirect URIs** must include:
   ```
   https://gvliedgajeriwydduzpr.supabase.co/auth/v1/callback
   ```
6. **Important:** No trailing slash, exact match required
7. Click **Save**

### 5. Clear Cache and Retry

1. Clear browser cache: `Ctrl + Shift + Delete`
2. Or use Incognito/Private window
3. Restart dev server: Stop (Ctrl+C) and run `npm.cmd run dev` again
4. Try signing in again

## What Should Happen When It Works

When Google OAuth is properly configured, clicking "Sign in with Google" should:
1. Redirect you to Google's sign-in page
2. After signing in, redirect back to your app
3. You should be logged in

## Still Not Working?

1. **Check the browser console** - Copy the exact error message
2. **Verify in Supabase Dashboard** that Google toggle is ON and saved
3. **Check Google Cloud Console** that redirect URI is correct
4. **Try in a different browser** or Incognito mode
5. **Wait 2-3 minutes** after making changes in Supabase (propagation delay)

## Need More Help?

Share the exact error message from the browser console, and I can help diagnose further.
