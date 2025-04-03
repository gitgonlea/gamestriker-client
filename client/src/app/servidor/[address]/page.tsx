// app/servidor/[address]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ServerDetails from '@/components/server/server-details';
import { getServerDetails } from '@/lib/api/servers';
import type { ServerDetail } from '@/types/server';

interface ServerPageProps {
  params: {
    address: string;
  };
}

export async function generateMetadata({ params }: ServerPageProps) {
  // URL-decode the address parameter
  const decodedAddress = decodeURIComponent(params.address);
  
  try {
    // Validate address format
    if (!decodedAddress || !decodedAddress.includes(':')) {
      return {
        title: 'Server Not Found',
        description: `The Counter-Strike 1.6 server was not found`,
      };
    }
    
    const [host, port] = decodedAddress.split(':');
    
    // Validate host and port
    if (!host || !port) {
      return {
        title: 'Server Not Found',
        description: `The Counter-Strike 1.6 server was not found`,
      };
    }
    
    const serverData = await getServerDetails(host, port);
    
    if (!serverData || serverData.length === 0) {
      return {
        title: 'Server Not Found',
        description: `The Counter-Strike 1.6 server ${decodedAddress} was not found`,
      };
    }
    
    return {
      title: serverData[0].servername,
      description: `Counter-Strike 1.6 server ${decodedAddress}: ${serverData[0].servername}. Players: ${serverData[0].numplayers}/${serverData[0].maxplayers}. Map: ${serverData[0].map}`,
      openGraph: {
        title: serverData[0].servername,
        description: `Counter-Strike 1.6 server ${decodedAddress}: ${serverData[0].servername}`,
        images: [`/server_info/${decodedAddress}/argstrike_v1.png`],
      },
    };
  } catch (error) {
    console.error('Error fetching server metadata:', error);
    return {
      title: 'Server Details',
      description: 'Counter-Strike 1.6 Server',
    };
  }
}

export default async function ServerPage({ params }: ServerPageProps) {
  // URL-decode the address parameter
  const decodedAddress = decodeURIComponent(params.address);
  
  try {
    // Ensure decoded address is in the correct format
    if (!decodedAddress || !decodedAddress.includes(':')) {
      console.error('Invalid address format:', decodedAddress);
      return notFound();
    }
    
    const [host, port] = decodedAddress.split(':');
    
    // Additional validation
    if (!host || !port) {
      console.error('Missing host or port from address:', decodedAddress);
      return notFound();
    }
    
    // Pre-fetch server data for initial render
    const serverData = await getServerDetails(host, port);
    
    if (!serverData || serverData.length === 0) {
      console.error('No server data found for:', decodedAddress);
      return notFound();
    }
    
    return (
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      }>
        <ServerDetails address={decodedAddress} initialData={serverData[0]} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in ServerPage:', error);
    return (
      <div className="bg-black bg-opacity-70 w-[95%] md:w-4/5 mx-auto p-6">
        <h2 className="text-red-500 text-xl font-bold mb-4">Server Error</h2>
        <p className="mb-4">
          There was an error connecting to the server. This might be due to:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>The API server is currently down</li>
          <li>There was an error processing the request</li>
          <li>Network connectivity issues</li>
        </ul>
        <p className="mt-4">
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    );
  }
}