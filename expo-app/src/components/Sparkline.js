import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import colors from '../theme/colors';

export default function Sparkline({ quote, height = 60, width = 130 }) {
  if (!quote || !quote.currentPrice) {
    return <View style={{ height, width }} />;
  }

  const points = [];
  if (quote.previousClose) points.push(quote.previousClose);
  if (quote.openPrice) points.push(quote.openPrice);
  if (quote.lowPrice) points.push(quote.lowPrice);
  if (quote.highPrice) points.push(quote.highPrice);
  points.push(quote.currentPrice);

  if (points.length < 2) {
    return <View style={{ height, width }} />;
  }

  const isPositive = quote.change >= 0;
  const lineColor = isPositive ? colors.green : colors.red;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 4;
  const chartH = height - padding * 2;
  const stepX = (width - padding * 2) / (points.length - 1);

  const coords = points
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + chartH - ((v - min) / range) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={{ height, width }}>
      <Svg width={width} height={height}>
        <Polyline
          points={coords}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
}
