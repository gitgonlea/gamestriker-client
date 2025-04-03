// src/app/servidor/[address]/server-variables/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { FaChevronLeft, FaTimes } from 'react-icons/fa';
import { getServerVariables } from '@/lib/api/servers';

interface ServerVariablesPageProps {
  params: {
    address: string;
  };
}

export default function ServerVariablesPage({ params }: ServerVariablesPageProps) {
  const { address } = params;
  const { t } = useTranslation();
  
  const [serverData, setServerData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchVariables = async () => {
      setIsLoading(true);
      try {
        const [host, port] = address.split(':');
        const data = await getServerVariables(host, port);
        setServerData(data);
      } catch (error) {
        console.error('Error fetching server variables:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVariables();
  }, [address]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // If no server data or no variables found
  if (!serverData || serverData.length === 0 || 
     (serverData[0] && 
      (!serverData[0].variables_data || 
       Object.keys(JSON.parse(serverData[0].variables_data)).length === 0))) {
    return (
      <div className="bg-black bg-opacity-70 w-[95%] md:w-4/5 mx-auto">
        <div className="bg-black bg-opacity-60 p-3 flex items-center text-xl text-red-500 font-semibold uppercase">
          <FaTimes className="mr-2" />
          {t('noServerVariablesAvailable')}
        </div>
      </div>
    );
  }
  
  // Parse variables data
  const variables = JSON.parse(serverData[0].variables_data);
  
  return (
    <div className="flex flex-col w-[95%] md:w-4/5 lg:w-2/3 mx-auto">
      {/* Server name title */}
      <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-7 py-2 flex justify-between items-center">
        <div className="uppercase text-amber-400 text-base font-semibold flex items-center">
          <Link href={`/servidor/${address}`} className="flex items-center hover:underline">
            <FaChevronLeft className="mr-1" />
            {serverData[0].servername}
          </Link>
        </div>
        
        <div className="text-gray-400 text-sm">
          <Link href={`/servidor/${address}`}>
            {serverData[0].host}:{serverData[0].port}
          </Link>
        </div>
      </div>
      
      {/* Variables title */}
      <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-7 py-2 flex justify-between items-center mt-2">
        <div className="uppercase text-amber-400 text-base font-semibold">
          {t('serverVariables')}
        </div>
        
        <div className="text-gray-400 text-sm">
          {t('updatedEvery24Hours')}
        </div>
      </div>
      
      {/* Variables list */}
      <div className="bg-black bg-opacity-60 p-4">
        {Object.entries(variables).map(([key, value]) => (
          <div 
            key={key} 
            className="flex justify-between border-b border-gray-800 py-2 hover:bg-black hover:bg-opacity-30 transition-colors"
          >
            <div className="font-mono">{key}</div>
            <div>
              <Link 
                href={`/search/variable/${key}/${value}`}
                className="text-amber-400 hover:underline"
              >
                {String(value)}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}