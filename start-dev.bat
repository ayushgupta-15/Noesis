@echo off
echo ========================================
echo Starting Noesis Development Environment
echo ========================================
echo.

if not exist "backend\.env" (
    echo [ERROR] backend\.env not found. Please run setup.bat first.
    exit /b 1
)

if not exist ".env.local" (
    echo [ERROR] .env.local not found. Please run setup.bat first.
    exit /b 1
)

echo Starting databases...
cd backend
start /B docker-compose up postgres neo4j redis

echo Waiting for databases to be ready...
timeout /t 30 /nobreak

echo Starting FastAPI backend...
start cmd /k "venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

cd ..

timeout /t 5 /nobreak

echo Starting Next.js frontend...
start cmd /k "npm run dev"

echo.
echo ========================================
echo Development environment started!
echo ========================================
echo.
echo Services:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - API Docs: http://localhost:8000/docs
echo    - Neo4j Browser: http://localhost:7474
echo.
echo Press any key to exit...
pause
