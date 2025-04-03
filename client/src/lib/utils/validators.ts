// lib/utils/validators.ts
/**
 * Validate IPv4 address
 * @param ipAddress - IP address to validate
 * @returns boolean - True if valid IPv4 address
 */
export function isValidIpAddress(ipAddress: string): boolean {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ipAddress);
  }
  
  /**
   * Validate port number
   * @param port - Port number as string
   * @returns boolean - True if valid port (1-65535)
   */
  export function isValidPort(port: string): boolean {
    const portNumber = parseInt(port, 10);
    return !isNaN(portNumber) && portNumber >= 1 && portNumber <= 65535;
  }
  
  /**
   * Validate server address in format host:port
   * @param address - Address in format host:port
   * @returns boolean - True if valid address format
   */
  export function isValidServerAddress(address: string): boolean {
    if (!address || !address.includes(':')) {
      return false;
    }
    
    const [host, port] = address.split(':');
    return host.length > 0 && isValidPort(port);
  }
  
  /**
   * Validate email address
   * @param email - Email address to validate
   * @returns boolean - True if valid email
   */
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate player name (alphanumeric with some special chars)
   * @param name - Player name to validate
   * @returns boolean - True if valid player name
   */
  export function isValidPlayerName(name: string): boolean {
    // Allow alphanumeric characters, spaces, underscores, dashes, and some special characters
    const nameRegex = /^[a-zA-Z0-9\s_\-\[\]\(\)]{3,32}$/;
    return nameRegex.test(name);
  }
  
  /**
   * Validate if a string is a valid URL
   * @param url - URL to validate
   * @returns boolean - True if valid URL
   */
  export function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }