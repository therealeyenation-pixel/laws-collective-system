import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from 'react-query';

interface Portfolio {
  id: number;
  name: string;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  allTimeReturn: number;
  allTimeReturnPercent: number;
}

interface Holding {
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
  dayChange: number;
  dayChangePercent: number;
  allocation: number;
}

export default function PortfolioDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // Fetch portfolio data
  const { data: portfolioData, isLoading, refetch } = useQuery(
    'portfolio',
    async () => {
      // Replace with actual tRPC call
      const response = await fetch('/api/trpc/investmentMgmt.getPortfolio.query', {
        credentials: 'include',
      });
      return response.json();
    }
  );

  useEffect(() => {
    if (portfolioData) {
      setPortfolio(portfolioData.portfolio);
      setHoldings(portfolioData.holdings);
    }
  }, [portfolioData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
          portfolio?.totalValue || 0,
        ],
        strokeWidth: 2,
        color: () => '#0066cc',
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Portfolio Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.portfolioName}>{portfolio?.name}</Text>
        <Text style={styles.totalValue}>
          ${portfolio?.totalValue.toLocaleString()}
        </Text>
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.change,
              portfolio?.dayChange && portfolio.dayChange >= 0
                ? styles.positive
                : styles.negative,
            ]}
          >
            {portfolio?.dayChange && portfolio.dayChange >= 0 ? '+' : ''}
            ${portfolio?.dayChange.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.changePercent,
              portfolio?.dayChangePercent && portfolio.dayChangePercent >= 0
                ? styles.positive
                : styles.negative,
            ]}
          >
            ({portfolio?.dayChangePercent}%)
          </Text>
        </View>
        <Text style={styles.allTimeReturn}>
          All-time: {portfolio?.allTimeReturnPercent}%
        </Text>
      </View>

      {/* Chart */}
      {portfolio && (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: () => '#0066cc',
              labelColor: () => '#666666',
              strokeWidth: 2,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#0066cc',
              },
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Holdings List */}
      <View style={styles.holdingsContainer}>
        <Text style={styles.sectionTitle}>Holdings</Text>
        {holdings.map((holding, index) => (
          <View key={index} style={styles.holdingRow}>
            <View style={styles.holdingInfo}>
              <Text style={styles.symbol}>{holding.symbol}</Text>
              <Text style={styles.quantity}>
                {holding.quantity} shares @ ${holding.currentPrice}
              </Text>
            </View>
            <View style={styles.holdingValue}>
              <Text style={styles.value}>${holding.value.toLocaleString()}</Text>
              <Text
                style={[
                  styles.holdingChange,
                  holding.dayChange >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {holding.dayChange >= 0 ? '+' : ''}
                {holding.dayChangePercent}%
              </Text>
            </View>
            <View style={styles.allocation}>
              <View style={styles.allocationBar}>
                <View
                  style={[
                    styles.allocationFill,
                    { width: `${holding.allocation}%` },
                  ]}
                />
              </View>
              <Text style={styles.allocationPercent}>{holding.allocation}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={[styles.button, styles.primaryButton]}>
          <Text style={styles.buttonText}>Rebalance</Text>
        </View>
        <View style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.buttonText}>Add Holding</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  changePercent: {
    fontSize: 14,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  allTimeReturn: {
    fontSize: 12,
    color: '#999999',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 8,
  },
  holdingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  holdingInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#666666',
  },
  holdingValue: {
    alignItems: 'flex-end',
    marginHorizontal: 12,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  holdingChange: {
    fontSize: 12,
  },
  allocation: {
    width: 60,
  },
  allocationBar: {
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  allocationFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  allocationPercent: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
