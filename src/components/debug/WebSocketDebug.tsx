import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import webSocketService from '@/services/websocket-service';

const WebSocketDebug: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshStats = () => {
    setStats(webSocketService.getConnectionStats());
  };

  useEffect(() => {
    refreshStats();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStats, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleForceDisconnect = () => {
    webSocketService.forceDisconnect();
    refreshStats();
  };

  const handleLogStatus = () => {
    webSocketService.logConnectionStatus();
  };

  if (!stats) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white shadow-lg border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          WebSocket Debug
          <div className="flex gap-1">
            <Badge variant={stats.connected ? 'default' : 'destructive'}>
              {stats.connected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-6 w-6 p-0"
            >
              {autoRefresh ? '⏸️' : '▶️'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Connection Count:</strong> {stats.connectionCount}
          </div>
          <div>
            <strong>Is Connecting:</strong> {stats.isConnecting ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Socket ID:</strong> {stats.socketId || 'None'}
          </div>
          <div>
            <strong>Token:</strong> {stats.currentToken}
          </div>
        </div>
        
        <div>
          <strong>Joined Rooms ({stats.joinedRooms.length}):</strong>
          <div className="max-h-20 overflow-y-auto">
            {stats.joinedRooms.map((room: string, index: number) => (
              <div key={index} className="text-xs text-muted-foreground">
                {room}
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong>Listeners:</strong> {stats.listenerCount}
        </div>

        <div className="flex gap-1 pt-2">
          <Button size="sm" variant="outline" onClick={refreshStats}>
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={handleLogStatus}>
            Log
          </Button>
          <Button size="sm" variant="destructive" onClick={handleForceDisconnect}>
            Force DC
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSocketDebug;
