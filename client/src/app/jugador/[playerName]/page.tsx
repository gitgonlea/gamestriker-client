// app/jugador/[playerName]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlayerDetails } from '@/lib/api/players';
import SearchBar from '@/components/search/search-bar';

interface PlayerPageProps {
  params: {
    playerName: string;
  };
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { playerName } = params;
  
  return {
    title: `Player: ${playerName}`,
    description: `Counter-Strike 1.6 player profile for ${playerName}`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerName } = params;
  
  try {
    const playerData = await getPlayerDetails(playerName);
    
    if (!playerData || !playerData.players || playerData.players.length === 0) {
      return notFound();
    }
    
    return (
      <div className="flex flex-col items-center">
        <SearchBar 
          initialSelectedValue="3"
          initialSearchValue={playerName}
        />
        
        <div className="w-[95%] md:w-4/5 bg-black bg-opacity-80 rounded">
          <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-7 py-2 z-10">
            <div className="uppercase text-amber-400 text-xl font-semibold">
              {playerName}
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Servers where this player has played:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerData.players.map((server, index) => (
                <div 
                  key={index} 
                  className="bg-black bg-opacity-70 p-4 rounded hover:bg-opacity-90 transition-colors"
                >
                  <Link 
                    href={`/jugador/${playerName}/${server.host}:${server.port}`} 
                    className="block"
                  >
                    <h3 className="text-amber-400 font-semibold mb-2 truncate">{server.servername}</h3>
                    <div className="text-sm">
                      <p>Score: <span className="text-amber-300">{server.score}</span></p>
                      <p>Time Played: <span className="text-amber-300">
                        {Math.floor(server.playtime / 3600)}h {Math.floor((server.playtime % 3600) / 60)}m
                      </span></p>
                      <p className="text-xs text-gray-400 mt-2">
                        {server.host}:{server.port}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching player data:', error);
    return notFound();
  }
}