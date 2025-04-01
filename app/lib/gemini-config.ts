import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini API với API key
export const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Cấu hình model
export const MODEL_NAME = "gemini-2.0-flash";

// Cấu hình MIME types được hỗ trợ
export const SUPPORTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/mp3',
  'audio/aiff',
  'audio/aac',
  'audio/ogg',
  'audio/flac'
]; 