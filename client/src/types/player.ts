// types/player.ts
export interface Player {
    id: number;
    player_name: string;
    servername?: string;
    host?: string;
    port?: string;
    score?: number;
    playtime?: number;
    first_seen?: string;
    last_seen?: string;
    rank_id?: number;
    rank_total?: number;
    status?: number;
    [key: string]: any;
  }
  
  export interface PlayerStats {
    player_name: string;
    server_id: number;
    score: number;
    playtime: number;
    first_seen: string;
    last_seen: string;
    rank_id: number;
    rank_total: number;
    servername: string;
    host: string;
    port: string;
    status: number;
    [key: string]: any;
  }
  
  export interface ScoreData {
    day?: string;
    hour?: string;
    Puntaje: number;
    Score?: number;
  }
  
  export interface TimeData {
    day?: string;
    hour?: string;
    Tiempo: number;
    Time?: number;
  }
  
  export interface PlayerStatsResponse {
    player_data: PlayerStats[];
    player_score: ScoreData[];
    player_time: TimeData[];
  }
  
  export interface PlayersResponse {
    players: Player[];
    totalPages: number;
  }