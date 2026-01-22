# Supabase Google OAuth Setup Checklist

## ✅ Step-by-Step Verification

### 1. Supabase Dashboard - Provider Settings
- [ ] Go to: https://supabase.com/dashboard/project/gvliedgajeriwydduzpr
- [ ] Navigate to: **Authentication** → **Providers**
- [ ] Find **Google** in the list
- [ ] **Toggle must be ON** (should be blue/green, not gray)
- [ ] **Client ID (for OAuth)** field must have a value (starts with something like `123456789-abc...`)
- [ ] **Client Secret (for OAuth)** field must have a value (long string)
- [ ] Click **Save** button (even if already saved, click it again)
- [ ] Wait 30 seconds after saving

### 2. Supabase Dashboard - URL Configuration
- [ ] Go to: **Authentication** → **URL Configuration**
- [ ] **Site URL** should be: `http://localhost:8080`
- [ ] **Redirect URLs** should include:
  - `http://localhost:8080/**`
  - `http://localhost:8080`
- [ ] Click **Save**

### 3. Google Cloud Console - OAuth Credentials
- [ ] Go to: https://console.cloud.google.com/
- [ ] Select your project
- [ ] Go to: **APIs & Services** → **Credentials**
- [ ] Find your OAuth 2.0 Client ID
- [ ] Click to edit it
- [ ] **Authorized redirect URIs** must include:
  ```
  https://gvliedgajeriwydduzpr.supabase.co/auth/v1/callback
  ```
- [ ] Make sure there are no extra spaces or typos
- [ ] Click **Save**

### 4. Local Development
- [ ] Restart your dev server (stop with Ctrl+C, then run `npm.cmd run dev`)
- [ ] Open browser at: http://localhost:8080
- [ ] Open browser DevTools (F12) → Console tab
- [ ] Clear browser cache: Ctrl+Shift+Delete → Clear cached images and files
- [ ] Try signing in with Google
- [ ] Check console for any error messages

## 🔍 Common Issues

### Issue: "provider is not enabled"
**Solution:**
- Go to Supabase → Authentication → Providers → Google
- Make sure toggle is ON (not just the fields filled)
- Click Save
- Wait 1-2 minutes for changes to propagate

### Issue: "redirect_uri_mismatch"
**Solution:**
- Check Google Cloud Console → OAuth credentials
- Redirect URI must be EXACTLY: `https://gvliedgajeriwydduzpr.supabase.co/auth/v1/callback`
- No trailing slashes, no typos

### Issue: Still getting errors after setup
**Solution:**
1. Clear browser cache completely
2. Restart dev server
3. Try in Incognito/Private window
4. Double-check all URLs match exactly (case-sensitive)

## 📝 Quick Test

After setup, you should see in browser console:
```
Attempting Google sign in...
Supabase URL: https://gvliedgajeriwydduzpr.supabase.co
Google sign in initiated: { url: 'https://...', provider: 'google' }
```

If you see an error, it will be logged in the console.
