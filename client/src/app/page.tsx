import { Suspense } from 'react';
import SearchBar from '@/components/search/search-bar';
import ServerList from '@/components/server/server-list';
import { getServers } from '@/lib/api/servers';

export default async function HomePage() {
  // Fetch initial server data on the server side
  const serverData = await getServers({
    orderBy: 'numplayers',
    orderDirection: 'desc',
  });
  
  return (
    <div className="flex flex-col items-center">
      <SearchBar />
      
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      }>
        <ServerList 
          initialServers={serverData.servers} 
          initialTotalPages={serverData.totalPages} 
        />
      </Suspense>
    </div>
  );
}