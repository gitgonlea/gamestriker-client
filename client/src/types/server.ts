// types/server.ts
export interface Server {
    id: number;
    host: string;
    port: string;
    servername: string;
    map: string;
    numplayers: number;
    maxplayers: number;
    status: number;
    rank_id: number;
    [key: string]: any;
  }
  
  export interface ServerDetail extends Server {
    last_update: string;
    percentile: number;
    monthly_avg: number;
    ServerRanks: ServerRank[];
    WeeklyMapData: WeeklyMapData[];
  }
  
  export interface ServerRank {
    id: number;
    server_id: number;
    lowest_rank: number;
    highest_rank: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface MapData {
    name: string;
    value: number;
    count: number;
  }
  
  export interface WeeklyMapData {
    id: number;
    server_id: number;
    map_data: MapData[];
    created_at: string;
    updated_at: string;
  }
  
  export interface ServerPlayer {
    id: number;
    server_id: number;
    player_name: string;
    score: number;
    current_score?: number;
    playtime: number;
    current_playtime?: number;
    rank?: number;
    BOT?: number;
    first_seen?: string;
    last_seen?: string;
    [key: string]: any;
  }
  
  export interface PlayerData {
    day?: string;
    hour?: string;
    Jugadores: number;
    Players?: number;
  }
  
  export interface ServerResponse {
    servers: Server[];
    totalPages: number;
  }
  
  export interface GetServersParams {
    queryId?: string;
    value?: string;
    varValue?: string;
    page?: number;
    orderBy?: string;
    orderDirection?: string;
  }