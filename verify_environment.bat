@echo off
echo ============================================
echo Part 3 Environment Verification Script
echo ============================================
echo.

echo [1/5] Checking Docker Desktop...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker Desktop is running
) else (
    echo ❌ Docker Desktop is NOT running
    echo    Please start Docker Desktop from Windows Start menu
)
echo.

echo [2/5] Checking Jenkins Container...
docker ps | findstr jenkins >nul
if %errorlevel% equ 0 (
    echo ✅ Jenkins container is running
    echo    Access at: http://localhost:8080
) else (
    echo ❌ Jenkins container is NOT running
    echo    Run: docker start jenkins
)
echo.

echo [3/5] Checking Minikube...
minikube status | findstr "Running" >nul
if %errorlevel% equ 0 (
    echo ✅ Minikube is running
) else (
    echo ❌ Minikube is NOT running
    echo    Run: minikube start --driver=docker
)
echo.

echo [4/5] Checking Kubernetes Deployment...
kubectl get deployment chess-ranking-deployment >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Kubernetes deployment exists
    kubectl get pods -l app=chess-ranking
) else (
    echo ❌ Kubernetes deployment NOT found
    echo    Run: kubectl apply -f k8s/
)
echo.

echo [5/5] Checking Docker Image...
docker images | findstr chess-ranking >nul
if %errorlevel% equ 0 (
    echo ✅ Docker image exists
    docker images | findstr chess-ranking
) else (
    echo ❌ Docker image NOT found
    echo    Need to rebuild image
)
echo.

echo ============================================
echo Verification Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Configure Jenkins pipeline (see JENKINS_SETUP_GUIDE.md)
echo 2. Capture screenshots for report
echo 3. Insert screenshots in Part3_CICD_Report.docx
echo 4. Practice 10-minute demo
echo.
pause
