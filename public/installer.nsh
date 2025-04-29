; This is a Windows-specific NSIS installer script
; It will only run when building the Windows installer
!macro customInstall
  ; Get the installation directory
  ReadEnvStr $R0 "ProgramFiles"
  StrCpy $R1 "$R0\${PRODUCT_NAME}"
  
  ; After installation, show the directory in Explorer (Windows-only feature)
  ExecShell "explore" "$INSTDIR"
!macroend
