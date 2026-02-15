import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getQuote, getChartData, recordQuoteHistory } from '../services/finnhub';
import styles from './StockChart.module.css';

function StockChart({ symbol }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('today');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const quote = await getQuote(symbol);
        recordQuoteHistory(symbol, quote);
        const chartData = getChartData(symbol, quote);

        if (view === 'today') {
          setData(chartData.intradayPoints);
        } else {
          // Combine historical + today's latest
          const all = [...chartData.historicalPoints];
          if (chartData.intradayPoints.length > 0) {
            const latest = chartData.intradayPoints[chartData.intradayPoints.length - 1];
            const today = new Date().toISOString().slice(0, 10);
            const hasToday = all.some(
              (p) => new Date(p.time).toISOString().slice(0, 10) === today
            );
            if (!hasToday) {
              all.push(latest);
            }
          }
          setData(all);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol, view]);

  const isPositive =
    data.length > 1 && data[data.length - 1].close >= data[0].close;
  const color = isPositive ? '#00c853' : '#ff5252';

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (view === 'today') {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatTooltip(value) {
    return [`$${value.toFixed(2)}`, 'Price'];
  }

  return (
    <div className={styles.container}>
      <div className={styles.rangeButtons}>
        <button
          className={`${styles.rangeBtn} ${view === 'today' ? styles.active : ''}`}
          onClick={() => setView('today')}
        >
          Today
        </button>
        <button
          className={`${styles.rangeBtn} ${view === 'history' ? styles.active : ''}`}
          onClick={() => setView('history')}
        >
          History
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading chart...</div>
      ) : data.length === 0 ? (
        <div className={styles.loading}>
          {view === 'history'
            ? 'Price history builds over time as you use the app. Check back later!'
            : 'No price data available right now.'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`gradient-${symbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis
              dataKey="time"
              tickFormatter={formatDate}
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(label) => {
                const d = new Date(label);
                return view === 'today'
                  ? d.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : d.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
              }}
              contentStyle={{
                background: '#1e2130',
                border: '1px solid #2d3148',
                borderRadius: '6px',
                color: '#e0e0e0',
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default StockChart;
