import React from 'react';
import { formatTime } from '../../shared/utils';

interface DashboardProps {
  appStats: any[];
  dailyUsage: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ appStats, dailyUsage }) => {
  const totalTimeToday = appStats.reduce((sum, app) => sum + (app.total_duration || 0), 0);
  const topApps = appStats.slice(0, 5);
  
  const weeklyAverage = dailyUsage.length > 0 
    ? dailyUsage.reduce((sum, day) => sum + day.totalTime, 0) / dailyUsage.length
    : 0;

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-3">
        <div className="card summary-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>⏱️</span>
              <h3 className="card-title">今日使用时间</h3>
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            {formatTime(totalTimeToday)}
          </div>
          <p className="card-subtitle">截至目前的总使用时间</p>
        </div>

        <div className="card summary-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📱</span>
              <h3 className="card-title">活跃应用数</h3>
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #48bb78, #68d391)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            {appStats.length}
          </div>
          <p className="card-subtitle">今日使用过的应用程序</p>
        </div>

        <div className="card summary-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📊</span>
              <h3 className="card-title">周平均时间</h3>
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #ed8936, #f6ad55)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            {formatTime(weeklyAverage)}
          </div>
          <p className="card-subtitle">过去7天的平均使用时间</p>
        </div>
      </div>

      {/* Today's Top Apps */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">今日最常用应用</h3>
        </div>
        
        {topApps.length > 0 ? (
          <div>
            {topApps.map((app, index) => (
              <div key={app.app_name} className="stat-item">
                <div>
                  <div className="stat-name">
                    #{index + 1} {app.app_name}
                  </div>
                  <div className="stat-duration">
                    会话次数: {app.session_count}
                  </div>
                </div>
                <div className="stat-value">
                  {formatTime(app.total_duration)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
            <p>暂无使用数据</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              开始使用应用程序后数据将在这里显示
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">使用模式</h3>
          </div>
          
          {appStats.length > 0 ? (
            <div>
              <div className="stat-item">
                <span className="stat-name">最常用应用</span>
                <span className="stat-value">{appStats[0]?.app_name || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-name">平均会话时长</span>
                <span className="stat-value">
                  {appStats[0] ? formatTime(appStats[0].total_duration / appStats[0].session_count) : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-name">总会话次数</span>
                <span className="stat-value">
                  {appStats.reduce((sum, app) => sum + app.session_count, 0)}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              <p>暂无数据</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">本周趋势</h3>
          </div>
          
          {dailyUsage.length > 0 ? (
            <div>
              <div className="stat-item">
                <span className="stat-name">最高使用日</span>
                <span className="stat-value">
                  {dailyUsage.reduce((max, day) => 
                    day.totalTime > max.totalTime ? day : max
                  ).date}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-name">最高使用时长</span>
                <span className="stat-value">
                  {formatTime(Math.max(...dailyUsage.map(day => day.totalTime)))}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-name">活跃天数</span>
                <span className="stat-value">
                  {dailyUsage.filter(day => day.totalTime > 0).length} 天
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              <p>暂无数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};