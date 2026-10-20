@echo off
rem Previews the whole opening as images (see preview-opening.ps1). Double-click it, or run
rem tools\preview-opening.cmd from the repo. Add -NoOpen to only make the files.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview-opening.ps1" %*
