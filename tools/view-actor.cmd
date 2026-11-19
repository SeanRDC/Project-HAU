@echo off
rem Looks at a 3D cutscene character alone (default Lance): drag to turn, wheel to zoom,
rem 1-8 for the faces, L to swing the light, Esc to quit.
rem   tools\view-actor.cmd [lance]
set WHO=%1
if "%WHO%"=="" set WHO=lance
call "%~dp0run-aps-godot.cmd" -- --actor-view=%WHO%
