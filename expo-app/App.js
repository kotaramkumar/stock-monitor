import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import { useWatchlist } from './src/hooks/useWatchlist';
import colors from './src/theme/colors';

const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function App() {
  const { watchlist, addSymbol, removeSymbol, isInWatchlist } = useWatchlist();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen name="Dashboard" options={{ headerShown: false }}>
            {(props) => (
              <DashboardScreen
                {...props}
                watchlist={watchlist}
                addSymbol={addSymbol}
                removeSymbol={removeSymbol}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="StockDetail"
            options={({ route }) => ({ title: route.params.symbol })}
          >
            {(props) => (
              <StockDetailScreen
                {...props}
                isInWatchlist={isInWatchlist}
                addSymbol={addSymbol}
                removeSymbol={removeSymbol}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
