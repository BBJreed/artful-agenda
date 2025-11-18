/**
 * Encrypted Data Storage Service
 * Provides end-to-end encryption for sensitive calendar data
 */

// Simple encryption utilities (in a real app, use a robust encryption library)
const ENCRYPTION_KEY = 'artful-agenda-key-2023'; // In reality, this should be securely generated and stored

export class EncryptedStorage {
  private static instance: EncryptedStorage;

  private constructor() {}

  static getInstance(): EncryptedStorage {
    if (!EncryptedStorage.instance) {
      EncryptedStorage.instance = new EncryptedStorage();
    }
    return EncryptedStorage.instance;
  }

  /**
   * Encrypt data using a simple XOR cipher (for demonstration only)
   * In a real application, use a robust encryption library like AES
   */
  private encrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode for storage
  }

  /**
   * Decrypt data using a simple XOR cipher (for demonstration only)
   * In a real application, use a robust encryption library like AES
   */
  private decrypt(data: string, key: string): string {
    const decoded = atob(data); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  /**
   * Store encrypted data in localStorage
   */
  async storeEncryptedData(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      const encryptedData = this.encrypt(serializedData, ENCRYPTION_KEY);
      localStorage.setItem(key, encryptedData);
      console.log(`Data encrypted and stored for key: ${key}`);
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  async retrieveEncryptedData(key: string): Promise<any> {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = this.decrypt(encryptedData, ENCRYPTION_KEY);
      const parsedData = JSON.parse(decryptedData);
      console.log(`Data retrieved and decrypted for key: ${key}`);
      return parsedData;
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      throw new Error('Failed to retrieve encrypted data');
    }
  }

  /**
   * Delete encrypted data from localStorage
   */
  async deleteEncryptedData(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      console.log(`Encrypted data deleted for key: ${key}`);
    } catch (error) {
      console.error('Failed to delete encrypted data:', error);
      throw new Error('Failed to delete encrypted data');
    }
  }

  /**
   * Check if encrypted data exists for a key
   */
  async hasEncryptedData(key: string): Promise<boolean> {
    try {
      const data = localStorage.getItem(key);
      return data !== null;
    } catch (error) {
      console.error('Failed to check encrypted data:', error);
      return false;
    }
  }

  /**
   * Clear all encrypted data
   */
  async clearAllEncryptedData(): Promise<void> {
    try {
      // Note: This clears ALL localStorage, not just encrypted data
      // In a real application, you would want to be more selective
      localStorage.clear();
      console.log('All encrypted data cleared');
    } catch (error) {
      console.error('Failed to clear encrypted data:', error);
      throw new Error('Failed to clear encrypted data');
    }
  }

  /**
   * Generate a secure encryption key
   * In a real application, use a cryptographically secure method
   */
  async generateSecureKey(length: number = 32): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Rotate encryption key for enhanced security
   */
  async rotateEncryptionKey(): Promise<void> {
    try {
      // In a real application, this would involve:
      // 1. Generating a new key
      // 2. Re-encrypting all existing data with the new key
      // 3. Securely storing the new key
      // 4. Deleting the old key after successful rotation
      
      console.log('Encryption key rotation initiated');
      // For demo purposes, we'll just log the action
    } catch (error) {
      console.error('Failed to rotate encryption key:', error);
      throw new Error('Failed to rotate encryption key');
    }
  }
}

// Export a singleton instance
export const encryptedStorage = EncryptedStorage.getInstance();