#NoEnv
;
; This script toggles the visibility of items marked as hidden in the file explorer.
;
; Specify a key for the toggle function.
; For me, it's the numberpad slash key.

;
; Create a memory structure that will hold the visibility state data.
; We'll be dealing with Dll system calls, so it should be 36 bytes, filled with 0s.
VarSetCapacity(StatePtr, 36, 0)
;
; Call the system shell SHGetSetSettings function.
; Read the current state data into our StatePtr structure.
; Mask for the last byte. This holds the fShowAllObjects member (visibility state)
; The final 0 parameter makes sure we READ the value. We don't want to write over it yet.
DllCall("Shell32.dll\SHGetSetSettings", "Ptr", &StatePtr, "UInt", 1, "Int", 0)
; 
; StatePtr is a pointer, so put its data into a more friendly variable.
StateVal := NumGet(StatePtr, "UInt")
;
; Check the value. If hidden files are actually visible (0), change StatePtr content to hide them (1)
; Otherwise hidden files are indeed hidden (1), change StatePtr content to visible (0) 
If StateVal = 0
	NumPut(1, StatePtr, "UInt")
Else
	NumPut(0, StatePtr, "UInt")
;
; Call the system shell function again.
; The final 1 parameter writes the newly toggled value up to the system settings.
DllCall("Shell32.dll\SHGetSetSettings", "Ptr", &StatePtr, "UInt", 1, "Int", 1)
;
Run, %1%
send {F5}
Return