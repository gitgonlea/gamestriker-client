// lib/api/servers.ts
import axios from 'axios';
import type { 
  Server, 
  ServerDetail, 
  ServerPlayer, 
  PlayerData,
  ServerResponse,
  GetServersParams 
} from '@/types/server';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5000';

/**
 * Get servers with various filtering options
 */
export async function getServers({
  queryId,
  value,
  varValue,
  page = 1,
  orderBy = 'rank_id',
  orderDirection = 'asc'
}: GetServersParams = {}): Promise<ServerResponse> {
  try {
    let url = `${API_URL}/api/v1/servers/getServers?page=${page}&pageSize=100`;
    
    // Add query filters
    if (queryId && value) {
      if (queryId === 'variable') {
        if (varValue) {
          url += `&varKey=${value}&varValue=${varValue}`;
        } else {
          url += `&varKey=${value}`;
        }
      } else {
        url += `&${queryId}=${value}`;
      }
    }
    
    // Add ordering
    if (orderBy) {
      url += `&orderBy=${orderBy}&orderDirection=${orderDirection}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching servers:', error);
    return { servers: [], totalPages: 0 };
  }
}

/**
 * Get detailed information about a specific server
 */
export async function getServerDetails(host: string, port: string): Promise<ServerDetail[]> {
  try {
    // Validate port is a valid number
    const numericPort = parseInt(port, 10);
    if (isNaN(numericPort)) {
      console.error('Invalid port value:', port);
      return [];
    }
    
    // Ensure host is also valid
    if (!host || host.trim() === '') {
      console.error('Invalid host value');
      return [];
    }
    
    const url = `${API_URL}/api/v1/servers/getServerInfo?host=${encodeURIComponent(host)}&port=${numericPort}`;
    console.log('Fetching server details from:', url);
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching server details:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return [];
  }
}

/**
 * Get players currently online on a server
 */
export async function getServerPlayers(serverId: number): Promise<ServerPlayer[]> {
  try {
    const url = `${API_URL}/api/v1/servers/getServerPlayers?id=${serverId}&type=1`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching server players:', error);
    return [];
  }
}

/**
 * Get top players for a server
 */
export async function getServerTop(serverId: number): Promise<ServerPlayer[]> {
  try {
    const url = `${API_URL}/api/v1/servers/getServerPlayers?id=${serverId}&type=0`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching top players:', error);
    return [];
  }
}

/**
 * Get player statistics for a server
 */
export async function getPlayerStats(serverId: number, type = 0): Promise<PlayerData[]> {
  try {
    const url = `${API_URL}/api/v1/statistics/getPlayerStats?type=${type}&server_id=${serverId}`;
    const response = await axios.get(url);
    return response.data.filter((data: PlayerData) => data.Jugadores !== -1);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
}

/**
 * Get server rank statistics
 */
export async function getRankStats(serverId: number): Promise<any[]> {
  try {
    const url = `${API_URL}/api/v1/statistics/getRankStats?server_id=${serverId}`;
    const response = await axios.get(url);
    
    // Process data to add date labels for chart
    return response.data.map((item: any, index: number, array: any[]) => ({
      ...item,
      date: index === array.length - 1 ? 'H' : array.length - index,
    }));
  } catch (error) {
    console.error('Error fetching rank stats:', error);
    return [];
  }
}

/**
 * Add a new server to the database
 */
export async function addServer(formData: { host: string }): Promise<any> {
  try {
    const response = await axios.post(`${API_URL}/api/v1/servers/addServer`, formData);
    return response.data;
  } catch (error) {
    console.error('Error adding server:', error);
    throw error;
  }
}

/**
 * Get server variables
 */
export async function getServerVariables(host: string, port: string): Promise<any> {
  try {
    const url = `${API_URL}/api/v1/servers/getServerVariables?host=${host}&port=${port}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching server variables:', error);
    return [];
  }
}