import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, Trash2, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function WatchlistAlerts() {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    alertType: "above" as const,
    targetPrice: 0,
    notificationMethod: ["email"] as const[],
  });

  const { data: activeAlerts, isLoading } =
    trpc.watchlistAlerts.getActiveAlerts.useQuery({
      limit: 20,
      offset: 0,
    });

  const { data: triggeredAlerts } =
    trpc.watchlistAlerts.getTriggeredAlerts.useQuery({
      limit: 20,
      offset: 0,
    });

  const { data: history } = trpc.watchlistAlerts.getNotificationHistory.useQuery({
    limit: 50,
    offset: 0,
    days: 30,
  });

  const createAlert = trpc.watchlistAlerts.createPriceAlert.useMutation({
    onSuccess: () => {
      setShowCreateAlert(false);
      setNewAlert({
        symbol: "",
        alertType: "above",
        targetPrice: 0,
        notificationMethod: ["email"],
      });
    },
  });

  const deleteAlert = trpc.watchlistAlerts.deleteAlert.useMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Watchlist Alerts</h1>
        <Button
          onClick={() => setShowCreateAlert(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Alert
        </Button>
      </div>

      {/* Active Alerts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
        {activeAlerts && activeAlerts.alerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.alerts.map((alert: any) => (
              <div
                key={alert.alertId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{alert.symbol}</p>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {alert.alertType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Target: ${alert.targetPrice} | Current: ${alert.currentPrice}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAlert.mutate({ alertId: alert.alertId })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No active alerts</p>
        )}
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts && triggeredAlerts.alerts.length > 0 && (
        <Card className="p-6 border-l-4 border-l-green-600">
          <h2 className="text-xl font-semibold mb-4">Triggered Alerts</h2>
          <div className="space-y-3">
            {triggeredAlerts.alerts.map((alert: any) => (
              <div
                key={alert.alertId}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-lg">{alert.symbol}</p>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      TRIGGERED
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Target: ${alert.targetPrice} | Current: ${alert.currentPrice}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notification History */}
      {history && history.notifications.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Notification History ({history.unreadCount} unread)
          </h2>
          <div className="space-y-2">
            {history.notifications.slice(0, 10).map((notif: any) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg ${
                  notif.read ? "bg-gray-50" : "bg-blue-50 border-l-4 border-l-blue-600"
                }`}
              >
                <p className={notif.read ? "text-gray-600" : "font-semibold"}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notif.sentAt).toLocaleString()} via{" "}
                  {notif.notificationMethod}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Create Price Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, symbol: e.target.value })
                  }
                  placeholder="e.g., AAPL"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alert Type
                </label>
                <select
                  value={newAlert.alertType}
                  onChange={(e) =>
                    setNewAlert({
                      ...newAlert,
                      alertType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                  <option value="change_percent">Percent Change</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Price
                </label>
                <input
                  type="number"
                  value={newAlert.targetPrice}
                  onChange={(e) =>
                    setNewAlert({
                      ...newAlert,
                      targetPrice: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notification Methods
                </label>
                <div className="space-y-2">
                  {["email", "sms", "in_app"].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAlert.notificationMethod.includes(
                          method as any
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAlert({
                              ...newAlert,
                              notificationMethod: [
                                ...newAlert.notificationMethod,
                                method as any,
                              ],
                            });
                          } else {
                            setNewAlert({
                              ...newAlert,
                              notificationMethod:
                                newAlert.notificationMethod.filter(
                                  (m) => m !== method
                                ),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="capitalize">{method.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateAlert(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createAlert.mutate(newAlert)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={createAlert.isPending}
              >
                {createAlert.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Alert"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
