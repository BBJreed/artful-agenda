import { VisualTheme } from '../types';

export const DEFAULT_THEMES: VisualTheme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    svgTemplate: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid-color)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="var(--background-color)"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
    `,
    cssVariables: {
      'background-color': '#ffffff',
      'grid-color': '#e5e7eb',
      'text-primary': '#1f2937',
      'text-secondary': '#6b7280',
      'accent-color': '#3b82f6'
    },
    fontPairings: {
      header: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    }
  },
  
  {
    id: 'elegant',
    name: 'Elegant',
    svgTemplate: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <linearGradient id="elegantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--gradient-start);stop-opacity:1" />
            <stop offset="100%" style="stop-color:var(--gradient-end);stop-opacity:1" />
          </linearGradient>
          <pattern id="elegantPattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="2" fill="var(--pattern-color)" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#elegantGradient)"/>
        <rect width="100%" height="100%" fill="url(#elegantPattern)"/>
      </svg>
    `,
    cssVariables: {
      'background-color': '#faf9f7',
      'gradient-start': '#f8f7f4',
      'gradient-end': '#faf9f7',
      'pattern-color': '#d4c5b9',
      'grid-color': '#e8dfd6',
      'text-primary': '#3e2c1e',
      'text-secondary': '#8b7355',
      'accent-color': '#c19a6b'
    },
    fontPairings: {
      header: 'Playfair Display, serif',
      body: 'Lato, sans-serif'
    }
  },
  
  {
    id: 'vibrant',
    name: 'Vibrant',
    svgTemplate: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="vibrantDots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="var(--pattern-color)" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="var(--background-color)"/>
        <rect width="100%" height="100%" fill="url(#vibrantDots)"/>
      </svg>
    `,
    cssVariables: {
      'background-color': '#fff5f5',
      'pattern-color': '#f472b6',
      'grid-color': '#fecdd3',
      'text-primary': '#881337',
      'text-secondary': '#be185d',
      'accent-color': '#ec4899'
    },
    fontPairings: {
      header: 'Poppins, sans-serif',
      body: 'Poppins, sans-serif'
    }
  },
  
  {
    id: 'professional',
    name: 'Professional',
    svgTemplate: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect width="100%" height="100%" fill="var(--background-color)"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--accent-color)" stroke-width="2" opacity="0.1"/>
      </svg>
    `,
    cssVariables: {
      'background-color': '#f9fafb',
      'grid-color': '#d1d5db',
      'text-primary': '#111827',
      'text-secondary': '#4b5563',
      'accent-color': '#2563eb'
    },
    fontPairings: {
      header: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif'
    }
  },
  
  {
    id: 'pastel',
    name: 'Pastel Dreams',
    svgTemplate: `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <linearGradient id="pastelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:var(--gradient-start);stop-opacity:1" />
            <stop offset="50%" style="stop-color:var(--gradient-middle);stop-opacity:1" />
            <stop offset="100%" style="stop-color:var(--gradient-end);stop-opacity:1" />
          </linearGradient>
          <pattern id="pastelWaves" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="var(--pattern-color)" stroke-width="2" fill="none" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pastelGradient)"/>
        <rect width="100%" height="100%" fill="url(#pastelWaves)"/>
      </svg>
    `,
    cssVariables: {
      'background-color': '#fef3f8',
      'gradient-start': '#fef3f8',
      'gradient-middle': '#f0f9ff',
      'gradient-end': '#fef3f8',
      'pattern-color': '#a78bfa',
      'grid-color': '#e9d5ff',
      'text-primary': '#581c87',
      'text-secondary': '#9333ea',
      'accent-color': '#c084fc'
    },
    fontPairings: {
      header: 'Quicksand, sans-serif',
      body: 'Quicksand, sans-serif'
    }
  }
];

export class ThemeManager {
  private currentTheme: VisualTheme | null = null;
  private customThemes: VisualTheme[] = [];
  
  /**
   * Returns all available themes including default and custom
   */
  getAllThemes(): VisualTheme[] {
    return [...DEFAULT_THEMES, ...this.customThemes];
  }
  
  /**
   * Retrieves theme by ID
   */
  getThemeById(id: string): VisualTheme | null {
    const allThemes = this.getAllThemes();
    return allThemes.find(theme => theme.id === id) || null;
  }
  
  /**
   * Applies theme to DOM by setting CSS variables
   */
  applyTheme(theme: VisualTheme): void {
    this.currentTheme = theme;
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply font pairings
    root.style.setProperty('--font-header', theme.fontPairings.header);
    root.style.setProperty('--font-body', theme.fontPairings.body);
    
    // Load custom fonts if needed
    this.loadFonts(theme.fontPairings);
  }
  
  /**
   * Creates custom theme from user specifications
   */
  createCustomTheme(
    name: string,
    cssVariables: Record<string, string>,
    fontPairings: { header: string; body: string },
    svgTemplate?: string
  ): VisualTheme {
    const customTheme: VisualTheme = {
      id: `custom-${Date.now()}`,
      name,
      svgTemplate: svgTemplate || this.generateDefaultSVGTemplate(cssVariables),
      cssVariables,
      fontPairings
    };
    
    this.customThemes.push(customTheme);
    return customTheme;
  }
  
  /**
   * Generates default SVG template when none provided
   */
  private generateDefaultSVGTemplate(cssVariables: Record<string, string>): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect width="100%" height="100%" fill="${cssVariables['background-color'] || '#ffffff'}"/>
      </svg>
    `;
  }
  
  /**
   * Loads font families from Google Fonts or system
   */
  private loadFonts(fontPairings: { header: string; body: string }): void {
    const fonts = [fontPairings.header, fontPairings.body];
    
    fonts.forEach(font => {
      const fontFamily = font.split(',')[0].trim();
      
      // Check if font is already loaded
      if (document.fonts.check(`12px ${fontFamily}`)) {
        return;
      }
      
      // Load from Google Fonts if not system font
      const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact'];
      
      if (!systemFonts.includes(fontFamily)) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
  }
  
  /**
   * Exports theme configuration for sharing or backup
   */
  exportTheme(theme: VisualTheme): string {
    return JSON.stringify(theme, null, 2);
  }
  
  /**
   * Imports theme from JSON configuration
   */
  importTheme(themeJson: string): VisualTheme {
    const theme = JSON.parse(themeJson) as VisualTheme;
    this.customThemes.push(theme);
    return theme;
  }
  
  /**
   * Removes custom theme by ID
   */
  deleteCustomTheme(id: string): boolean {
    const index = this.customThemes.findIndex(theme => theme.id === id);
    if (index !== -1) {
      this.customThemes.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Returns currently applied theme
   */
  getCurrentTheme(): VisualTheme | null {
    return this.currentTheme;
  }
  
  /**
   * Generates theme preview as data URL
   */
  generatePreview(theme: VisualTheme, width: number = 200, height: number = 150): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Draw background
    ctx.fillStyle = theme.cssVariables['background-color'] || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = theme.cssVariables['grid-color'] || '#e5e7eb';
    ctx.lineWidth = 1;
    
    const cellWidth = width / 7;
    const cellHeight = height / 5;
    
    for (let i = 0; i <= 7; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
    }
    
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }
    
    return canvas.toDataURL();
  }
}