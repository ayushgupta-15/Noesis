@echo off
echo ========================================
echo Setting up Noesis - AI Research Agent
echo ========================================
echo.

echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)
echo [OK] Node.js found

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed
    exit /b 1
)
echo [OK] Python found

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed ^(optional but recommended^)
) else (
    echo [OK] Docker found
)

echo.
echo Installing Frontend Dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend installation failed
    exit /b 1
)
echo [OK] Frontend dependencies installed

echo.
echo Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend installation failed
    exit /b 1
)
echo [OK] Backend dependencies installed

cd ..

echo.
echo Setting up environment files...

if not exist ".env.local" (
    copy .env.local.example .env.local
    echo [WARNING] Created .env.local - Please add your API keys
)

if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo [WARNING] Created backend\.env - Please add your API keys and database URLs
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your API keys ^(OPENAI_API_KEY, EXA_API_KEY, etc.^)
echo 2. Edit .env.local with frontend configuration
echo 3. Start databases: cd backend ^&^& docker-compose up -d
echo 4. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 5. Start frontend: npm run dev
echo.
echo For detailed instructions, see README.md
pause
