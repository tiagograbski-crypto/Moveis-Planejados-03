@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║               🚀 Tendência - Servidor Local               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando ambiente...

:: Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js não encontrado!
    echo   Instale em: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar dependências
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install --silent
    if %ERRORLEVEL% neq 0 (
        echo ❌ Erro na instalação
        pause
        exit /b 1
    )
)

:: Encontrar porta livre
set PORT=3000
:CHECK_PORT
netstat -ano | findstr ":%PORT%" >nul
if %ERRORLEVEL% equ 0 (
    set /a PORT+=1
    goto CHECK_PORT
)

echo ✅ Porta %PORT% disponível
echo 🌐 Acesse: http://localhost:%PORT%
echo.
echo ⚡ Iniciando servidor...
echo.

set NODE_ENV=development
set HOST=0.0.0.0

call npm start