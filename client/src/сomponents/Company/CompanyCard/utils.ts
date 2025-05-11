export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
    
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
    
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
      
    h /= 6;
  }

  return { h, s, l };
};
  
export const hslToRgb = (h: number, s: number, l: number) => {
  let r, g, b;
    
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
      
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
      
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
    
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};
  
export const getDynamicBackground = (companyName: string, logoBgColor: string | null = null) => {
  if (logoBgColor) {
    return { backgroundImage: logoBgColor };
  }
    
  if (!companyName) return {};
    
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
    
  const h = Math.abs(hash) % 360;
  const s = 20 + (Math.abs(hash) % 20); 
  const l = 92 + (Math.abs(hash) % 6);
    
  return {
    backgroundImage: `linear-gradient(145deg, hsl(${h}, ${s}%, ${l}%), hsl(${h}, ${s-10}%, ${l-8}%))`,
  };
};

export const getCompanyInitials = (companyName: string): string => {
  if (!companyName) return 'CO';
  
  const words = companyName.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = words[0].charAt(0);
    const secondInitial = words[words.length > 1 ? 1 : 0].charAt(0);
    return (firstInitial + secondInitial).toUpperCase();
  }
};

export const truncateDescription = (text: string, maxLength = 120): string => {
  if (!text || text.length <= maxLength) return text;
  
  const lastSpace = text.lastIndexOf(' ', maxLength);
  if (lastSpace === -1) return text.substring(0, maxLength) + '...';
  
  return text.substring(0, lastSpace) + '...';
};