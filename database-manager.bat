@echo off
title SFC Order Database Manager

:menu
cls
echo ================================
echo SFC Order Database Manager
echo ================================
echo.
echo 1. View Database Files
echo 2. Backup Database
echo 3. View Orders (JSON)
echo 4. View Users (JSON)
echo 5. View Menu (JSON)
echo 6. View Tables (JSON)
echo 7. Clear All Data (DANGER!)
echo 8. Exit
echo.
set /p choice="Choose an option (1-8): "

if "%choice%"=="1" goto view_files
if "%choice%"=="2" goto backup
if "%choice%"=="3" goto view_orders
if "%choice%"=="4" goto view_users
if "%choice%"=="5" goto view_menu
if "%choice%"=="6" goto view_tables
if "%choice%"=="7" goto clear_data
if "%choice%"=="8" goto exit
goto menu

:view_files
cls
echo Current Database Files:
echo ========================
dir /b database\*.json 2>nul
if errorlevel 1 echo No database files found.
echo.
pause
goto menu

:backup
cls
set timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=%timestamp: =0%
set backup_dir=database-backups\backup_%timestamp%
mkdir "%backup_dir%" 2>nul
copy database\*.json "%backup_dir%\" >nul 2>&1
echo Database backed up to: %backup_dir%
echo.
pause
goto menu

:view_orders
cls
echo Current Orders:
echo ===============
if exist database\orders.json (
    type database\orders.json
) else (
    echo No orders file found.
)
echo.
pause
goto menu

:view_users
cls
echo Current Users:
echo ==============
if exist database\users.json (
    type database\users.json
) else (
    echo No users file found.
)
echo.
pause
goto menu

:view_menu
cls
echo Current Menu:
echo =============
if exist database\menu.json (
    type database\menu.json
) else (
    echo No menu file found.
)
echo.
pause
goto menu

:view_tables
cls
echo Current Tables:
echo ===============
if exist database\tables.json (
    type database\tables.json
) else (
    echo No tables file found.
)
echo.
pause
goto menu

:clear_data
cls
echo WARNING: This will delete all database files!
echo This action cannot be undone.
echo.
set /p confirm="Type 'DELETE' to confirm: "
if "%confirm%"=="DELETE" (
    del database\*.json 2>nul
    echo All database files deleted.
) else (
    echo Operation cancelled.
)
echo.
pause
goto menu

:exit
exit