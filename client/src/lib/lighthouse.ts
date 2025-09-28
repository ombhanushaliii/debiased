import lighthouse from '@lighthouse-web3/sdk';

// Lighthouse API configuration
const LIGHTHOUSE_API_KEY = "1e5a8e58.476d0812abe5478d81ada0706c11e6ab";

export class LighthouseService {
  private static instance: LighthouseService;
  private apiKey: string;

  private constructor() {
    this.apiKey = LIGHTHOUSE_API_KEY;
  }

  public static getInstance(): LighthouseService {
    if (!LighthouseService.instance) {
      LighthouseService.instance = new LighthouseService();
    }
    return LighthouseService.instance;
  }

  /**
   * Upload a file to IPFS using Lighthouse
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const uploadResponse = await lighthouse.upload([file], this.apiKey);
      return uploadResponse.data.Hash;
    } catch (error) {
      console.error('Error uploading to Lighthouse:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, filename: string = 'data.json'): Promise<string> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const file = new File([jsonString], filename, { type: 'application/json' });
      return await this.uploadFile(file);
    } catch (error) {
      console.error('Error uploading JSON to Lighthouse:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch content from IPFS using CID
   */
  async fetchContent(cid: string): Promise<any> {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error(`Failed to fetch from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get IPFS gateway URL for a CID
   */
  getIPFSUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }

  /**
   * Validate CID format
   */
  isValidCID(cid: string): boolean {
    // Basic CID validation - should be 46+ characters for CIDv0 or start with 'baf' for CIDv1
    return (cid.length >= 46 && /^[a-zA-Z0-9]+$/.test(cid)) || cid.startsWith('baf');
  }
}

// Export singleton instance
export const lighthouseService = LighthouseService.getInstance();

// Export constants
export const LIGHTHOUSE_GATEWAY = 'https://ipfs.io/ipfs/';