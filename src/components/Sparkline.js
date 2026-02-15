import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

function Sparkline({ symbol, quote, height = 50 }) {
  // Build mini chart from today's quote data points
  if (!quote || !quote.currentPrice) {
    return (
      <div
        style={{
          height,
          opacity: 0.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '0.7rem',
        }}
      >
        —
      </div>
    );
  }

  const points = [];
  if (quote.previousClose) {
    points.push({ v: quote.previousClose });
  }
  if (quote.openPrice) {
    points.push({ v: quote.openPrice });
  }
  if (quote.lowPrice) {
    points.push({ v: quote.lowPrice });
  }
  if (quote.highPrice) {
    points.push({ v: quote.highPrice });
  }
  points.push({ v: quote.currentPrice });

  if (points.length < 2) {
    return (
      <div
        style={{
          height,
          opacity: 0.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '0.7rem',
        }}
      >
        —
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const color = isPositive ? '#00c853' : '#ff5252';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points}>
        <defs>
          <linearGradient id={`spark-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${symbol})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default Sparkline;
