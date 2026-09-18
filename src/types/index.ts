export interface Prediction {
  id: string;
  sign: string;
  confidence: number;
  timestamp: Date;
  category: string;
}

export interface TranslationResult {
  text: string;
  signVideo?: string;
  wordBreakdown: WordBreakdown[];
}

export interface WordBreakdown {
  word: string;
  signAvailable: boolean;
  confidence?: number;
}

export interface HistoryItem {
  id: string;
  type: 'sign-to-text' | 'text-to-sign' | 'speech-to-sign';
  input: string;
  output: string;
  confidence: number;
  timestamp: Date;
  videoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  signCount: number;
  color: string;
}

export interface SignItem {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
}

export interface AppSettings {
  darkMode: boolean;
  language: string;
  theme: 'default' | 'ocean' | 'sunset' | 'forest';
  notifications: boolean;
  cameraQuality: 'low' | 'medium' | 'high';
  speechEnabled: boolean;
  speechRate: number;
  speechPitch: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}
