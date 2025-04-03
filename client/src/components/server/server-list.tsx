// components/server/server-list.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCaretUp, FaCaretDown, FaCrown, FaSkull } from 'react-icons/fa';
import Pagination from '@/components/ui/pagination';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { getServers } from '@/lib/api/servers';
import type { Server } from '@/types/server';

interface ServerListProps {
  initialServers?: Server[];
  initialTotalPages?: number;
  queryId?: string;
  value?: string;
  varValue?: string;
}

export default function ServerList({
  initialServers = [],
  initialTotalPages = 1,
  queryId,
  value,
  varValue,
}: ServerListProps) {
  const { t } = useTranslation();
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [isLoading, setIsLoading] = useState(initialServers.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [orderBy, setOrderBy] = useState<number>(2);
  const [orderDirection, setOrderDirection] = useState<boolean>(false);

  // Column mappings for sorting
  const orderColumns = ['rank_id', 'servername', 'numplayers', 'host', 'map'];

  useEffect(() => {
    if (initialServers.length === 0) {
      fetchServers();
    }
  }, [currentPage, queryId, value, varValue]);

  const fetchServers = async () => {
    setIsLoading(true);
    try {
      const response = await getServers({
        queryId,
        value,
        varValue,
        page: currentPage,
        orderBy: orderColumns[orderBy],
        orderDirection: orderDirection ? 'desc' : 'asc',
      });
      
      setServers(response.servers);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching server data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (index: number) => {
    setOrderBy(index);
    setOrderDirection(prev => !prev);
    
    // Sort the servers locally for immediate feedback
    const sortedServers = [...servers].sort((a, b) => {
      const valueA = typeof a[orderColumns[index]] === 'string' 
        ? (a[orderColumns[index]] as string).toLowerCase() 
        : a[orderColumns[index]];
      
      const valueB = typeof b[orderColumns[index]] === 'string' 
        ? (b[orderColumns[index]] as string).toLowerCase() 
        : b[orderColumns[index]];
      
      const statusA = a.status || 0;
      const statusB = b.status || 0;

      // Offline servers go to the bottom
      if (statusA === 0 && statusB !== 0) {
        return 1;
      } else if (statusA !== 0 && statusB === 0) {
        return -1;
      } else {
        if (typeof valueA === 'string') {
          const comparison = orderDirection ? valueA.localeCompare(valueB as string) : valueB.localeCompare(valueA as string);
          if (comparison === 0) {
            return b.numplayers - a.numplayers;
          }
          return comparison;
        } else {
          return orderDirection ? valueA - (valueB as number) : valueB - (valueA as number);
        }
      }
    });

    setServers(sortedServers);
  };

  const renderSortIcon = (columnIndex: number) => {
    if (orderBy !== columnIndex) return null;
    return orderDirection 
      ? <FaCaretDown className="inline ml-1" /> 
      : <FaCaretUp className="inline ml-1" />;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Determine the rank icon based on position
  const getRankIcon = (index: number) => {
    if (index > 2) return null;
    
    const classes = [
      'text-amber-400', // gold
      'text-gray-300',  // silver
      'text-amber-700', // bronze
    ];
    
    return <FaCrown className={`absolute left-1 top-1/2 transform -translate-y-1/2 ${classes[index]}`} />;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Pagination 
        totalPages={totalPages} 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
      />
      
      {/* Header */}
      <div className="w-full md:w-4/5 overflow-x-auto">
        <table className="w-full border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
          <thead>
            <tr className="bg-sky-600">
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-[10%] text-center"
                onClick={() => handleSort(2)}
              >
                {t('players')} {renderSortIcon(2)}
              </th>
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-[40%]"
                onClick={() => handleSort(1)}
              >
                {t('server')} {renderSortIcon(1)}
              </th>
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-[8%] text-center"
                onClick={() => handleSort(0)}
              >
                Rank {renderSortIcon(0)}
              </th>
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-[20%]"
                onClick={() => handleSort(3)}
              >
                IP {renderSortIcon(3)}
              </th>
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-[22%]"
                onClick={() => handleSort(4)}
              >
                {t('map')} {renderSortIcon(4)}
              </th>
            </tr>
          </thead>
        </table>
      
        {/* Server list */}
        <table className="w-full border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                </td>
              </tr>
            ) : servers.length > 0 ? (
              servers.map((server, index) => (
                <tr 
                  key={server.id || index} 
                  className={`
                    ${index % 2 === 0 ? 'bg-sky-400' : 'bg-sky-500'} 
                    ${server.status === 0 ? 'bg-red-700' : ''}
                    hover:bg-amber-400 transition-colors
                  `}
                >
                  <td className="py-2 px-2 text-center relative">
                    {server.status === 0 && index > 2 ? (
                      <FaSkull  className="absolute left-1 top-1/2 transform -translate-y-1/2" />
                    ) : (
                      ((orderDirection === true && orderBy === 0) || (orderDirection === false && orderBy === 2)) && 
                      getRankIcon(index)
                    )}
                    <span className="ml-4">
                      {server.numplayers}/{server.maxplayers}
                    </span>
                  </td>
                  <td className="py-2 px-2 truncate">
                    <Link 
                      href={`/servidor/${server.host}:${server.port}`}
                      className="hover:text-amber-200 truncate block"
                    >
                      {server.servername}
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {server.rank_id}
                  </td>
                  <td className="py-2 px-2 truncate">
                    {server.host}:{server.port}
                  </td>
                  <td className="py-2 px-2 truncate">
                    {server.map}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  {t('noServersFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}