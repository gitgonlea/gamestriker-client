// lib/api/players.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5000';

interface GetPlayersParams {
  name?: string;
  online?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: string;
}

/**
 * Get players with various filtering options
 */
export async function getPlayers({
  name = '',
  online = false,
  page = 1,
  pageSize = 15,
  orderBy = 'name',
  orderDirection = 'asc'
}: GetPlayersParams = {}) {
  try {
    let url = `${API_URL}/api/v1/servers/getPlayer?page=${page}&pageSize=${pageSize}`;
    
    if (name) {
      url += `&name=${name}`;
    }
    
    if (online) {
      url += `&online=true`;
    }
    
    if (orderBy) {
      url += `&orderBy=${orderBy}&orderDirection=${orderDirection}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    return { players: [], totalPages: 0 };
  }
}

/**
 * Get player details
 */
export async function getPlayerDetails(playerName: string) {
  try {
    const url = `${API_URL}/api/v1/servers/getPlayer?name=${playerName}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching player details:', error);
    return { player: null };
  }
}

/**
 * Get player stats on a specific server
 */
export async function getPlayerServerStats(playerName: string, host: string, port: string, days = 0) {
  try {
    const url = `${API_URL}/api/v1/servers/getPlayerDataServer?playerName=${playerName}&host=${host}&port=${port}&days=${days}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching player server stats:', error);
    return { player_data: [], player_score: [], player_time: [] };
  }
}