// app/jugador/[playerName]/[address]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReloadIcon, ChevronLeftIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { getPlayerServerStats } from '@/lib/api/players';
import { formatTime, formatDate, scorePerMinute } from '@/lib/utils/formatters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface PlayerServerStatsPageProps {
  params: {
    playerName: string;
    address: string;
  };
}

export default function PlayerServerStatsPage({ params }: PlayerServerStatsPageProps) {
  const { playerName, address } = params;
  const { t, locale } = useTranslation();
  
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [playerScore, setPlayerScore] = useState<any[]>([]);
  const [playerTime, setPlayerTime] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [days, setDays] = useState(0);
  
  useEffect(() => {
    fetchData();
  }, [days]);
  
  const fetchData = async () => {
    try {
      const [host, port] = address.split(':');
      
      const response = await getPlayerServerStats(playerName, host, port, days);
      
      if (response.player_data && response.player_data.length > 0) {
        setPlayerData(response.player_data);
        
        // Handle language differences in the score data
        if (locale === 'en' && response.player_score) {
          response.player_score.Score = response.player_data[0].Puntaje;
          delete response.player_data[0].Puntaje;
        }
        
        setPlayerScore(response.player_score || []);
        setPlayerTime(response.player_time || []);
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingChart(false);
    }
  };
  
  const clickDays = (value: number) => {
    if (days === value) return;
    
    setIsLoadingChart(true);
    setDays(value);
  };
  
  // Format chart ticks to avoid overcrowding
  const tickFormatter = (value: string, index: number, data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return value;
    }
    if (data.length <= 4) {
      return value;
    }
    if (index % 4 !== 0) {
      return '';
    }
    return value;
  };
  
  // Simple bar chart component for reuse
  const SimpleBarChart = ({ data, dataKey }: { data: any[]; dataKey: string }) => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey={days === 0 ? "hour" : "day"} 
            tickFormatter={(value, index) => tickFormatter(value, index, data)}
          />
          <YAxis />
          {!isLoadingChart && <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }} />}
          <Legend />
          <Bar dataKey={dataKey} fill="rgb(255, 184, 28)" barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (playerData.length === 0) {
    return (
      <div className="bg-black bg-opacity-70 w-[95%] md:w-4/5 mx-auto p-6 text-center">
        <div className="text-xl text-red-500 mb-4">
          {t('noInfoAvailable')}
        </div>
        <Link 
          href={`/jugador/${playerName}`}
          className="text-amber-400 hover:underline"
        >
          &larr; {t('backToPlayerProfile')}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row justify-between w-[95%] md:w-4/5 mx-auto gap-4">
      {/* Left section - Player info */}
      <div className="flex-1">
        <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-6 py-2 z-10 mb-4">
          <Link 
            href={`/jugador/${playerName}`}
            className="flex items-center text-amber-400 hover:underline"
          >
            <ChevronLeftIcon className="mr-1" />
            {playerName} {t('statistics')}
          </Link>
        </div>
        
        <div className="bg-black bg-opacity-60 p-6 rounded">
          <div className="mb-6">
            <h3 className="text-sm uppercase text-amber-400 font-semibold mb-2">{t('summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                {t('firstSeen')}: <span className="text-amber-300">
                  {formatDate(playerData[0].first_seen, locale)}
                </span>
              </div>
              <div>
                {t('lastSeen')}: <span className="text-amber-300">
                  {formatDate(playerData[0].last_seen, locale)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm uppercase text-amber-400 font-semibold mb-2">
              {t('allTimeStatistics')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                {t('score')}: <span className="text-amber-300">{playerData[0].score}</span>
              </div>
              <div>
                {t('minutesPlayed')}: <span className="text-amber-300">
                  {parseInt(String(playerData[0].playtime / 60))}
                </span>
              </div>
              <div>
                {t('scorePerMinute')}: <span className="text-amber-300">
                  {scorePerMinute(playerData[0].score, playerData[0].playtime)}
                </span>
              </div>
              <div>
                {t('rankInServer')}: <span className="text-amber-300">
                  #{playerData[0].rank_id} {t('of')} #{playerData[0].rank_total}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm uppercase text-amber-400 font-semibold mb-2">
              {t('serverInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="col-span-1 md:col-span-2">
                {t('serverName')}: <Link 
                  href={`/servidor/${address}`}
                  className="text-sky-400 hover:underline"
                >
                  {playerData[0].servername}
                </Link>
              </div>
              <div>
                {t('status')}: <span className={playerData[0].status ? 'text-green-500' : 'text-red-500'}>
                  {playerData[0].status ? t('online') : t('offline')}
                </span>
              </div>
              <div>
                {t('ipAddress')}: <span className="text-amber-300">{playerData[0].host}</span>&nbsp;
                {t('port')}: <span className="text-amber-300">{playerData[0].port}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section - Charts */}
      <div className="flex-1">
        <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-6 py-2 z-10 mb-4">
          <h2 className="uppercase text-amber-400 font-semibold">
            {t('historicalData')}
          </h2>
        </div>
        
        <div className="bg-black bg-opacity-60 p-6 rounded">
          <div className="flex items-center justify-between mb-4">
            <div className="text-amber-400">{t('informationFor')}:</div>
            <div className="flex space-x-2">
              <button 
                onClick={() => clickDays(0)} 
                className={`px-3 py-1 text-xs rounded ${days === 0 
                  ? 'bg-amber-400 text-black' 
                  : 'bg-sky-500 text-white hover:bg-sky-600'} transition-colors`}
              >
                24 {t('hours')}
              </button>
              <button 
                onClick={() => clickDays(7)} 
                className={`px-3 py-1 text-xs rounded ${days === 7 
                  ? 'bg-amber-400 text-black' 
                  : 'bg-sky-500 text-white hover:bg-sky-600'} transition-colors`}
              >
                7 {t('days')}
              </button>
              <button 
                onClick={() => clickDays(30)} 
                className={`px-3 py-1 text-xs rounded ${days === 30 
                  ? 'bg-amber-400 text-black' 
                  : 'bg-sky-500 text-white hover:bg-sky-600'} transition-colors`}
              >
                30 {t('days')}
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm uppercase text-amber-400 font-semibold mb-2">
              {t('score')}:
            </h3>
            <div className="relative h-64">
              {!isLoadingChart && playerScore.length <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                  {t('noInfoAvailable')}
                </div>
              )}
              {isLoadingChart && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ReloadIcon className="animate-spin text-amber-400 h-8 w-8" />
                </div>
              )}
              <SimpleBarChart 
                data={isLoadingChart ? [] : playerScore} 
                dataKey="Puntaje"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm uppercase text-amber-400 font-semibold mb-2">
              {t('timePlayed')}:
            </h3>
            <div className="relative h-64">
              {!isLoadingChart && playerTime.length <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                  {t('noInfoAvailable')}
                </div>
              )}
              {isLoadingChart && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ReloadIcon className="animate-spin text-amber-400 h-8 w-8" />
                </div>
              )}
              <SimpleBarChart 
                data={isLoadingChart ? [] : playerTime} 
                dataKey="Tiempo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}