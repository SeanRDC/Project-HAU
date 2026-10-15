@echo off
setlocal
if defined GODOT (
  "%GODOT%" --path "%~dp0..\src\drafts\aps-godot" %*
  exit /b
)
if exist "%~dp0..\builds\godot-tools\4.7.2\Godot_v4.7.2-stable_win64.exe" (
  "%~dp0..\builds\godot-tools\4.7.2\Godot_v4.7.2-stable_win64.exe" --path "%~dp0..\src\drafts\aps-godot" %*
  exit /b
)
where godot >nul 2>&1
if not errorlevel 1 (
  godot --path "%~dp0..\src\drafts\aps-godot" %*
  exit /b
)
echo Godot was not found. Open src\drafts\aps-godot\project.godot in Godot 4,
echo or set GODOT to the full path of your Godot executable.
echo Official download: https://godotengine.org/download/windows/
exit /b 1
