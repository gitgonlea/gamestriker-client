// components/server/server-rank-chart.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ReloadIcon } from '@radix-ui/react-icons';
import { getRankStats } from '@/lib/api/servers';

interface ServerRankChartProps {
  serverId: number;
}

export default function ServerRankChart({ serverId }: ServerRankChartProps) {
  const { t } = useTranslation();
  const [rankStats, setRankStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchRankStats();
  }, [serverId]);
  
  const fetchRankStats = async () => {
    setIsLoading(true);
    try {
      const data = await getRankStats(serverId);
      setRankStats(data);
    } catch (error) {
      console.error('Error fetching rank stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-black bg-opacity-70 rounded">
        <ReloadIcon className="animate-spin h-8 w-8 text-amber-400" />
      </div>
    );
  }
  
  if (rankStats.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-black bg-opacity-70 rounded">
        <p className="text-amber-400">{t('noInfoAvailable')}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black bg-opacity-70 rounded h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rankStats} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
          <XAxis 
            dataKey="date" 
            interval={0} 
            tick={{ fontSize: 12, angle: -45 }}
          />
          <YAxis 
            type="number" 
            domain={[200, 1]} 
            allowDataOverflow={true}
            label={{ 
              value: t('rank'), 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Rank" 
            stroke="rgba(41, 217, 145, 0.8)" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}