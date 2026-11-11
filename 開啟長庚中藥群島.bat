@echo off
chcp 65001 >nul
title 長庚中藥群島 3D 互動城市伺服器
cd /d "%~dp0"
echo ===================================================
echo   長庚中藥群島 (CGMH Herbal Archipelago)
echo   正在啟動本機 Web 伺服器 (http://localhost:8092) ...
echo ===================================================
start "" "http://localhost:8092/index.html"
python -m http.server 8092
