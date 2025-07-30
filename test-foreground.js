const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testForegroundDetection() {
  console.log('Testing foreground window detection...\n');

  // Test Method 1: PowerShell with Win32 API
  console.log('=== Method 1: PowerShell Win32 API ===');
  try {
    const powershellScript = `
      Add-Type @"
        using System;
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
    `;

    const { stdout } = await execAsync(`powershell -NoProfile -Command "${powershellScript.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`, { timeout: 5000 });
    
    if (stdout.trim()) {
      const result = JSON.parse(stdout.trim());
      console.log(`✅ Foreground: ${result.ProcessName} - "${result.WindowTitle}"`);
    } else {
      console.log('❌ No result from Win32 API method');
    }
  } catch (error) {
    console.log('❌ Win32 API method failed:', error.message);
  }

  console.log('\n=== Method 2: PowerShell MainWindowTitle ===');
  try {
    const simpleScript = `
      $proc = Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Sort-Object -Property CPU -Descending | Select-Object -First 1
      if ($proc) {
        @{
          ProcessName = $proc.ProcessName
          WindowTitle = $proc.MainWindowTitle
          ProcessPath = if($proc.Path) { $proc.Path } else { "" }
        } | ConvertTo-Json -Compress
      }
    `;
    
    const { stdout } = await execAsync(`powershell -NoProfile -Command "${simpleScript.replace(/\n/g, ' ')}"`, { timeout: 3000 });
    
    if (stdout.trim()) {
      const result = JSON.parse(stdout.trim());
      console.log(`✅ Active: ${result.ProcessName} - "${result.WindowTitle}"`);
    } else {
      console.log('❌ No result from MainWindowTitle method');
    }
  } catch (error) {
    console.log('❌ MainWindowTitle method failed:', error.message);
  }

  console.log('\n=== Method 3: Tasklist with window titles ===');
  try {
    const { stdout } = await execAsync('cmd /c "tasklist /v /fo csv | findstr /v /c:\\"N/A\\""', { timeout: 3000 });
    
    if (stdout.trim()) {
      const lines = stdout.trim().split('\n');
      console.log(`Found ${lines.length - 1} processes with windows`);
      
      // Show first few active processes
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const line = lines[i];
        if (line.includes('.exe') && !line.includes('N/A')) {
          const parts = line.split('","');
          if (parts.length > 8) {
            const processName = parts[0].replace(/"/g, '').replace('.exe', '');
            const windowTitle = parts[8].replace(/"/g, '');
            if (windowTitle && windowTitle !== 'N/A' && windowTitle.length > 0) {
              console.log(`  ${processName} - "${windowTitle}"`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Tasklist method failed:', error.message);
  }
}

console.log('请切换到不同的应用程序窗口，然后按任意键测试检测...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', async () => {
  console.log('\n检测当前前台窗口...\n');
  await testForegroundDetection();
  process.exit(0);
});