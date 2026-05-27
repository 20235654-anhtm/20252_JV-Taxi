import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import AdminBottomNavBar from '../../components/layout/AdminBottomNavBar';
import { AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  offlineDrivers: number;
  totalCustomers: number;
  customerGrowth: number;
  pendingApprovals: number;
  weeklyRevenue: number;
  targetCompletion: number;
  chartData: Array<{
    dayLabel: string;
    revenue: number;
    isCurrentDay: boolean;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'JP' | 'VN'>('JP');

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success && isMounted) {
          setStats(data.data);
        } else if (isMounted) {
          setError(data.message || 'データ取得に失敗しました。');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        if (isMounted) {
          setError('サーバーへの接続に失敗しました。');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format date to Japanese: YYYY年MM月DD日
  const getTodayJapaneseDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    return `${y}年${m}月${d}日`;
  };

  // Format total customers as K if >= 1000
  const formatCustomers = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  // Format currency in VND with comma separator
  const formatVND = (num: number) => {
    return `${num.toLocaleString()} VND`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <span className="header-title-text">JV - Taxi 管理者</span>
        </header>
        <div className="loading-stats-container">
          <div className="stats-spinner" />
          <p>データを読み込み中...</p>
        </div>
        <AdminBottomNavBar />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <span className="header-title-text">JV - Taxi 管理者</span>
        </header>
        <div className="dashboard-content">
          <div className="error-stats-banner">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error || '統計データの読み込みに失敗しました。'}</span>
          </div>
        </div>
        <AdminBottomNavBar />
      </div>
    );
  }

  // Calculate max revenue for bar heights
  const maxRevenue = Math.max(...stats.chartData.map(d => d.revenue), 1);

  return (
    <div className="dashboard-container select-none">
      {/* Header */}
      <header className="dashboard-header">
        <span className="header-title-text">JV - Taxi 管理者</span>
        <div className="header-lang-switcher">
          <button 
            onClick={() => setActiveLang('JP')}
            className={`lang-pill ${activeLang === 'JP' ? 'active' : ''}`}
          >
            JP
          </button>
          <button 
            onClick={() => setActiveLang('VN')}
            className={`lang-pill ${activeLang === 'VN' ? 'active' : ''}`}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            VN
          </button>
        </div>
      </header>

      {/* Main Content Scroll */}
      <div className="dashboard-content">
        
        {/* Page Title & System Date */}
        <div className="page-title-section">
          <h1 className="page-title">管理者概要</h1>
          <p className="page-date">
            <span className="date-dot" />
            <span>{getTodayJapaneseDate()}</span>
          </p>
        </div>

        {/* Thẻ 1: 運転手統計カード (Driver Card) */}
        <div className="stats-card-main">
          <div className="card-header-row">
            <span className="card-label">運転手</span>
            <div className="bo-icon-box bo-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#006D37" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.15L18.22 10.12H5.78L6.85 7ZM19 17H5V12H19V17Z"></path>
                <circle cx="7.5" cy="14.5" r="1.5"></circle>
                <circle cx="16.5" cy="14.5" r="1.5"></circle>
              </svg>
            </div>
          </div>
          <div className="main-value">
            {stats.totalDrivers.toLocaleString()}
          </div>
          <div className="main-card-footer">
            <div className="status-indicator">
              <span className="status-dot active" />
              <span>{stats.activeDrivers.toLocaleString()} アクティブ</span>
            </div>
            <div className="status-indicator">
              <span className="status-dot offline" />
              <span>{stats.offlineDrivers.toLocaleString()} オフライン</span>
            </div>
          </div>
        </div>

        {/* Thẻ 2 & Thẻ 3 Grid */}
        <div className="bottom-cards-grid">
          {/* Customer Accounts Card */}
          <div className="sub-stats-card">
            <span className="card-label">顧客アカウント</span>
            <div className="sub-card-value">
              {formatCustomers(stats.totalCustomers)}
            </div>
            <div className={`growth-badge ${stats.customerGrowth < 0 ? 'negative' : ''}`}>
              <span>{stats.customerGrowth >= 0 ? `↗ +${stats.customerGrowth}%` : `↘ ${stats.customerGrowth}%`}</span>
            </div>
          </div>

          {/* Pending Approvals Card */}
          <div className="sub-stats-card">
            <span className="card-label">承認</span>
            <div className="sub-card-value">
              {stats.pendingApprovals.toLocaleString()}
            </div>
            <span className="sub-card-footnote">確認待ち</span>
          </div>
        </div>

        {/* Thẻ 4: 週間収益 (Weekly Revenue Chart Card) */}
        <div className="revenue-chart-card">
          <div className="chart-header-row">
            <span className="chart-title-label">週間収益</span>
            <div className="chart-revenue-summary">
              <span className="revenue-total-text">
                {formatVND(stats.weeklyRevenue)}
              </span>
              <span className="revenue-goal-text">
                目標 {stats.targetCompletion}%
              </span>
            </div>
          </div>

          {/* Custom Column Bar Graph */}
          <div className="graph-bars-container">
            {stats.chartData.map((day, idx) => {
              const heightPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              // Safe height bounds
              const barHeight = heightPercent > 0 ? `${Math.max(heightPercent, 12)}%` : '6%';
              
              return (
                <div key={idx} className="graph-bar-column">
                  <div 
                    className={`graph-bar-pillar ${day.isCurrentDay ? 'highlight' : ''}`}
                    style={{ height: barHeight }}
                    data-value={day.revenue > 0 ? `${(day.revenue / 1000).toFixed(0)}k` : '0'}
                  />
                </div>
              );
            })}
          </div>

          {/* Graph labels */}
          <div className="graph-labels-row">
            {stats.chartData.map((day, idx) => (
              <span 
                key={idx} 
                className={`graph-label-item ${day.isCurrentDay ? 'active' : ''}`}
              >
                {day.dayLabel}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Navigation Footer */}
      <AdminBottomNavBar />
    </div>
  );
}
