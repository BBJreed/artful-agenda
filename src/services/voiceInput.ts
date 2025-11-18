/**
 * Voice Input Service
 * Handles speech recognition for voice commands and event creation
 */

export class VoiceInputService {
  private static instance: VoiceInputService;
  private isListening: boolean = false;
  private recognition: any = null;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  private constructor() {
    // Check if speech recognition is available
    this.initializeSpeechRecognition();
  }

  static getInstance(): VoiceInputService {
    if (!VoiceInputService.instance) {
      VoiceInputService.instance = new VoiceInputService();
    }
    return VoiceInputService.instance;
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
        this.isListening = false;
      };
      
      this.recognition.onerror = (event: any) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  /**
   * Start listening for voice input
   */
  startListening(onResult: (text: string) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      if (onError) {
        onError('Speech recognition not supported');
      }
      return;
    }
    
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }
    
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.isListening = true;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
      if (onError) {
        onError('Failed to start speech recognition');
      }
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if voice input is supported
   */
  isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Parse voice command for event creation
   */
  parseEventCommand(text: string): { title: string; date?: Date; time?: string } | null {
    // Simple parsing for demo purposes
    // In a real app, this would be much more sophisticated
    const textLower = text.toLowerCase();
    
    // Extract title (everything except date/time keywords)
    const title = text.replace(/(today|tomorrow|yesterday|next|this|at|on|in|from|to|\d+:\d+|\d+(st|nd|rd|th)|january|february|march|april|may|june|july|august|september|october|november|december)/gi, '').trim();
    
    // Simple date detection (demo purposes)
    let date: Date | undefined;
    if (textLower.includes('today')) {
      date = new Date();
    } else if (textLower.includes('tomorrow')) {
      date = new Date();
      date.setDate(date.getDate() + 1);
    } else if (textLower.includes('yesterday')) {
      date = new Date();
      date.setDate(date.getDate() - 1);
    }
    
    // Simple time detection (demo purposes)
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(am|pm)?)/i);
    const time = timeMatch ? timeMatch[1] : undefined;
    
    return {
      title: title || text,
      date,
      time
    };
  }
}

// Export a singleton instance
export const voiceInputService = VoiceInputService.getInstance();