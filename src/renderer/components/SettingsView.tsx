import React, { useState, useEffect } from 'react';

interface SettingsViewProps {}

const SettingsView: React.FC<SettingsViewProps> = () => {
  const [autoStart, setAutoStart] = useState<boolean>(false);

  useEffect(() => {
    checkAutoStartStatus();
  }, []);

  const checkAutoStartStatus = async () => {
    try {
      const status = await (window as any).electronAPI.getAutoStartStatus();
      setAutoStart(status);
    } catch (error) {
      console.error('获取开机自启动状态失败:', error);
    }
  };

  const toggleAutoStart = async () => {
    try {
      const newStatus = !autoStart;
      await (window as any).electronAPI.setAutoStart(newStatus);
      setAutoStart(newStatus);
    } catch (error) {
      console.error('设置开机自启动失败:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>设置</h2>
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}>
          <input
            type="checkbox"
            id="autoStart"
            checked={autoStart}
            onChange={toggleAutoStart}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor="autoStart" style={{ cursor: 'pointer' }}>
            开机自动启动 PC Timer
          </label>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#666',
          marginLeft: '10px'
        }}>
          启用此选项后，PC Timer 将在 Windows 启动时自动运行
        </p>
      </div>
    </div>
  );
};

export default SettingsView;