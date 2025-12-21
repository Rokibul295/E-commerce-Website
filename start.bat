@echo off
echo Starting E-commerce Website...
echo.

echo Starting backend server on port 5002...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

echo Starting frontend on port 3000...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo Website should open in your browser!
pause

