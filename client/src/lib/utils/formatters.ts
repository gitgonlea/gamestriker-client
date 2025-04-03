// lib/utils/formatters.ts
/**
 * Format time in seconds to a readable format
 * @param seconds - Time in seconds
 * @param type - Format type: 0 for hours/minutes, 1 for hours:minutes:seconds
 * @param checker - If true, uses words like "minutes" and "seconds"
 */
export function formatTime(seconds: number, type = 0, checker = false): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const paddedMinutes = String(minutes).padStart(2, '0');
    
    if (type === 0) {
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return '';
      }
    } else {
      const remainingSeconds = Math.round(seconds) % 60;
      const paddedSeconds = String(remainingSeconds).padStart(2, '0');
      
      if (hours > 0) {
        return `${hours}:${paddedMinutes}`;
      } else if (minutes > 0) {
        if (checker) {
          return `${minutes} minuto${minutes === 1 ? '' : 's'} y ${remainingSeconds} segundo${remainingSeconds === 1 ? '' : 's'}`;
        } else {
          return `${paddedMinutes}:${paddedSeconds}`;
        }
      } else {
        if (checker) {
          return `${remainingSeconds} segundo${remainingSeconds === 1 ? '' : 's'}`;
        } else {
          return `${paddedSeconds}s`;
        }
      }
    }
  }
  
  /**
   * Format a date string to a localized format
   * @param dateString - ISO date string
   * @param locale - Language locale ('en' or 'es')
   */
  export function formatDate(dateString: string, locale: string = 'es'): string {
    const date = new Date(dateString);
    
    const monthNamesEs = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    const monthNames = locale === 'en' ? monthNamesEn : monthNamesEs;
    
    return `${day} ${locale === 'en' ? '' : 'de '}${monthNames[monthIndex]} ${locale === 'en' ? '' : 'de '}${year}`;
  }
  
  /**
   * Calculate score per minute
   * @param score - Total score
   * @param playtime - Playtime in seconds
   */
  export function scorePerMinute(score: number, playtime: number): string {
    const totalScore = parseInt(String(score));
    const totalPlaytimeInMinutes = parseInt(String(playtime)) / 60;
    
    const spm = totalScore / totalPlaytimeInMinutes;
    return spm.toFixed(2);
  }
  
  /**
   * Format a tick for chart axes to avoid overcrowding
   */
  export function tickFormatter(value: string, index: number, data: any[]): string {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return value;
    }
    
    if (data.length <= 4) {
      return value;
    }
    
    if (index % 4 !== 0) {
      return '';
    }
    
    return value;
  }