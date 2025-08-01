# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
}
"@

try {
    $hwnd = [Win32]::GetForegroundWindow()
    $processId = 0
    [Win32]::GetWindowThreadProcessId($hwnd, [ref]$processId) | Out-Null

    if ($processId -gt 0) {
        $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($proc) {
            $title = New-Object System.Text.StringBuilder 512
            [Win32]::GetWindowText($hwnd, $title, 512) | Out-Null
            
            $result = @{
                ProcessName = $proc.ProcessName
                WindowTitle = $title.ToString()
                ProcessPath = if($proc.Path) { $proc.Path } else { "" }
            }
            
            $result | ConvertTo-Json -Compress
        }
    }
} catch {
    # If anything fails, output empty result
    Write-Host "{}"
}