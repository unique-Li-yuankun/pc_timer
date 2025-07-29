import React, { useState, useEffect } from 'react';
import { formatTime } from '../../shared/utils';

interface StatsViewProps {
  appStats: any[];
  onRefresh: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ appStats: initialAppStats, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('today');
  const [appStats, setAppStats] = useState(initialAppStats);
  const [loading, setLoading] = useState(false);

  const timeRanges = [
    { id: 'today', label: '今天' },
    { id: '7days', label: '近7天' },
    { id: '30days', label: '近30天' }
  ];

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const stats = await window.electronAPI.getAppStats(timeRange);
      setAppStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTime = appStats.reduce((sum, app) => sum + (app.total_duration || 0), 0);
  const totalSessions = appStats.reduce((sum, app) => sum + (app.session_count || 0), 0);

  return (
    <div className="stats-view">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">应用使用统计</h2>
          <div className="time-range-selector">
            {timeRanges.map(range => (
              <button
                key={range.id}
                className={`time-range-btn ${timeRange === range.id ? 'active' : ''}`}
                onClick={() => setTimeRange(range.id)}
                disabled={loading}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#667eea' }}>
              {formatTime(totalTime)}
            </div>
            <div className="stat-name">总使用时间</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#48bb78' }}>
              {appStats.length}
            </div>
            <div className="stat-name">使用应用数</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#ed8936' }}>
              {totalSessions}
            </div>
            <div className="stat-name">总会话次数</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>正在加载数据...</p>
          </div>
        ) : appStats.length > 0 ? (
          <div className="stats-list">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '3fr 2fr 1fr 1fr', 
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: '2px solid #e2e8f0',
              fontWeight: '600',
              color: '#4a5568'
            }}>
              <div>应用名称</div>
              <div>使用时间</div>
              <div>会话次数</div>
              <div>平均时长</div>
            </div>
            
            {appStats.map((app, index) => {
              const percentage = totalTime > 0 ? (app.total_duration / totalTime * 100) : 0;
              const avgSession = app.session_count > 0 ? app.total_duration / app.session_count : 0;
              
              return (
                <div key={app.app_name} style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 2fr 1fr 1fr',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid #e2e8f0',
                  alignItems: 'center'
                }}>
                  <div>
                    <div className="stat-name" style={{ marginBottom: '0.25rem' }}>
                      #{index + 1} {app.app_name}
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(45deg, #667eea, #764ba2)`,
                        borderRadius: '3px'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                      {percentage.toFixed(1)}% 占比
                    </div>
                  </div>
                  
                  <div className="stat-value">
                    {formatTime(app.total_duration)}
                  </div>
                  
                  <div className="stat-value">
                    {app.session_count}
                  </div>
                  
                  <div className="stat-value">
                    {formatTime(avgSession)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>暂无统计数据</h3>
            <p style={{ marginTop: '0.5rem' }}>
              {timeRange === 'today' ? '今天还没有使用记录' : '所选时间范围内没有使用记录'}
            </p>
            <button 
              className="btn btn-primary" 
              onClick={onRefresh}
              style={{ marginTop: '1rem' }}
            >
              刷新数据
            </button>
          </div>
        )}
      </div>
    </div>
  );
};