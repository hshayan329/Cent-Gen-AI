
import { PlanType, AspectRatio, ImageSize, ImageQuality, FileFormat, ImageStyle } from './types';

export const CREDIT_LIMITS = {
  [PlanType.FREE]: 70,
  [PlanType.PRO]: 1500,
  [PlanType.ULTIMATE]: 4000,
};

export const MOCKUP_LIMITS = {
  [PlanType.FREE]: 20,
  [PlanType.PRO]: 1500,
  [PlanType.ULTIMATE]: 4000,
};

// 5 Aspect Ratios (Neural Resolutions)
export const RESOLUTIONS: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

// Neural Scale (Sizes)
export const IMAGE_SIZES: ImageSize[] = ["1K", "2K", "4K"];

// 4 Neural Quality Levels
export const QUALITIES: ImageQuality[] = ["Draft", "Fast", "Standard", "High"];

// Output Formats
export const FORMATS: FileFormat[] = ["png", "jpg", "svg"];

export const STYLES: ImageStyle[] = [
  "Cinematic", 
  "Photographic", 
  "Digital Art", 
  "Anime", 
  "3D Render", 
  "Oil Painting", 
  "Sketch", 
  "Cyberpunk"
];

export const DEFAULT_SETTINGS = {
  aspectRatio: "1:1" as AspectRatio,
  imageSize: "1K" as ImageSize,
  quality: "Standard" as ImageQuality,
  format: "png" as FileFormat,
  style: "Cinematic" as ImageStyle,
};
