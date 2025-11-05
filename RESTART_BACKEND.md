# Backend Server Restart Instructions

## Problem
404 error when accessing `/api/ml-finance/predict/budget-overrun/:projectId`

## Solution
The backend server needs to be restarted to load the route changes.

## Steps to Restart

1. **Stop the current backend server:**
   - Find the terminal/command prompt where the backend is running
   - Press `Ctrl + C` to stop the server
   - Or if running in background, find the process ID (PID 23680) and kill it:
     ```powershell
     Stop-Process -Id 23680 -Force
     ```

2. **Start the backend server again:**
   ```powershell
   cd "dreamdwell\dreamdwell-ai\backend"
   node server.js
   ```

3. **Verify the route is working:**
   - Open browser or use curl:
     ```powershell
     curl http://localhost:5000/api/ml-finance/test
     ```
   - Should return: `{"success":true,"message":"ML Finance routes are working!"}`

4. **Test the prediction endpoint:**
   - The route `/api/ml-finance/predict/budget-overrun/:projectId` should now work

## Troubleshooting

If still getting 404 after restart:
- Check backend console logs for route registration messages
- Verify `app.use("/api/ml-finance", mlFinanceRoutes);` is in `backend/server.js` (line 244)
- Check for any syntax errors in `backend/routes/mlFinanceRoutes.js`
