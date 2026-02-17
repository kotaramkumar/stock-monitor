import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuote, getCompanyProfile } from '../services/finnhub';
import StockChart from '../components/StockChart';
import colors from '../theme/colors';

export default function StockDetailScreen({ route, isInWatchlist, addSymbol, removeSymbol }) {
  const { symbol } = route.params;
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [q, p] = await Promise.all([
          getQuote(symbol),
          getCompanyProfile(symbol),
        ]);
        setQuote(q);
        setProfile(p);
      } catch {}
      finally { setLoading(false); }
    }
    fetchData();
  }, [symbol]);

  const inList = isInWatchlist(symbol);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={s.loadingText}>Loading {symbol}...</Text>
      </SafeAreaView>
    );
  }

  const isPositive = quote?.change >= 0;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.header}>
          <View style={s.titleRow}>
            {profile?.logo ? (
              <Image source={{ uri: profile.logo }} style={s.logo} />
            ) : null}
            <View>
              <Text style={s.symbol}>{symbol}</Text>
              <Text style={s.name}>{profile?.name || symbol}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.watchlistBtn, inList && s.inList]}
            onPress={() => inList ? removeSymbol(symbol) : addSymbol(symbol)}
          >
            <Text style={[s.watchlistBtnText, inList && s.inListText]}>
              {inList ? 'In Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {quote && (
          <View style={s.quoteSection}>
            <Text style={s.price}>${quote.currentPrice?.toFixed(2)}</Text>
            <Text style={[s.change, isPositive ? s.positive : s.negative]}>
              {isPositive ? '+' : ''}{quote.change?.toFixed(2)} ({isPositive ? '+' : ''}{quote.percentChange?.toFixed(2)}%)
            </Text>
            <View style={s.statsGrid}>
              {[
                ['Open', quote.openPrice],
                ['High', quote.highPrice],
                ['Low', quote.lowPrice],
                ['Prev Close', quote.previousClose],
              ].map(([label, value]) => (
                <View key={label} style={s.stat}>
                  <Text style={s.statLabel}>{label}</Text>
                  <Text style={s.statValue}>${value?.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <StockChart symbol={symbol} />

        {profile && (profile.finnhubIndustry || profile.country) && (
          <View style={s.profileSection}>
            <Text style={s.profileTitle}>
              {profile.finnhubIndustry ? 'Company Info' : 'Fund Info'}
            </Text>
            <View style={s.profileGrid}>
              {profile.finnhubIndustry && (
                <View style={s.profileItem}>
                  <Text style={s.profileLabel}>Industry</Text>
                  <Text style={s.profileValue}>{profile.finnhubIndustry}</Text>
                </View>
              )}
              {profile.country && (
                <View style={s.profileItem}>
                  <Text style={s.profileLabel}>Country</Text>
                  <Text style={s.profileValue}>{profile.country}</Text>
                </View>
              )}
              {profile.exchange && (
                <View style={s.profileItem}>
                  <Text style={s.profileLabel}>Exchange</Text>
                  <Text style={s.profileValue}>{profile.exchange}</Text>
                </View>
              )}
              {profile.marketCapitalization > 0 && (
                <View style={s.profileItem}>
                  <Text style={s.profileLabel}>Market Cap</Text>
                  <Text style={s.profileValue}>
                    ${(profile.marketCapitalization / 1000).toFixed(1)}B
                  </Text>
                </View>
              )}
              {profile.weburl && (
                <View style={s.profileItem}>
                  <Text style={s.profileLabel}>Website</Text>
                  <Text
                    style={s.link}
                    onPress={() => Linking.openURL(profile.weburl)}
                  >
                    {profile.weburl.replace(/https?:\/\/(www\.)?/, '')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: 16 },
  loadingText: { color: colors.secondaryText, textAlign: 'center', marginTop: 40, fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logo: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  symbol: { color: colors.text, fontSize: 22, fontWeight: '800' },
  name: { color: colors.secondaryText, fontSize: 14 },
  watchlistBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  inList: { backgroundColor: colors.accent },
  watchlistBtnText: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  inListText: { color: '#fff' },
  quoteSection: { marginBottom: 8 },
  price: { color: colors.text, fontSize: 32, fontWeight: '800' },
  change: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  positive: { color: colors.green },
  negative: { color: colors.red },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 0,
  },
  stat: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: { color: colors.secondaryText, fontSize: 12, marginBottom: 2 },
  statValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  profileSection: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 8,
  },
  profileTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  profileGrid: { gap: 10 },
  profileItem: {},
  profileLabel: { color: colors.secondaryText, fontSize: 12, marginBottom: 2 },
  profileValue: { color: colors.text, fontSize: 14, fontWeight: '500' },
  link: { color: colors.accent, fontSize: 14 },
});
