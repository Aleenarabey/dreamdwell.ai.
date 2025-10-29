# Google OAuth Setup Instructions

## Error Fix: "The given origin is not allowed for the given client ID"

This error occurs because your localhost origin is not whitelisted in Google Cloud Console.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Navigate to **APIs & Services** > **Credentials**

### 2. Find Your OAuth 2.0 Client ID
- Look for the client ID: `739733184031-f4sq593qqdt01tlivnhe6rr1s3lsm5jn.apps.googleusercontent.com`
- Click on it to edit

### 3. Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add:
```
http://localhost:3000
http://127.0.0.1:3000
```

If you're using a different port, add that instead:
```
http://localhost:YOUR_PORT
http://127.0.0.1:YOUR_PORT
```

### 4. Add Authorized Redirect URIs (if needed)
In the **Authorized redirect URIs** section, add:
```
http://localhost:3000
http://127.0.0.1:3000
```

### 5. Save Changes
- Click **Save** at the bottom
- Wait a few minutes for changes to propagate (usually takes 1-5 minutes)

### 6. Restart Your Development Server
```bash
npm start
```

## Additional Notes:

- If you're deploying to production, you'll also need to add your production domain
- The client ID is now configured via environment variable (see `.env` file)
- Create a `.env` file in the root directory with:
  ```
  REACT_APP_GOOGLE_CLIENT_ID=739733184031-f4sq593qqdt01tlivnhe6rr1s3lsm5jn.apps.googleusercontent.com
  ```

## Troubleshooting:

- **Still seeing the error?** Wait a few more minutes and try again (Google can take time to propagate)
- **Different port?** Make sure you've added the exact port you're using (e.g., `http://localhost:3001`)
- **HTTPS in production?** Make sure to use `https://` in production URLs

