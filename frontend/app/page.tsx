'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type HealthData = {
  status: string;
  timestamp: string;
};

export default function Home() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/health');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Backend Health Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchHealth} disabled={loading} className="w-full">
              {loading ? 'Đang gọi...' : '📡 Gọi API Health'}
            </Button>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-red-700 border border-red-200">
                  ❌ Lỗi: {error}
                </div>
            )}

            {data && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Trạng thái:</span>
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                      {data.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Timestamp:</span>
                    <span className="text-sm">
                  {new Date(data.timestamp).toLocaleString('vi-VN')}
                </span>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
}