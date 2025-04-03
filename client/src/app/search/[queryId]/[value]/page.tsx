import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SearchBar from '@/components/search/search-bar';
import ServerList from '@/components/server/server-list';
import { getServers } from '@/lib/api/servers';

interface SearchPageProps {
  params: {
    queryId: string;
    value: string;
    varValue?: string;
  };
}

export async function generateMetadata({ params }: SearchPageProps) {
  const { queryId, value, varValue } = params;
  
  let searchType = '';
  switch (queryId) {
    case 'name':
      searchType = 'Server Name';
      break;
    case 'map':
      searchType = 'Map';
      break;
    case 'ip':
      searchType = 'IP Address';
      break;
    case 'variable':
      searchType = 'Server Variable';
      break;
    default:
      searchType = 'Search';
  }
  
  return {
    title: `${searchType} Search: ${value}${varValue ? ' = ' + varValue : ''}`,
    description: `Counter-Strike 1.6 servers matching ${searchType.toLowerCase()}: ${value}${varValue ? ' = ' + varValue : ''}`,
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { queryId, value, varValue } = params;
  
  try {
    // Pre-fetch server data based on search criteria
    const serverData = await getServers({
      queryId,
      value,
      varValue,
    });
    
    return (
      <div className="flex flex-col items-center">
        <SearchBar 
          initialSelectedValue={
            queryId === 'name' ? '0' : 
            queryId === 'map' ? '1' : 
            queryId === 'ip' ? '2' :
            queryId === 'variable' ? '5' : '0'
          }
          initialSearchValue={value}
          isVariable={queryId === 'variable' ? value : undefined}
        />
        
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        }>
          <ServerList 
            initialServers={serverData.servers} 
            initialTotalPages={serverData.totalPages}
            queryId={queryId}
            value={value}
            varValue={varValue}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching search results:', error);
    return notFound();
  }
}