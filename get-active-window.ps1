Add-Type @"
    using System;
    using System.Diagnostics;
    using System.Runtime.InteropServices;
    using System.Text;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
        [DllImport("user32.dll", SetLastError=true)]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    }
"@

$handle = [Win32]::GetForegroundWindow()
$title = New-Object -TypeName System.Text.StringBuilder -ArgumentList 256
[Win32]::GetWindowText($handle, $title, $title.Capacity) | Out-Null

$processId = 0
[Win32]::GetWindowThreadProcessId($handle, [ref]$processId) | Out-Null

if ($processId -ne 0) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        $result = @{
            ProcessName = $process.ProcessName
            WindowTitle = $title.ToString()
            ProcessPath = if($process.Path) { $process.Path } else { "" }
        }
        $result | ConvertTo-Json -Compress
    }
}