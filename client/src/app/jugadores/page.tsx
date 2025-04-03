'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@/lib/hooks/useTranslation';
import SearchBar from '@/components/search/search-bar';
import Pagination from '@/components/ui/pagination';
import { getPlayers } from '@/lib/api/players';

interface PlayersPageProps {
  searchParams?: {
    name?: string;
    online?: string;
  };
}

export default function PlayersPage({ searchParams }: PlayersPageProps) {
  const { t } = useTranslation();
  const urlSearchParams = useSearchParams();
  
  const initialName = searchParams?.name || urlSearchParams.get('name') || '';
  const initialOnline = searchParams?.online === 'true' || urlSearchParams.get('online') === 'true';
  
  const [selectedValue, setSelectedValue] = useState(initialOnline ? '4' : '3');
  const [searchValue, setSearchValue] = useState(initialName);
  const [isOnline, setIsOnline] = useState(initialOnline);
  
  const [isLoading, setIsLoading] = useState(true);
  const [orderDirection, setOrderDirection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [players, setPlayers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchPlayers();
  }, [currentPage, isOnline, searchValue]);
  
  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const response = await getPlayers({
        name: searchValue,
        online: isOnline,
        page: currentPage,
      });
      
      setPlayers(response.players);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCellClick = () => {
    setOrderDirection(prev => !prev);
    
    // Sort players by name
    const sortedPlayers = [...players].sort((a, b) => {
      const valueA = a.player_name.toLowerCase();
      const valueB = b.player_name.toLowerCase();
      
      return orderDirection
        ? valueB.localeCompare(valueA)
        : valueA.localeCompare(valueB);
    });
    
    setPlayers(sortedPlayers);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (value: string, isOnlineSearch = false) => {
    setSearchValue(value);
    setIsOnline(isOnlineSearch);
    setCurrentPage(1);
  };
  
  return (
    <main className="flex flex-col items-center">
      <SearchBar 
        initialSelectedValue={selectedValue}
        initialSearchValue={searchValue}
        onSearch={(value, type) => {
          handleSearch(value, type === '4');
        }}
      />
      
      <Pagination 
        totalPages={totalPages} 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
      />
      
      {/* Player List Table */}
      <div className="w-full md:w-4/5 overflow-x-auto">
        <table className="w-full border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
          <thead>
            <tr className="bg-sky-600">
              <th 
                className="py-3 px-2 text-left text-sm md:text-base font-jersey cursor-pointer w-full"
                onClick={handleCellClick}
              >
                {!orderDirection ? 
                  <CaretUpIcon className="inline-block mr-1" /> : 
                  <CaretDownIcon className="inline-block mr-1" />
                }
                {t('name')}
              </th>
            </tr>
          </thead>
        </table>

        <table className="w-full border border-sky-500 border-collapse bg-sky-500 bg-opacity-90 text-white">
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-10 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                </td>
              </tr>
            ) : players.length > 0 ? (
              players.map((player, index) => (
                <tr 
                  key={player.id || index} 
                  className={`${index % 2 === 0 ? 'bg-sky-400' : 'bg-sky-500'} hover:bg-amber-400 transition-colors`}
                >
                  <td className="py-2 px-4">
                    <Link 
                      href={`/jugador/${player.player_name}`}
                      className="hover:text-amber-200"
                    >
                      {player.player_name}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-10 text-center">
                  {t('noPlayersFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}