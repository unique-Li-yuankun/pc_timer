const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testNewActivityDetection() {
  console.log('Testing new activity detection methods...\n');

  // Test the exact same method as in the updated code
  console.log('=== Testing WMIC Method (same as app) ===');
  try {
    const { stdout } = await execAsync('wmic process where "Name=\'chrome.exe\' or Name=\'Code.exe\' or Name=\'notepad.exe\' or Name=\'firefox.exe\' or Name=\'explorer.exe\'" get Name,ProcessId /format:csv', { timeout: 5000 });
    
    if (stdout.trim()) {
      console.log('Raw WMIC output:');
      console.log(stdout);
      
      const lines = stdout.trim().split('\n').filter(line => line.includes('.exe'));
      console.log('Filtered lines:', lines);
      
      if (lines.length > 0) {
        const parts = lines[0].split(',');
        console.log('Parts:', parts);
        
        if (parts.length >= 2) {
          const processName = parts[1]?.replace('.exe', '') || 'Unknown';
          console.log(`✅ Detected process: ${processName}`);
        }
      }
    }
  } catch (error) {
    console.log('❌ WMIC method failed:', error.message);
  }

  console.log('\n=== Testing PowerShell Method (same as app) ===');
  try {
    const simpleScript = 'Get-Process | Where-Object {$_.Name -match "chrome|code|notepad|firefox|explorer"} | Select-Object -First 1 | ConvertTo-Json';
    const { stdout } = await execAsync(`powershell -NoProfile -Command "${simpleScript}"`, { timeout: 3000 });
    
    if (stdout.trim()) {
      console.log('PowerShell output:');
      console.log(stdout);
      
      const result = JSON.parse(stdout.trim());
      if (result && result.Name) {
        console.log(`✅ PowerShell detected: ${result.Name}`);
      }
    }
  } catch (error) {
    console.log('❌ PowerShell method failed:', error.message);
  }
}

testNewActivityDetection().catch(console.error);