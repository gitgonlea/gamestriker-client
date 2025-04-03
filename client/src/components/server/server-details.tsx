'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaGlobe, FaQuestionCircle, FaTimes, 
  FaCog, FaCaretUp, FaCaretDown, FaEyeSlash 
} from 'react-icons/fa';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { formatTime, formatDate } from '@/lib/utils/formatters';
import { isValidIpAddress, isValidPort } from '@/lib/utils/validators';
import { getServerDetails, getServerPlayers, getServerTop } from '@/lib/api/servers';
import type { ServerDetail, ServerPlayer } from '@/types/server';
import ServerBanner from './server-banner';
import ServerMapCharts from './server-map-charts';
import ServerPlayerStats from './server-player-stats';
import ServerRankChart from './server-rank-chart';

interface ServerDetailsProps {
  address: string;
  initialData?: ServerDetail;
}

export default function ServerDetails({ address, initialData }: ServerDetailsProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  const [serverData, setServerData] = useState<ServerDetail | null>(initialData || null);
  const [playerList, setPlayerList] = useState<ServerPlayer[]>([]);
  const [topList, setTopList] = useState<ServerPlayer[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [imageMap, setImageMap] = useState('');
  const [playerListOrderBy, setPlayerListOrderBy] = useState(2);
  const [topListOrderBy, setTopListOrderBy] = useState(2);
  const [playerListOrderDirection, setPlayerListOrderDirection] = useState(false);
  const [topListOrderDirection, setTopListOrderDirection] = useState(false);
  const [hoursSelected, setHoursSelected] = useState(0);
  
  const [invalidAddress, setInvalidAddress] = useState(false);
  // Replace dynamic timestamp with a stable counter - this is key for hydration fix
  const [bannerVersion, setBannerVersion] = useState<number>(1);
  const [lastUpdateInterval, setLastUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Order columns for sorting
  const orderColumns = ['rank', 'player_name', 'score', 'playtime'];

  useEffect(() => {
    if (!initialData) {
      fetchServerData();
    } else {
      setupMapImage();
      setupLastUpdateInterval();
    }
    
    // Cleanup interval on unmount
    return () => {
      if (lastUpdateInterval) clearInterval(lastUpdateInterval);
    };
  }, [address]);
  
  const setupLastUpdateInterval = () => {
    if (serverData && serverData.last_update) {
      const lastUpdateDateTime = new Date(serverData.last_update);
      const lastUpdateTimestamp = lastUpdateDateTime.getTime();
      
      if (lastUpdateTimestamp) {
        const interval = setInterval(() => {
          const now = new Date();
          const differenceInMilliseconds = Math.abs(lastUpdateTimestamp - now.getTime());
          const difference = differenceInMilliseconds / 1000;
          
          setElapsedTime(difference);
        }, 1000);
        
        setLastUpdateInterval(interval);
      }
    }
  };
  
  const setupMapImage = () => {
    if (serverData && serverData.map) {
      setImageMap(`/maps/${serverData.map}.jfif`);
    }
  };
  
  const fetchServerData = async () => {
    setIsLoading(true);
    try {
      const [host, port] = address.split(':');
      
      // Validate IP address and port
      if (!isValidIpAddress(host) || !isValidPort(port)) {
        setInvalidAddress(true);
        setIsLoading(false);
        return;
      }
      
      const data = await getServerDetails(host, port);
      
      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setServerData(data[0]);
      document.title = data[0].servername;
      
      // Update the banner version AFTER initial hydration is complete
      // This is safe since this code only runs when fetchServerData is called
      // which happens after the component is mounted
      setBannerVersion(prev => prev + 1);
      
      // Setup map image
      setImageMap(`/maps/${data[0].map}.jfif`);
      
      // Fetch players and top players
      if (data[0].id) {
        fetchPlayers(data[0].id);
        fetchTop(data[0].id);
      }
      
      // Setup last update interval
      setupLastUpdateInterval();
    } catch (error) {
      console.error('Error fetching server data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPlayers = async (serverId: number) => {
    try {
      const players = await getServerPlayers(serverId);
      assignRanks(players, 0);
    } catch (error) {
      console.error('Error fetching server players:', error);
    }
  };
  
  const fetchTop = async (serverId: number) => {
    try {
      const topPlayers = await getServerTop(serverId);
      assignRanks(topPlayers, 1);
    } catch (error) {
      console.error('Error fetching top players:', error);
    }
  };
  
  const assignRanks = (data: ServerPlayer[], type: number) => {
    if (!data || data.length === 0) {
      return;
    }
    
    const scoreProperty = type === 1 ? 'score' : 'current_score';
    // Make a safe copy of the data with default values for undefined properties
    const sortedData = [...data].sort((a, b) => {
      const scoreA = a[scoreProperty] !== undefined ? a[scoreProperty] : 0;
      const scoreB = b[scoreProperty] !== undefined ? b[scoreProperty] : 0;
      return scoreB - scoreA;
    });
    
    let currentRank = 1;
    // Use a safe default of 0 if the first item's score is undefined
    let currentScore = sortedData.length > 0 && sortedData[0][scoreProperty] !== undefined 
      ? sortedData[0][scoreProperty] 
      : 0;
    
    sortedData.forEach((item, index) => {
      const itemScore = item[scoreProperty] !== undefined ? item[scoreProperty] : 0;
      if (itemScore < currentScore) {
        currentRank = index + 1;
        currentScore = itemScore;
      }
      item.rank = currentRank;
    });
    
    if (type === 1) {
      setTopList(sortedData);
    } else {
      setPlayerList(sortedData);
    }
  };
  
  const handleCellClick = (index: number, type: boolean) => {
    if (type) {
      setPlayerListOrderDirection(prev => !prev);
      setPlayerListOrderBy(index);
      setPlayerList(orderPlayerData(index, type));
    } else {
      setTopListOrderDirection(prev => !prev);
      setTopListOrderBy(index);
      setTopList(orderPlayerData(index, type));
    }
  };
  
  const orderPlayerData = (oid: number, type: boolean) => {
    const dataList = type ? playerList : topList;
    const orderDirection = type ? playerListOrderDirection : topListOrderDirection;
    
    return [...dataList].sort((a, b) => {
      // Handle possibly undefined values with safe defaults
      const valueA = typeof a[orderColumns[oid]] === 'string'
        ? ((a[orderColumns[oid]] as string) || '').toLowerCase()
        : (a[orderColumns[oid]] as number) || 0;
        
      const valueB = typeof b[orderColumns[oid]] === 'string'
        ? ((b[orderColumns[oid]] as string) || '').toLowerCase()
        : (b[orderColumns[oid]] as number) || 0;
      
      if (typeof valueA === 'string') {
        return orderDirection
          ? (valueB as string).localeCompare(valueA)
          : valueA.localeCompare(valueB as string);
      } else {
        return orderDirection
          ? (valueB as number) - (valueA as number)
          : (valueA as number) - (valueB as number);
      }
    });
  };
  
  const renderSortIcon = (columnIndex: number, type: boolean) => {
    const orderBy = type ? playerListOrderBy : topListOrderBy;
    const orderDirection = type ? playerListOrderDirection : topListOrderDirection;
    
    if (orderBy !== columnIndex) return null;
    
    return orderDirection
      ? <FaCaretDown className="inline-block ml-1" />
      : <FaCaretUp className="inline-block ml-1" />;
  };
  
  const handleImageError = () => {
    setImageMap('notfound');
  };
  
  // Function to manually refresh the banner if needed
  const refreshBanner = () => {
    setBannerVersion(prev => prev + 1);
  };
  
  // If server data is loading or not found
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // If server is not found or invalid address
  if (!serverData || invalidAddress) {
    return (
      <div className="bg-black bg-opacity-70 w-[95%] md:w-4/5 mx-auto">
        <div className="bg-black bg-opacity-70 p-3 flex items-center text-xl text-red-500 font-semibold uppercase">
          <FaTimes className="mr-2" />
          {invalidAddress 
            ? t('invalidServerAddress', { address }) 
            : t('serverNotFound')}
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            {invalidAddress
              ? t('invalidAddressMessage', { address })
              : t('serverNotFoundReason')}
          </div>
          
          {!invalidAddress && (
            <ul className="list-disc ml-6 space-y-1">
              <li>{t('badUrlReason')}</li>
              <li>{t('ipChangedReason')}</li>
              <li>{t('serverDeletedReason')}</li>
            </ul>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row justify-between w-[95%] md:w-4/5 mx-auto">
      {/* Left section */}
      <div className="flex-grow lg:w-7/10 lg:mr-4">
        {/* Server details header */}
        <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-6 py-2 flex justify-between items-center z-10">
          <h2 className="uppercase text-amber-400 text-lg font-semibold">
            {t('serverDetails')}
          </h2>
          
          {elapsedTime !== 0 && (
            <div className="text-gray-300 text-sm">
              {t('lastScanned')} {formatTime(elapsedTime, 1, true)} {t('ago')}
            </div>
          )}
        </div>
        
        {/* Server info */}
        <div className="bg-black bg-opacity-60 p-6 rounded">
          <div className="flex flex-col md:flex-row justify-between">
            {/* Server basic info */}
            <div className="relative max-w-[60%] z-10">
              <div className="mb-2">
                <span className="text-amber-400 font-semibold">{t('name')}: </span>
                <span>{serverData.servername}</span>
              </div>
              
              <div className="mb-2">
                <span>IP: </span>
                <span className="text-amber-400">{serverData.host}</span>
                &nbsp;&nbsp;{t('port')}: <span className="text-amber-400">{serverData.port}</span>
              </div>
              
              <div className="mb-4">
                {t('status')}: 
                <span className={`ml-2 ${serverData.status ? 'text-green-500' : 'text-red-500'}`}>
                  {serverData.status ? t('online') : t('offline')} 
                  <FaGlobe className="inline ml-1" />
                </span>
              </div>
              
              {/* Server variables link */}
              <div className="uppercase text-amber-400 font-semibold mb-2 server-vars">
                <Link href={`/servidor/${address}/server-variables`} className="flex items-center">
                  <FaCog className="mr-1" /> {t('serverVariables')}
                </Link>
              </div>
              
              {/* Server ranking */}
              <div className="uppercase text-amber-400 font-semibold mb-1">
                {t('ranking')}
              </div>
              
              <div className="mb-1">
                {t('serverRank')}: 
                <span className="text-amber-400 ml-1">
                  {serverData.rank_id}º ({serverData.percentile}º {t('percentile')})
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-[90%] h-8 border border-gray-400 bg-gradient-to-r from-sky-500 via-white to-amber-400 mb-2">
                <div className="h-full flex items-center justify-end" style={{ width: `${serverData.percentile}%` }}>
                  <span className="bg-black px-1 py-0.5 text-xs rounded mr-1">
                    {serverData.percentile}º
                  </span>
                </div>
              </div>
              
              {/* Ranking details */}
              <div className="flex justify-between text-sm">
                <div>
                  {t('higherPastMonth')}:
                  <span className="text-amber-400 ml-1">
                    {serverData.ServerRanks?.[0]?.lowest_rank > 0 
                      ? `${serverData.ServerRanks[0].lowest_rank}º`
                      : (
                        <span className="text-white">
                          <FaQuestionCircle className="inline" title={t('noInfoAvailable')} />
                        </span>
                      )
                    }
                  </span>
                </div>
                
                <div className="ml-8">
                  {t('lowerPastMonth')}:
                  <span className="text-amber-400 ml-1">
                    {serverData.ServerRanks?.[0]?.highest_rank > 0 
                      ? `${serverData.ServerRanks[0].highest_rank}º`
                      : (
                        <span className="text-white">
                          <FaQuestionCircle className="inline" title={t('noInfoAvailable')} />
                        </span>
                      )
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Map info */}
            <div className="md:mr-4">
              <div className="text-sm text-green-400 font-semibold uppercase">
                {t('currentMap')}:
              </div>
              
              <div className="bg-black bg-opacity-60 border border-black border-opacity-60 p-1 rounded">
                {serverData.status === 0 ? (
                  <div className="flex items-center justify-center text-red-500">
                    {t('unknown')}
                    <FaTimes className="ml-1" />
                  </div>
                ) : (
                  <>
                    <div className="bg-black border border-black text-xs p-1">
                      {serverData.map}
                    </div>
                    
                    {imageMap && (
                      imageMap === 'notfound' ? (
                        <div className="text-center mt-1 text-2xl">
                          <FaEyeSlash />
                        </div>
                      ) : (
                        <Image 
                          src={imageMap}
                          alt={serverData.map}
                          width={160}
                          height={120}
                          className="w-full h-auto"
                          onError={handleImageError}
                        />
                      )
                    )}
                  </>
                )}
              </div>
              
              <div className="mt-1 text-sm text-green-400">
                {t('players')}:&nbsp;
                <span className="text-white">
                  {serverData.numplayers}/{serverData.maxplayers}
                </span>
              </div>
              
              <div className="text-sm text-green-400">
                {t('averageLastMonth')}:&nbsp;
                {serverData.monthly_avg > 0 ? (
                  <span className="text-white">
                    {serverData.monthly_avg}
                  </span>
                ) : (
                  <span className="text-white">
                    <FaQuestionCircle className="inline" title={t('noInfoAvailable')} />
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Server banner */}
          <div className="mt-4">
            <h3 className="uppercase text-amber-400 font-semibold mb-1">
              {t('serverBanner')}
            </h3>
            
            <ServerBanner 
              address={address} 
              timestamp={bannerVersion} 
            />
          </div>
          
          {/* Players online */}
          <div className="mt-4">
            <h3 className="uppercase text-amber-400 font-semibold mb-1">
              {t('playersOnline')}
            </h3>
            
            <table className="w-full md:w-3/4 border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
              <thead>
                <tr className="bg-sky-600">
                  <th 
                    className="p-2 text-left cursor-pointer w-[8%]"
                    onClick={() => handleCellClick(0, true)}
                  >
                    Rank {renderSortIcon(0, true)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[60%]"
                    onClick={() => handleCellClick(1, true)}
                  >
                    {t('name')} {renderSortIcon(1, true)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[18%]"
                    onClick={() => handleCellClick(2, true)}
                  >
                    {t('score')} {renderSortIcon(2, true)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[15%]"
                    onClick={() => handleCellClick(3, true)}
                  >
                    {t('timePlayed')} {renderSortIcon(3, true)}
                  </th>
                </tr>
              </thead>
            </table>
            
            <table className="w-full md:w-3/4 border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
              <tbody>
                {playerList.length > 0 ? (
                  playerList.map((player, index) => (
                    <tr 
                      key={`player-${index}`}
                      className={`${index % 2 === 0 ? 'bg-sky-400' : 'bg-sky-500'} hover:bg-amber-400`}
                    >
                      <td className="p-2 w-[8%]">{player.rank}</td>
                      <td className="p-2 w-[60%] truncate">
                        <Link href={`/jugador/${player.player_name}/${address}`} className="block truncate">
                          {player.player_name} 
                          {player.BOT === 1 && (
                            <span className="text-amber-400 text-shadow"> (BOT)</span>
                          )}
                        </Link>
                      </td>
                      <td className="p-2 w-[18%]">{player.current_score}</td>
                      <td className="p-2 w-[15%]">
                        {formatTime(player.current_playtime || 0, 1, false)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-sky-400">
                    <td colSpan={4} className="p-3 text-center">
                      {t('noPlayersOnline')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Top 10 players */}
          <div className="mt-4">
            <h3 className="uppercase text-amber-400 font-semibold mb-1">
              {t('top10Players')} ({t('onlineAndOffline')})
            </h3>
            
            <table className="w-full md:w-3/4 border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
              <thead>
                <tr className="bg-sky-600">
                  <th 
                    className="p-2 text-left cursor-pointer w-[8%]"
                    onClick={() => handleCellClick(0, false)}
                  >
                    Rank {renderSortIcon(0, false)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[60%]"
                    onClick={() => handleCellClick(1, false)}
                  >
                    {t('name')} {renderSortIcon(1, false)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[18%]"
                    onClick={() => handleCellClick(2, false)}
                  >
                    {t('score')} {renderSortIcon(2, false)}
                  </th>
                  <th 
                    className="p-2 text-left cursor-pointer w-[15%]"
                    onClick={() => handleCellClick(3, false)}
                  >
                    {t('timePlayed')} {renderSortIcon(3, false)}
                  </th>
                </tr>
              </thead>
            </table>
            
            <table className="w-full md:w-3/4 border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
              <tbody>
                {topList.length > 0 ? (
                  topList.map((player, index) => (
                    <tr 
                      key={`top-${index}`}
                      className={`${index % 2 === 0 ? 'bg-sky-400' : 'bg-sky-500'} hover:bg-amber-400`}
                    >
                      <td className="p-2 w-[8%]">{player.rank}</td>
                      <td className="p-2 w-[60%] truncate">
                        <Link href={`/jugador/${player.player_name}/${address}`} className="block truncate">
                          {player.player_name}
                        </Link>
                      </td>
                      <td className="p-2 w-[18%]">{player.score}</td>
                      <td className="p-2 w-[15%]">
                        {formatTime(player.playtime || 0, 0, false)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-sky-400">
                    <td colSpan={4} className="p-3 text-center">
                      {t('noInfoAvailable')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Right section - Historical Data */}
      <div className="mt-4 lg:mt-0 lg:w-3/10 bg-black bg-opacity-60">
        <div className="bg-black bg-opacity-60 p-2 uppercase text-amber-400 font-semibold">
          {t('historicalData')}
        </div>
        
        {/* Map statistics */}
        <div className="p-4">
          <div className="flex justify-between w-[90%] text-green-400">
            <div className="text-base">{t('favoriteMaps')}</div>
            <div className="text-sm">{t('lastWeek')}</div>
          </div>
          
          <ServerMapCharts serverData={serverData} />
        </div>
        
        {/* Player count statistics */}
        <div className="p-4 mt-6">
          <div className="flex justify-between w-[90%] text-green-400">
            <div className="text-base">{t('players')}</div>
            <div className="text-sm">
              {t('past')}: 
              <button 
                className={`ml-1 ${hoursSelected === 0 ? 'text-white' : 'text-green-400'} hover:text-white transition-colors`}
                onClick={() => setHoursSelected(0)}
              >
                24 {t('hours')}
              </button> | 
              <button 
                className={`ml-1 ${hoursSelected === 1 ? 'text-white' : 'text-green-400'} hover:text-white transition-colors`}
                onClick={() => setHoursSelected(1)}
              >
                7 {t('days')}
              </button>
            </div>
          </div>
          
          <ServerPlayerStats 
            serverId={serverData.id} 
            hoursSelected={hoursSelected} 
            currentPlayers={playerList.length} 
          />
        </div>
        
        {/* Server rank chart */}
        <div className="p-4 mt-6">
          <div className="flex justify-between w-[90%] text-green-400">
            <div className="text-base">{t('serverRank')}</div>
            <div className="text-sm">30 {t('days')}</div>
          </div>
          
          <ServerRankChart serverId={serverData.id} />
        </div>
      </div>
    </div>
  );
}