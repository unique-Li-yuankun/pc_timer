import React, { useState } from 'react';
import { formatTime } from '../../shared/utils';

interface RankingsViewProps {
  rankings: any[];
}

export const RankingsView: React.FC<RankingsViewProps> = ({ rankings }) => {
  const [sortBy, setSortBy] = useState<'total_duration' | 'active_days' | 'avg_session_duration'>('total_duration');

  const sortOptions = [
    { value: 'total_duration', label: '总使用时间' },
    { value: 'active_days', label: '活跃天数' },
    { value: 'avg_session_duration', label: '平均会话时长' }
  ];

  const sortedRankings = [...rankings].sort((a, b) => {
    return (b[sortBy] || 0) - (a[sortBy] || 0);
  });

  const getMedalEmoji = (index: number): string => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  const getAppIcon = (appName: string): string => {
    const iconMap: { [key: string]: string } = {
      'chrome': '🌐',
      'firefox': '🦊',
      'edge': '🌊',
      'safari': '🧭',
      'vscode': '💻',
      'code': '💻',
      'notepad': '📝',
      'word': '📄',
      'excel': '📊',
      'powerpoint': '📈',
      'photoshop': '🎨',
      'illustrator': '✏️',
      'discord': '💬',
      'telegram': '✈️',
      'wechat': '💬',
      'qq': '🐧',
      'steam': '🎮',
      'spotify': '🎵',
      'vlc': '🎬',
      'explorer': '📁',
      'terminal': '⚡',
      'cmd': '⚡',
      'powershell': '💙'
    };

    const lowercaseName = appName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowercaseName.includes(key)) {
        return icon;
      }
    }
    return '📱';
  };

  return (
    <div className="rankings-view">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">应用排行榜</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#667eea'
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  按{option.label}排序
                </option>
              ))}
            </select>
          </div>
        </div>

        {sortedRankings.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginBottom: '2rem',
              padding: '2rem 0'
            }}>
              {sortedRankings.slice(0, 3).map((app, index) => (
                <div key={app.app_name} style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: index === 0 
                    ? 'linear-gradient(135deg, #ffd700, #ffed4e)' 
                    : index === 1 
                    ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)' 
                    : 'linear-gradient(135deg, #cd7f32, #daa520)',
                  borderRadius: '1rem',
                  color: index === 0 ? '#333' : '#444',
                  minWidth: '150px',
                  transform: index === 0 ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    {getMedalEmoji(index)}
                  </div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {getAppIcon(app.app_name)}
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {app.app_name}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    {sortBy === 'total_duration' && formatTime(app.total_duration)}
                    {sortBy === 'active_days' && `${app.active_days} 天`}
                    {sortBy === 'avg_session_duration' && formatTime(app.avg_session_duration)}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Rankings Table */}
            <div className="rankings-table">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px 1fr 120px 100px 120px', 
                gap: '1rem',
                padding: '0.75rem 0',
                borderBottom: '2px solid #e2e8f0',
                fontWeight: '600',
                color: '#4a5568'
              }}>
                <div>排名</div>
                <div>应用名称</div>
                <div>总时间</div>
                <div>活跃天数</div>
                <div>平均会话</div>
              </div>
              
              {sortedRankings.map((app, index) => (
                <div key={app.app_name} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 100px 120px',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid #e2e8f0',
                  alignItems: 'center',
                  background: index < 3 ? 'rgba(102, 126, 234, 0.05)' : 'transparent'
                }}>
                  <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>
                    {index < 3 ? getMedalEmoji(index) : `#${index + 1}`}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getAppIcon(app.app_name)}</span>
                    <div>
                      <div className="stat-name" style={{ fontWeight: '600' }}>
                        {app.app_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                        {app.app_name.toLowerCase().includes('chrome') && 'Google Chrome'}
                        {app.app_name.toLowerCase().includes('code') && 'Visual Studio Code'}
                        {app.app_name.toLowerCase().includes('explorer') && 'File Explorer'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-value">
                    {formatTime(app.total_duration)}
                  </div>
                  
                  <div className="stat-value">
                    {app.active_days} 天
                  </div>
                  
                  <div className="stat-value">
                    {formatTime(app.avg_session_duration)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3" style={{ marginTop: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', color: '#667eea' }}>
                  {formatTime(sortedRankings.reduce((sum, app) => sum + app.total_duration, 0))}
                </div>
                <div className="stat-name">总计时间</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', color: '#48bb78' }}>
                  {sortedRankings.length}
                </div>
                <div className="stat-name">应用总数</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div className="stat-value" style={{ fontSize: '1.5rem', color: '#ed8936' }}>
                  {sortedRankings.length > 0 
                    ? formatTime(sortedRankings.reduce((sum, app) => sum + app.avg_session_duration, 0) / sortedRankings.length)
                    : '0s'
                  }
                </div>
                <div className="stat-name">平均会话时长</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h3>暂无排名数据</h3>
            <p style={{ marginTop: '0.5rem' }}>使用应用程序后排名将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );
};