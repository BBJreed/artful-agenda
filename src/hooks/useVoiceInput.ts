import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  isRecording: boolean;
  volume: number;
  confidence: number;
  alternatives: string[];
  language: string;
  isContinuous: boolean;
}

interface VoiceInputOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
  grammar?: string;
  hints?: string[];
}

export const useVoiceInput = (options: VoiceInputOptions = {}) => {
  const {
    continuous = false,
    interimResults = true,
    lang = 'en-US',
    maxAlternatives = 1,
    grammar = '',
    hints = []
  } = options;
  
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    error: null,
    isRecording: false,
    volume: 0,
    confidence: 0,
    alternatives: [],
    language: lang,
    isContinuous: continuous
  });
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!state.isSupported) return;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = lang;
    recognitionRef.current.maxAlternatives = maxAlternatives;
    
    // Set grammar if provided
    if (grammar) {
      try {
        // @ts-ignore
        const speechGrammarList = (window as any).webkitSpeechGrammarList || (window as any).SpeechGrammarList;
        if (speechGrammarList) {
          const grammarList = new speechGrammarList();
          grammarList.addFromString(grammar, 1);
          recognitionRef.current.grammars = grammarList;
        }
      } catch (error) {
        console.warn('Speech grammar not supported:', error);
      }
    }
    
    // Set hints if provided
    if (hints.length > 0) {
      recognitionRef.current.hints = hints;
    }
    
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;
      const alternatives: string[] = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Get the best result
        const result = event.results[i][0];
        const transcript = result.transcript;
        confidence = Math.max(confidence, result.confidence || 0);
        
        // Collect alternatives
        for (let j = 0; j < Math.min(event.results[i].length, maxAlternatives); j++) {
          if (!alternatives.includes(event.results[i][j].transcript)) {
            alternatives.push(event.results[i][j].transcript);
          }
        }
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setState(prev => ({
        ...prev,
        transcript: finalTranscript + interimTranscript,
        confidence,
        alternatives
      }));
    };
    
    recognitionRef.current.onerror = (event: any) => {
      let errorMessage = 'Voice input error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. No microphone detected.';
          break;
        case 'not-allowed':
          errorMessage = 'Permission to use microphone was denied.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed.';
          break;
        case 'bad-grammar':
          errorMessage = 'There was an error in the speech grammar.';
          break;
        case 'language-not-supported':
          errorMessage = 'The selected language is not supported.';
          break;
        default:
          errorMessage = event.error;
      }
      
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
    };
    
    recognitionRef.current.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang, maxAlternatives, state.isSupported]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }
    
    try {
      recognitionRef.current.start();
      setState(prev => ({ ...prev, isListening: true, error: null, transcript: '', confidence: 0, alternatives: [] }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to start voice input', isListening: false }));
    }
  }, [state.isSupported]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, [state.isListening]);
  
  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);
  
  // Toggle continuous mode
  const toggleContinuous = useCallback(() => {
    if (recognitionRef.current) {
      const newContinuous = !recognitionRef.current.continuous;
      recognitionRef.current.continuous = newContinuous;
      setState(prev => ({ ...prev, isContinuous: newContinuous }));
    }
  }, []);
  
  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);
  
  // Change language
  const changeLanguage = useCallback((newLang: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
      setState(prev => ({ ...prev, language: newLang }));
    }
  }, []);
  
  // Get audio level for visual feedback
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const volume = Math.min(100, Math.max(0, Math.round(average)));
        
        setState(prev => ({ ...prev, volume }));
        
        if (state.isListening) {
          requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.error('Error accessing microphone for audio level monitoring:', error);
    }
  }, [state.isListening]);
  
  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current = null;
    }
    
    setState(prev => ({ ...prev, volume: 0 }));
  }, []);
  
  // Parse natural language commands
  const parseCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Parse date commands
    const dateRegex = /(today|tomorrow|yesterday|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i;
    const dateMatch = lowerText.match(dateRegex);
    
    // Parse time commands
    const timeRegex = /(\d{1,2}:\d{2}\s*(am|pm)?)|(\d{1,2}\s*(am|pm))/i;
    const timeMatch = lowerText.match(timeRegex);
    
    // Parse duration commands
    const durationRegex = /(\d+\s*(minute|hour|day|week)s?)/i;
    const durationMatch = lowerText.match(durationRegex);
    
    return {
      date: dateMatch ? dateMatch[0] : null,
      time: timeMatch ? timeMatch[0] : null,
      duration: durationMatch ? durationMatch[0] : null,
      raw: text
    };
  }, []);
  
  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    toggleContinuous,
    clearTranscript,
    changeLanguage,
    startAudioLevelMonitoring,
    stopAudioLevelMonitoring,
    parseCommand
  };
};