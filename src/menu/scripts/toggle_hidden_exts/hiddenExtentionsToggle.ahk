;toggle hide/show extensions (tested on Windows 7)
;SSF_SHOWALLOBJECTS := 0x1
;SSF_SHOWEXTENSIONS := 0x2
;vNum := 0x1
vNum := 0x2
VarSetCapacity(SHELLSTATE, 36, 0)
DllCall("Shell32.dll\SHGetSetSettings", Ptr,&SHELLSTATE, UInt,vNum, Int,0)
vState := NumGet(SHELLSTATE, "UInt")

if (vState = 0)
NumPut(vNum, SHELLSTATE, "UInt")
else
NumPut(0, SHELLSTATE, "UInt")
DllCall("Shell32.dll\SHGetSetSettings", Ptr,&SHELLSTATE, UInt,vNum, Int,1)

;refresh Desktop/folder windows (appeared to work for show/hide extensions, but not show/hide hidden files)
;SHCNE_ASSOCCHANGED := 0x8000000
;DllCall("Shell32\SHChangeNotify", Int,0x8000000, UInt,0, Ptr,0, Ptr,0)

;refresh Desktop/folder windows
DetectHiddenWindows, On
GroupAdd, vGroupFolder, ahk_class CabinetWClass
GroupAdd, vGroupFolder, ahk_class ExploreWClass
PostMessage, 0x111, 28931, , SHELLDLL_DefView1, ahk_class Progman
WinGet, vWinList, List, ahk_group vGroupFolder
Loop, %vWinList%
PostMessage, 0x111, 41504, , ShellTabWindowClass1, % "ahk_id " vWinList%A_Index%
;PostMessage, 0x111, 28931, , SHELLDLL_DefView1, % "ahk_id " vWinList%A_Index% ;also works
Return