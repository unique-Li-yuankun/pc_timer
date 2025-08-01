import React from 'react';

type ViewType = 'dashboard' | 'stats' | 'charts' | 'rankings' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'dashboard', label: '仪表板', icon: '📊' },
  { id: 'stats', label: '统计详情', icon: '📈' },
  { id: 'charts', label: '趋势图表', icon: '📉' },
  { id: 'rankings', label: '应用排名', icon: '🏆' },
  { id: 'settings', label: '设置', icon: '⚙️' }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map(item => (
            <li key={item.id}>
              <a
                href="#"
                className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onViewChange(item.id as ViewType);
                }}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};