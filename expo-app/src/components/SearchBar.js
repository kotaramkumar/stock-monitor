import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet,
} from 'react-native';
import { searchSymbol } from '../services/finnhub';
import colors from '../theme/colors';

export default function SearchBar({ visible, onClose, onAdd, watchlist }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  function handleSearch(value) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchSymbol(value.trim());
        setResults(data.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function handleAdd(symbol) {
    onAdd(symbol);
    setQuery('');
    setResults([]);
    onClose();
  }

  function handleClose() {
    setQuery('');
    setResults([]);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Search Stocks</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={s.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={s.input}
            placeholder="Search symbol or name..."
            placeholderTextColor={colors.secondaryText}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCapitalize="characters"
          />
          {searching && <Text style={s.searchingText}>Searching...</Text>}
          <FlatList
            data={results}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => {
              const alreadyAdded = watchlist.includes(item.symbol);
              return (
                <TouchableOpacity
                  style={s.resultItem}
                  onPress={() => !alreadyAdded && handleAdd(item.symbol)}
                >
                  <View style={s.resultLeft}>
                    <Text style={s.resultSymbol}>{item.symbol}</Text>
                    {item.type === 'ETP' && <Text style={s.etfBadge}>ETF</Text>}
                  </View>
                  <Text style={s.resultDesc} numberOfLines={1}>{item.description}</Text>
                  <Text style={alreadyAdded ? s.alreadyAdded : s.addBtn}>
                    {alreadyAdded ? 'Added' : '+ Add'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  closeBtn: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  searchingText: { color: colors.secondaryText, fontSize: 13, marginBottom: 8 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', width: 80 },
  resultSymbol: { color: colors.text, fontWeight: '700', fontSize: 14 },
  etfBadge: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    backgroundColor: 'rgba(74,144,217,0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  resultDesc: { color: colors.secondaryText, flex: 1, fontSize: 13, marginRight: 8 },
  addBtn: { color: colors.green, fontWeight: '700', fontSize: 14 },
  alreadyAdded: { color: colors.secondaryText, fontSize: 13 },
});
