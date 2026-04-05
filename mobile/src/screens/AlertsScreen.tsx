import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from 'react-query';
import { Bell, Trash2 } from 'react-native-feather';

interface Alert {
  alertId: string;
  symbol: string;
  alertType: 'above' | 'below' | 'change_percent';
  targetPrice: number;
  currentPrice: number;
  status: 'ACTIVE' | 'TRIGGERED';
  createdAt: string;
  triggeredAt?: string;
}

export default function AlertsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<Alert[]>([]);

  const { data: alertsData, isLoading, refetch } = useQuery(
    'alerts',
    async () => {
      // Replace with actual tRPC call
      const response = await fetch('/api/trpc/watchlistAlerts.getActiveAlerts.query', {
        credentials: 'include',
      });
      return response.json();
    }
  );

  useEffect(() => {
    if (alertsData) {
      setActiveAlerts(alertsData.activeAlerts || []);
      setTriggeredAlerts(alertsData.triggeredAlerts || []);
    }
  }, [alertsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteAlert = async (alertId: string) => {
    // Call delete API
    setActiveAlerts(activeAlerts.filter((a) => a.alertId !== alertId));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const renderAlertItem = (alert: Alert, isTriggered: boolean) => (
    <View
      key={alert.alertId}
      style={[
        styles.alertCard,
        isTriggered && styles.triggeredCard,
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.symbol}>{alert.symbol}</Text>
          <Text style={styles.alertType}>
            Price {alert.alertType === 'above' ? 'above' : 'below'} ${alert.targetPrice}
          </Text>
        </View>
        {isTriggered && (
          <View style={styles.triggeredBadge}>
            <Bell width={16} height={16} color="#10b981" />
            <Text style={styles.triggeredText}>Triggered</Text>
          </View>
        )}
      </View>

      <View style={styles.alertBody}>
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Current Price</Text>
          <Text style={styles.price}>${alert.currentPrice}</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Target Price</Text>
          <Text style={styles.price}>${alert.targetPrice}</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.label}>Difference</Text>
          <Text
            style={[
              styles.price,
              alert.currentPrice > alert.targetPrice
                ? styles.positive
                : styles.negative,
            ]}
          >
            {alert.currentPrice > alert.targetPrice ? '+' : ''}
            ${(alert.currentPrice - alert.targetPrice).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.alertFooter}>
        <Text style={styles.createdDate}>
          Created: {new Date(alert.createdAt).toLocaleDateString()}
        </Text>
        {!isTriggered && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAlert(alert.alertId)}
          >
            <Trash2 width={18} height={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Triggered Alerts ({triggeredAlerts.length})</Text>
          {triggeredAlerts.map((alert) => renderAlertItem(alert, true))}
        </View>
      )}

      {/* Active Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Alerts ({activeAlerts.length})</Text>
        {activeAlerts.length > 0 ? (
          activeAlerts.map((alert) => renderAlertItem(alert, false))
        ) : (
          <View style={styles.emptyState}>
            <Bell width={48} height={48} color="#cccccc" />
            <Text style={styles.emptyText}>No active alerts</Text>
            <Text style={styles.emptySubtext}>
              Create alerts to get notified when prices reach your targets
            </Text>
          </View>
        )}
      </View>

      {/* Create Alert Button */}
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Create New Alert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  triggeredCard: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  alertType: {
    fontSize: 12,
    color: '#666666',
  },
  triggeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  triggeredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  alertBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  priceInfo: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 11,
    color: '#999999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
