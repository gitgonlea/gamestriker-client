// components/server/server-player-stats.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ReloadIcon } from '@radix-ui/react-icons';
import { getPlayerStats } from '@/lib/api/servers';
import { tickFormatter } from '@/lib/utils/formatters';
import type { PlayerData } from '@/types/server';

interface ServerPlayerStatsProps {
  serverId: number;
  hoursSelected: number;
  currentPlayers: number;
}

export default function ServerPlayerStats({ 
  serverId, 
  hoursSelected, 
  currentPlayers 
}: ServerPlayerStatsProps) {
  const { t, locale } = useTranslation();
  const [playerStats, setPlayerStats] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPlayerStats();
  }, [hoursSelected, serverId]);
  
  const fetchPlayerStats = async () => {
    setIsLoading(true);
    try {
      const data = await getPlayerStats(serverId, hoursSelected);
      
      // Add current player count if showing 24 hours
      if (hoursSelected === 0) {
        const todayData = {
          day: '1',
          hour: 'ahora',
          Jugadores: currentPlayers,
          Players: currentPlayers
        };
        data.push(todayData);
      }
      
      setPlayerStats(data);
    } catch (error) {
      console.error('Error fetching player stats:', error);
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
  
  if (playerStats.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-black bg-opacity-70 rounded">
        <p className="text-amber-400">{t('noInfoAvailable')}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-black bg-opacity-70 rounded h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={playerStats} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
          <XAxis 
            dataKey={hoursSelected === 0 ? "hour" : "day"} 
            tickFormatter={(value, index) => tickFormatter(value, index, playerStats)}
          />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={locale === 'en' ? "Players" : "Jugadores"} 
            stroke="rgba(41, 217, 145, 0.8)" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}