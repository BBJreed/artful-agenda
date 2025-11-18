import { jwtDecode } from 'jwt-decode';
import { UserSubscription } from '../types';

interface JWTPayload {
  userId: string;
  subscriptionTier: 'free' | 'premium';
  features: string[];
  exp: number;
  iat: number;
}

export class SubscriptionService {
  private apiEndpoint: string;
  private currentToken: string | null = null;
  private subscription: UserSubscription | null = null;
  
  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
  }
  
  async authenticate(credentials: { email: string; password: string }): Promise<string> {
    try {
      const response = await fetch(`${this.apiEndpoint}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      this.currentToken = data.token;
      this.subscription = this.decodeSubscriptionFromToken(data.token);
      
      return data.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  private decodeSubscriptionFromToken(token: string): UserSubscription {
    const payload = jwtDecode<JWTPayload>(token);
    
    return {
      tier: payload.subscriptionTier,
      features: payload.features,
      expiresAt: new Date(payload.exp * 1000)
    };
  }
  
  async hasFeatureAccess(featureName: string): Promise<boolean> {
    if (!this.currentToken || !this.subscription) {
      return false;
    }
    
    if (this.subscription.expiresAt && this.subscription.expiresAt < new Date()) {
      await this.refreshToken();
    }
    
    const clientCheck = this.subscription.features.includes(featureName);
    
    try {
      const response = await fetch(`${this.apiEndpoint}/subscription/verify-feature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature: featureName })
      });
      
      const data = await response.json();
      return data.hasAccess && clientCheck;
    } catch (error) {
      console.error('Feature verification failed:', error);
      return false;
    }
  }
  
  getFeaturesByTier(tier: 'free' | 'premium'): string[] {
    const features = {
      free: [
        'basic_calendar_sync',
        'single_theme',
        'limited_stickers_10',
        'basic_export'
      ],
      premium: [
        'basic_calendar_sync',
        'unlimited_themes',
        'unlimited_stickers',
        'advanced_templates',
        'pdf_export',
        'priority_sync',
        'custom_fonts',
        'multiple_calendars',
        'handwriting_unlimited',
        'collaborative_sharing'
      ]
    };
    
    return features[tier];
  }
  
  canUseFeature(featureName: string): boolean {
    if (!this.subscription) return false;
    return this.subscription.features.includes(featureName);
  }
  
  async upgradeToPremium(paymentDetails: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentDetails)
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentToken = data.newToken;
        this.subscription = this.decodeSubscriptionFromToken(data.newToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Upgrade failed:', error);
      return false;
    }
  }
  
  private async refreshToken(): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentToken = data.token;
        this.subscription = this.decodeSubscriptionFromToken(data.token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  getSubscription(): UserSubscription | null {
    return this.subscription;
  }
  
  getToken(): string | null {
    return this.currentToken;
  }
  
  async checkQuotaUsage(featureName: string): Promise<{ used: number; limit: number; available: boolean }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/subscription/quota/${featureName}`, {
        headers: {
          'Authorization': `Bearer ${this.currentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Quota check failed:', error);
      return { used: 0, limit: 0, available: false };
    }
  }
  
  logout(): void {
    this.currentToken = null;
    this.subscription = null;
  }
}