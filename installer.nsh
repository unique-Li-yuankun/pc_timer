; PC Timer 安装程序自定义脚本
; 添加开机自启动功能

; 安装后执行 - 默认添加开机自启动
!macro customInstall
  ; 添加开机自启动到注册表（用户级别）
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "PC Timer" "$INSTDIR\PC Timer.exe"
  
  ; 创建快捷方式到开始菜单
  CreateDirectory "$SMPROGRAMS\PC Timer"
  CreateShortCut "$SMPROGRAMS\PC Timer\PC Timer.exe.lnk" "$INSTDIR\PC Timer.exe"
  CreateShortCut "$SMPROGRAMS\PC Timer\卸载 PC Timer.lnk" "$INSTDIR\Uninstall PC Timer.exe"
  
  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\PC Timer.lnk" "$INSTDIR\PC Timer.exe"
!macroend

; 卸载时执行 - 移除开机自启动
!macro customUninstall
  ; 从注册表中移除开机自启动
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "PC Timer"
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "PC Timer"
  
  ; 删除开始菜单文件夹
  RMDir /r "$SMPROGRAMS\PC Timer"
  
  ; 删除桌面快捷方式
  Delete "$DESKTOP\PC Timer.lnk"
!macroend