const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testSimpleDetection() {
  console.log('Testing simplified detection methods...\n');

  // Test Method 1: Tasklist
  console.log('=== Method 1: Tasklist ===');
  try {
    const { stdout } = await execAsync('tasklist /fi "STATUS eq running" /fo table', { timeout: 3000 });
    
    if (stdout.trim()) {
      const commonApps = ['chrome.exe', 'firefox.exe', 'msedge.exe', 'Code.exe', 'notepad.exe', 'explorer.exe'];
      const lines = stdout.split('\n');
      
      console.log('Looking for common apps...');
      for (const line of lines) {
        for (const app of commonApps) {
          if (line.toLowerCase().includes(app.toLowerCase())) {
            const processName = app.replace('.exe', '');
            console.log(`✅ Found: ${processName}`);
            
            // Try to get window info
            try {
              const { stdout: windowInfo } = await execAsync(`tasklist /fi "IMAGENAME eq ${app}" /v /fo csv`, { timeout: 2000 });
              if (windowInfo && windowInfo.includes(',')) {
                const csvLines = windowInfo.split('\n');
                if (csvLines.length > 1) {
                  console.log(`   Window info available for ${processName}`);
                }
              }
            } catch (e) {
              console.log(`   No window info for ${processName}`);
            }
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Tasklist failed:', error.message);
  }

  // Test Method 2: WMIC
  console.log('\n=== Method 2: WMIC ===');
  try {
    const { stdout } = await execAsync('wmic process where "Name=\'chrome.exe\' or Name=\'Code.exe\' or Name=\'notepad.exe\'" get Name,ProcessId /format:list', { timeout: 3000 });
    
    if (stdout.trim()) {
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.startsWith('Name=') && line.includes('.exe')) {
          const processName = line.split('=')[1].replace('.exe', '').trim();
          if (processName) {
            console.log(`✅ WMIC found: ${processName}`);
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ WMIC failed:', error.message);
  }

  // Test Method 3: Simple PowerShell
  console.log('\n=== Method 3: Simple PowerShell ===');
  try {
    const { stdout } = await execAsync('powershell "Get-Process | Where-Object {$_.ProcessName -match \'chrome|firefox|Code|notepad|explorer\'} | Select-Object -First 1 ProcessName | ConvertTo-Json"', { timeout: 3000 });
    
    if (stdout.trim()) {
      const result = JSON.parse(stdout.trim());
      if (result && result.ProcessName) {
        console.log(`✅ PowerShell found: ${result.ProcessName}`);
      }
    }
  } catch (error) {
    console.log('❌ PowerShell failed:', error.message);
  }
}

testSimpleDetection().catch(console.error);