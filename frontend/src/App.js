import axios from 'axios';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FiAlertCircle, FiRefreshCw, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import './App.css'; // CSS import added here

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function App() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data fallback
  const mockData = {
    prices: Array(100).fill(0).map((_, i) => 30000 + Math.sin(i / 10) * 2000),
    sma5: Array(100).fill(0).map((_, i) => 30000 + Math.sin(i / 10) * 1500),
    sma20: Array(100).fill(0).map((_, i) => 30000 + Math.sin(i / 10) * 1000),
    currentPrice: 32000
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get('http://localhost:5001/api/btc-data');
      setMarketData({
        prices: response.data.prices,
        sma5: response.data.sma5,
        sma20: response.data.sma20,
        currentPrice: response.data.prices.slice(-1)[0]
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("API connection failed - using mock data");
      setMarketData({
        prices: mockData.prices,
        sma5: mockData.sma5,
        sma20: mockData.sma20,
        currentPrice: mockData.currentPrice
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTradeSignal = () => {
    if (!marketData || marketData.sma5.length < 2) return { signal: 'NEUTRAL', direction: '' };

    const latestSma5 = marketData.sma5.slice(-1)[0];
    const prevSma5 = marketData.sma5.slice(-2)[0];
    const latestSma20 = marketData.sma20.slice(-1)[0];
    const prevSma20 = marketData.sma20.slice(-2)[0];

    if (prevSma5 <= prevSma20 && latestSma5 > latestSma20)
      return { signal: 'BUY', direction: 'up' };
    if (prevSma5 >= prevSma20 && latestSma5 < latestSma20)
      return { signal: 'SELL', direction: 'down' };
    return { signal: 'HOLD', direction: '' };
  };

  const { signal, direction } = getTradeSignal();

  const chartData = {
    labels: marketData?.prices.map((_, i) => i) || [],
    datasets: [
      {
        label: 'BTC Price',
        data: marketData?.prices || [],
        borderColor: 'blue',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
        pointRadius: 0
      },
      {
        label: 'SMA-5',
        data: marketData?.sma5 || [],
        borderColor: 'orange',
        borderWidth: 1.5,
        tension: 0,
        pointRadius: 0
      },
      {
        label: 'SMA-20',
        data: marketData?.sma20 || [],
        borderColor: 'purple',
        borderWidth: 1.5,
        tension: 0,
        pointRadius: 0
      }
    ]
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading market data...</p>
    </div>
  );

  return (
    <div className="app-container">
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Algorithmic Trading Dashboard</h1>
          <p className="subtitle">BTC/USDT Moving Average Crossover Strategy</p>
        </header>

        {/* Alert */}
        {error && (
          <div className="alert-box">
            <FiAlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          {/* Price Card */}
          <div className="stats-card price-card">
            <h3>Current Price</h3>
            <p className="price-value">
              ${marketData?.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="price-footer">
              <span className="update-text">Last updated:</span>
              <span className="update-time">{lastUpdated}</span>
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="refresh-button"
              >
                <FiRefreshCw className={`refresh-icon ${isRefreshing ? 'spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Signal Card */}
          <div className={`stats-card signal-card signal-${signal.toLowerCase()}`}>
            <h3>Trading Signal</h3>
            <div className="signal-display">
              {direction === 'up' && <FiTrendingUp className="signal-icon" />}
              {direction === 'down' && <FiTrendingDown className="signal-icon" />}
              <span className="signal-text">{signal}</span>
            </div>
            <p className="signal-description">
              {signal === 'BUY' ? 'Short-term MA crossed above long-term MA' :
                signal === 'SELL' ? 'Short-term MA crossed below long-term MA' :
                  'Waiting for crossover signal'}
            </p>
          </div>

          {/* Stats Card */}
          <div className="stats-card ma-card">
            <h3>Moving Averages</h3>
            <div className="ma-container">
              <div className="ma-item">
                <div className="ma-header">
                  <span>SMA-5:</span>
                  <span className="ma-value">
                    {marketData?.sma5?.slice(-1)[0]?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill sma5-fill"
                    style={{ width: `${Math.min(100, (marketData?.sma5?.slice(-1)[0] / (marketData?.currentPrice * 1.2)) * 100 || 0)}%` }}
                  ></div>
                </div>
              </div>
              <div className="ma-item">
                <div className="ma-header">
                  <span>SMA-20:</span>
                  <span className="ma-value">
                    {marketData?.sma20?.slice(-1)[0]?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill sma20-fill"
                    style={{ width: `${Math.min(100, (marketData?.sma20?.slice(-1)[0] / (marketData?.currentPrice * 1.2)) * 100 || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Price Movement</h2>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color btc-color"></span>
                BTC Price
              </span>
              <span className="legend-item">
                <span className="legend-color sma5-color"></span>
                SMA-5
              </span>
              <span className="legend-item">
                <span className="legend-color sma20-color"></span>
                SMA-20
              </span>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 12,
                    usePointStyle: true,
                    callbacks: {
                      label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                          label += '$' + context.parsed.y.toFixed(2);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    grid: { color: 'rgba(229, 231, 235, 1)' },
                    ticks: {
                      callback: (value) => '$' + value.toLocaleString()
                    }
                  },
                  x: {
                    grid: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Strategy Explanation */}
        <div className="strategy-card">
          <h2>Strategy Rules</h2>
          <div className="strategy-grid">
            <div className={`strategy-item ${signal === 'BUY' ? 'active' : ''}`}>
              <h3>BUY Signal</h3>
              <p>When 5-period SMA (orange) crosses above 20-period SMA (purple)</p>
            </div>
            <div className={`strategy-item ${signal === 'SELL' ? 'active' : ''}`}>
              <h3>SELL Signal</h3>
              <p>When 5-period SMA (orange) crosses below 20-period SMA (purple)</p>
            </div>
            <div className={`strategy-item ${signal === 'HOLD' ? 'active' : ''}`}>
              <h3>HOLD Signal</h3>
              <p>No crossover detected between the moving averages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;