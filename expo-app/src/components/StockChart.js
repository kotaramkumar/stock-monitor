import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { getQuote, getChartData, recordQuoteHistory } from '../services/finnhub';
import colors from '../theme/colors';

const screenWidth = Dimensions.get('window').width - 32;
const chartHeight = 300;
const paddingLeft = 50;
const paddingRight = 10;
const paddingTop = 10;
const paddingBottom = 30;

export default function StockChart({ symbol }) {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('today');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const quote = await getQuote(symbol);
        await recordQuoteHistory(symbol, quote);
        const chartData = await getChartData(symbol, quote);

        let points;
        if (view === 'today') {
          points = chartData.intradayPoints;
        } else {
          const all = [...chartData.historicalPoints];
          if (chartData.intradayPoints.length > 0) {
            const latest = chartData.intradayPoints[chartData.intradayPoints.length - 1];
            const today = new Date().toISOString().slice(0, 10);
            const hasToday = all.some(
              (p) => new Date(p.time).toISOString().slice(0, 10) === today
            );
            if (!hasToday) all.push(latest);
          }
          points = all;
        }

        const values = points.map((p) => p.close).filter((v) => v != null && !isNaN(v));
        const lbls = points.map((p) => {
          const d = new Date(p.time);
          if (view === 'today') {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          }
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        setData(values.length >= 2 ? values : []);
        setLabels(values.length >= 2 ? lbls : []);
      } catch {
        setData([]);
        setLabels([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol, view]);

  const isPositive = data.length > 1 && data[data.length - 1] >= data[0];
  const lineColor = isPositive ? colors.green : colors.red;

  function renderChart() {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const chartW = screenWidth - paddingLeft - paddingRight;
    const chartH = chartHeight - paddingTop - paddingBottom;
    const stepX = chartW / (data.length - 1);

    // Line points
    const coords = data
      .map((v, i) => {
        const x = paddingLeft + i * stepX;
        const y = paddingTop + chartH - ((v - min) / range) * chartH;
        return `${x},${y}`;
      })
      .join(' ');

    // Fill polygon (line + bottom edge)
    const firstX = paddingLeft;
    const lastX = paddingLeft + (data.length - 1) * stepX;
    const bottomY = paddingTop + chartH;
    const fillPoints = `${coords} ${lastX},${bottomY} ${firstX},${bottomY}`;

    // Y-axis labels (5 ticks)
    const yTicks = 5;
    const yLabels = [];
    for (let i = 0; i <= yTicks; i++) {
      const val = min + (range * i) / yTicks;
      const y = paddingTop + chartH - (i / yTicks) * chartH;
      yLabels.push({ val: `$${val.toFixed(2)}`, y });
    }

    // X-axis labels (max 5)
    const maxXLabels = 5;
    const xLabels = [];
    if (labels.length > 0) {
      const step = Math.max(1, Math.floor((labels.length - 1) / (maxXLabels - 1)));
      for (let i = 0; i < labels.length; i += step) {
        const x = paddingLeft + i * stepX;
        xLabels.push({ label: labels[i], x });
      }
    }

    return (
      <Svg width={screenWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((tick, i) => (
          <Line
            key={i}
            x1={paddingLeft}
            y1={tick.y}
            x2={screenWidth - paddingRight}
            y2={tick.y}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray={[4, 4]}
          />
        ))}

        {/* Fill area */}
        <Polygon points={fillPoints} fill="url(#fillGrad)" />

        {/* Line */}
        <Polyline points={coords} fill="none" stroke={lineColor} strokeWidth={2} />

        {/* Y labels */}
        {yLabels.map((tick, i) => (
          <SvgText
            key={`y${i}`}
            x={paddingLeft - 6}
            y={tick.y + 4}
            fontSize={10}
            fill={colors.secondaryText}
            textAnchor="end"
          >
            {tick.val}
          </SvgText>
        ))}

        {/* X labels */}
        {xLabels.map((tick, i) => (
          <SvgText
            key={`x${i}`}
            x={tick.x}
            y={chartHeight - 6}
            fontSize={10}
            fill={colors.secondaryText}
            textAnchor="middle"
          >
            {tick.label}
          </SvgText>
        ))}
      </Svg>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.rangeButtons}>
        <TouchableOpacity
          style={[s.rangeBtn, view === 'today' && s.active]}
          onPress={() => setView('today')}
        >
          <Text style={[s.rangeBtnText, view === 'today' && s.activeText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.rangeBtn, view === 'history' && s.active]}
          onPress={() => setView('history')}
        >
          <Text style={[s.rangeBtnText, view === 'history' && s.activeText]}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={s.loadingText}>Loading chart...</Text>
      ) : data.length < 2 ? (
        <Text style={s.loadingText}>
          {view === 'history'
            ? 'Price history builds over time as you use the app.'
            : 'No price data available right now.'}
        </Text>
      ) : (
        <View style={s.chartContainer}>
          {renderChart()}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginVertical: 16 },
  rangeButtons: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  rangeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  rangeBtnText: { color: colors.secondaryText, fontWeight: '600', fontSize: 13 },
  activeText: { color: '#fff' },
  loadingText: { color: colors.secondaryText, textAlign: 'center', paddingVertical: 40, fontSize: 14 },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
