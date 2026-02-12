
export enum PlanType {
  FREE = 'Free',
  PRO = 'Pro',
  ULTIMATE = 'Ultimate'
}

export interface AssistantSettings {
  persona: 'General' | 'Artist' | 'Developer' | 'Writer';
  tone: 'Professional' | 'Casual' | 'Concise';
  creativity: number; // 0 to 1
  detailLevel: 'Brief' | 'Standard' | 'Detailed';
  focus: 'Design' | 'Logic' | 'General';
}

export interface UserCredits {
  plan: PlanType;
  remaining: number;
  total: number;
  watermarkFreeRemaining?: number; 
  mockupsRemaining: number;
  mockupsTotal: number;
  referralCode: string;
  referralsCount: number;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";
export type ImageQuality = "Draft" | "Fast" | "Standard" | "High";
export type FileFormat = "png" | "jpg" | "svg";
export type ImageStyle = "Cinematic" | "Photographic" | "Digital Art" | "Anime" | "3D Render" | "Oil Painting" | "Sketch" | "Cyberpunk";

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  quality: ImageQuality;
  format: FileFormat;
  style: ImageStyle;
  negativePrompt?: string;
  useSearch?: boolean;
  referenceImage?: string; 
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  settings: GenerationSettings;
  isWatermarked?: boolean;
}

export interface EbookPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  loading: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'ai';
  text: string;
  timestamp: number;
  read: boolean;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
  settings?: AssistantSettings;
}

export interface Scene {
  id: string;
  prompt: string;
  image?: GeneratedImage;
  loading: boolean;
  error?: string;
}
