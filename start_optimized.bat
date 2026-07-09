@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: Configurações do terminal
mode con: cols=90 lines=35
title Tendência Móveis - Servidor Otimizado

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                 🚀 TENDÊNCIA - SERVIDOR OTIMIZADO                 ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:: ===========================================================================
:: VERIFICAÇÃO DO AMBIENTE
:: ===========================================================================
echo 🔍 Verificando ambiente de desenvolvimento...

:: Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo 📋 SOLUÇÃO:
    echo    1. Baixe em: https://nodejs.org/
    echo    2. Instale versão 18+ (LTS recomendado)
    echo    3. Reinicie o terminal e tente novamente
    echo ════════════════════════════════════════════════════════════════
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

:: NPM
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠️  NPM não encontrado, tentando continuar...
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ NPM: %NPM_VERSION%
)

:: Package.json
if not exist "package.json" (
    echo ❌ ERRO: package.json não encontrado!
    echo    Execute na pasta raiz do projeto.
    pause
    exit /b 1
)

echo.

:: ===========================================================================
:: CONFIGURAÇÃO DA PORTA
:: ===========================================================================
echo 🎯 Configurando servidor...

set PORT=3000
set MAX_ATTEMPTS=5
set ATTEMPT=1

:CHECK_PORT
echo   Verificando porta %PORT%...
netstat -ano | findstr ":%PORT%" >nul 2>&1

if %ERRORLEVEL% equ 0 (
    if %ATTEMPT% gtr %MAX_ATTEMPTS% (
        echo ❌ Não foi possível encontrar porta disponível!
        echo    Portas testadas: 3000 a %PORT%
        echo.
        pause
        exit /b 1
    )
    
    set /a PORT+=1
    set /a ATTEMPT+=1
    goto CHECK_PORT
)

echo ✅ Porta %PORT% disponível.

:: ===========================================================================
:: INSTALAÇÃO DE DEPENDÊNCIAS
:: ===========================================================================
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    echo.
    call npm install --silent
    
    if %ERRORLEVEL% neq 0 (
        echo ❌ Falha na instalação.
        echo    Tentando instalação com logs...
        echo.
        call npm install
        
        if %ERRORLEVEL% neq 0 (
            echo ❌ Erro crítico na instalação.
            pause
            exit /b 1
        )
    )
    echo ✅ Dependências instaladas.
    echo.
)

:: ===========================================================================
:: INFORMAÇÕES DO SISTEMA
:: ===========================================================================
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                     📊 STATUS DO SISTEMA                          ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

echo 📁 DIRETÓRIO: %cd%
echo 📅 DATA/HORA: %date% %time%
echo 🛠️  AMBIENTE: development
echo 🌐 PORTA: %PORT%
echo 🖥️  HOST: 0.0.0.0 (todos os IPs)
echo.

echo 🌐 ACESSOS DISPONÍVEIS:
echo    ╰─ 📱 Desktop Principal: http://localhost:%PORT%
echo    ╰─ 📲 Mobile/Redes: http://SEU_IP_DE_REDE:%PORT%
echo    ╰─ 🔗 Rede Externa: Use seu IP local da rede Wi-Fi
echo.

echo ⚡ COMANDOS RÁPIDOS:
echo    ╰─ F5: Recarregar página no navegador
echo    ╰─ Ctrl+R: Recarregamento forçado (limpar cache)
echo    ╰─ Ctrl+Shift+R: Cache completo + recarregamento
echo.

echo ⚠️  CONTROLES DO SERVIDOR:
echo    ╰─ Ctrl+C: Parar servidor normalmente
echo    ╰─ Ctrl+\: Desligamento de emergência
echo.

echo 📈 MONITORAMENTO ATIVO:
echo    ╰─ Logs detalhados de cada requisição
echo    ╰─ Cache inteligente para arquivos estáticos
echo    ╰─ Tratamento de erros com páginas customizadas
echo    ╰─ Health check em: http://localhost:%PORT%/health
echo.

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                     🚀 INICIANDO EM 3s...                         ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak >nul
cls

:: ===========================================================================
:: EXECUÇÃO DO SERVIDOR
:: ===========================================================================
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                    ⚡ SERVIDOR ATIVO!                             ║
echo ║                Acesse: http://localhost:%PORT%                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

set NODE_ENV=development
set HOST=0.0.0.0

echo 📊 CONFIGURAÇÃO APLICADA:
echo    • PORT=%PORT%
echo    • NODE_ENV=%NODE_ENV%
echo    • HOST=%HOST%
echo    • Diretório: public/
echo.

echo 📝 LOGS DO SERVIDOR (Ctrl+C para parar):
echo ════════════════════════════════════════════════════════════════════
echo.

:: Iniciar servidor
call npm start

:: ===========================================================================
:: PÓS-EXECUÇÃO
:: ===========================================================================
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                     ⏹️  SERVIDOR PARADO                           ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

echo 📊 RESUMO DA SESSÃO:
echo    • Início:  %time%
echo    • Término: %time%
echo    • Status:  Encerrado pelo usuário
echo.

echo 🔄 O QUE VOCÊ DESEJA FAZER?
echo    1. Reiniciar servidor
echo    2. Usar outra porta
echo    3. Sair
echo.

set /p "choice=Escolha (1-3): "

if "%choice%"=="1" (
    cls
    call %0
) else if "%choice%"=="2" (
    set /p "new_port=Nova porta (3000-4000): "
    set PORT=%new_port%
    cls
    call %0
) else (
    echo.
    echo 👋 Até logo! Servidor Tendência encerrado.
    timeout /t 2 /nobreak >nul
)