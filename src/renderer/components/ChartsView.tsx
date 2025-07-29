import React, { useState, useEffect } from 'react';
import { formatTime } from '../../shared/utils';

interface ChartsViewProps {
  dailyUsage: any[];
  onRefresh: () => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ dailyUsage: initialDailyUsage, onRefresh }) => {
  const [dateRange, setDateRange] = useState('7days');
  const [dailyUsage, setDailyUsage] = useState(initialDailyUsage);
  const [loading, setLoading] = useState(false);

  const dateRanges = [
    { id: '7days', label: '近7天' },
    { id: '30days', label: '近30天' },
    { id: 'custom', label: '自定义' }
  ];

  useEffect(() => {
    loadChartData();
  }, [dateRange]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const today = new Date();
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = today;
          break;
        case '30days':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = today;
          break;
        default:
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = today;
      }

      const usage = await window.electronAPI.getDailyUsage(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setDailyUsage(usage);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxUsage = Math.max(...dailyUsage.map(day => day.totalTime), 1);
  const totalDays = dailyUsage.length;
  const avgUsage = totalDays > 0 ? dailyUsage.reduce((sum, day) => sum + day.totalTime, 0) / totalDays : 0;

  const SimpleBarChart = ({ data }: { data: any[] }) => {
    if (data.length === 0) return null;

    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          height: '200px', 
          gap: '8px',
          borderBottom: '2px solid #e2e8f0',
          borderLeft: '2px solid #e2e8f0',
          paddingLeft: '1rem',
          paddingBottom: '1rem'
        }}>
          {data.map((day, index) => {
            const height = (day.totalTime / maxUsage) * 180;
            const date = new Date(day.date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day.date} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: '1',
                minWidth: '40px'
              }}>
                <div
                  style={{
                    height: `${height}px`,
                    background: isToday 
                      ? 'linear-gradient(45deg, #48bb78, #38a169)' 
                      : 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '4px 4px 0 0',
                    width: '100%',
                    minHeight: day.totalTime > 0 ? '4px' : '0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  title={`${day.date}: ${formatTime(day.totalTime)}`}
                >
                  {height > 20 && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {formatTime(day.totalTime, true)}
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  marginTop: '0.5rem', 
                  textAlign: 'center',
                  color: isToday ? '#48bb78' : '#718096',
                  fontWeight: isToday ? '600' : '400'
                }}>
                  {date.getMonth() + 1}/{date.getDate()}
                  {isToday && <div style={{ fontSize: '0.6rem' }}>今天</div>}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          height: '200px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#718096'
        }}>
          <div>{formatTime(maxUsage, true)}</div>
          <div>{formatTime(maxUsage * 0.75, true)}</div>
          <div>{formatTime(maxUsage * 0.5, true)}</div>
          <div>{formatTime(maxUsage * 0.25, true)}</div>
          <div>0</div>
        </div>
      </div>
    );
  };

  return (
    <div className="charts-view">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">使用时间趋势</h2>
          <div className="time-range-selector">
            {dateRanges.map(range => (
              <button
                key={range.id}
                className={`time-range-btn ${dateRange === range.id ? 'active' : ''}`}
                onClick={() => setDateRange(range.id)}
                disabled={loading}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#667eea' }}>
              {formatTime(avgUsage)}
            </div>
            <div className="stat-name">日均使用时间</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#48bb78' }}>
              {formatTime(maxUsage)}
            </div>
            <div className="stat-name">单日最高时长</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#ed8936' }}>
              {dailyUsage.filter(day => day.totalTime > 0).length}
            </div>
            <div className="stat-name">活跃天数</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>正在加载图表数据...</p>
          </div>
        ) : dailyUsage.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <SimpleBarChart data={dailyUsage} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h3>暂无图表数据</h3>
            <p style={{ marginTop: '0.5rem' }}>所选时间范围内没有使用记录</p>
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

      {/* Top Apps by Day */}
      {dailyUsage.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">每日应用使用详情</h3>
          </div>
          
          <div className="daily-apps-list">
            {dailyUsage.slice(-7).reverse().map(day => (
              <div key={day.date} style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ margin: 0, color: '#2d3748' }}>
                    {new Date(day.date).toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </h4>
                  <span className="stat-value">{formatTime(day.totalTime)}</span>
                </div>
                
                <div className="grid grid-cols-2">
                  {Object.entries(day.apps)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([appName, duration]) => (
                      <div key={appName} className="stat-item">
                        <span className="stat-name">{appName}</span>
                        <span className="stat-value">{formatTime(duration as number)}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for short time format
const formatTimeShort = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '<1m';
  }
};