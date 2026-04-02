import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { syncEngine } from './lib/syncEngine';
import NetInfo from '@react-native-community/netinfo';

// Screens
import PortfolioDashboard from './screens/PortfolioDashboard';
import AlertsScreen from './screens/AlertsScreen';
import TaxOptimizationScreen from './screens/TaxOptimizationScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const queryClient = new QueryClient();

function PortfolioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0066cc',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="PortfolioDashboard"
        component={PortfolioDashboard}
        options={{ title: 'Portfolio' }}
      />
    </Stack.Navigator>
  );
}

function AlertsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0066cc',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: 'Alerts' }}
      />
    </Stack.Navigator>
  );
}

function TaxStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0066cc',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TaxOptimization"
        component={TaxOptimizationScreen}
        options={{ title: 'Tax Optimization' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0066cc',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#cccccc',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="PortfolioTab"
        component={PortfolioStack}
        options={{
          title: 'Portfolio',
          tabBarLabel: 'Portfolio',
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsStack}
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="TaxTab"
        component={TaxStack}
        options={{
          title: 'Tax',
          tabBarLabel: 'Tax',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sync engine
        await syncEngine.initialize();

        // Check network status
        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
          setIsOnline(state.isConnected ?? false);
          syncEngine.setOnlineStatus(state.isConnected ?? false);
        });

        // Check authentication status
        // Replace with actual auth check
        const token = await getStoredToken();
        setIsAuthenticated(!!token);

        setIsInitialized(true);

        return () => {
          netInfoUnsubscribe();
          syncEngine.destroy();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        {isAuthenticated ? (
          <MainTabs />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </QueryClientProvider>
  );
}

async function getStoredToken() {
  // Replace with actual token retrieval from secure storage
  return null;
}
