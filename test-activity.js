const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testActivityDetection() {
  console.log('Testing activity detection methods...\n');

  // Test 1: PowerShell method
  console.log('=== Test 1: PowerShell Method ===');
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
            ProcessPath = $process.Path
          }
          $result | ConvertTo-Json -Compress
        }
      }
    `;

    const { stdout, stderr } = await execAsync(`powershell -Command "${powershellScript}"`);
    console.log('PowerShell stdout:', stdout);
    if (stderr) console.log('PowerShell stderr:', stderr);
    
    if (stdout.trim()) {
      const result = JSON.parse(stdout.trim());
      console.log('Parsed result:', result);
    }
  } catch (error) {
    console.log('PowerShell method failed:', error.message);
  }

  console.log('\n=== Test 2: WMIC Method ===');
  try {
    const { stdout, stderr } = await execAsync('wmic process where "Name=\'chrome.exe\' or Name=\'Code.exe\' or Name=\'notepad.exe\'" get Name,ProcessId,ExecutablePath /format:csv');
    console.log('WMIC stdout:', stdout);
    if (stderr) console.log('WMIC stderr:', stderr);
  } catch (error) {
    console.log('WMIC method failed:', error.message);
  }

  console.log('\n=== Test 3: Tasklist Method ===');
  try {
    const { stdout, stderr } = await execAsync('tasklist /fo csv | findstr /i "chrome\\|code\\|notepad\\|explorer"');
    console.log('Tasklist stdout:', stdout);
    if (stderr) console.log('Tasklist stderr:', stderr);
  } catch (error) {
    console.log('Tasklist method failed:', error.message);
  }

  console.log('\n=== Test 4: Simple Process List ===');
  try {
    const { stdout, stderr } = await execAsync('tasklist /fi "STATUS eq running" | findstr /i "chrome\\|code\\|notepad"');
    console.log('Simple tasklist stdout:', stdout);
    if (stderr) console.log('Simple tasklist stderr:', stderr);
  } catch (error) {
    console.log('Simple tasklist method failed:', error.message);
  }
}

testActivityDetection().catch(console.error);