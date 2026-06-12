@echo off
title Ragesh Portfolio Server
color 0b
echo.
echo  ========================================
echo   Ragesh L - Portfolio Server
echo  ========================================
echo.
echo  Starting server on http://localhost:3030
echo  Press Ctrl+C to stop
echo.

:: Open the browser after a short delay
start "" http://127.0.0.1:3030

:: Start the server with Netlify CLI to support the serverless functions (chat.js)
npx -y netlify-cli dev -p 3030
