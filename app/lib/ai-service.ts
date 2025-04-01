"use client";

// Mô phỏng API Gemini (sẽ thay thế bằng API thực khi có key)
// Trong triển khai thực tế, việc gọi API nên được thực hiện từ server

import { MeetingInfo } from '@/app/components/meeting-info-form';
import { SystemPromptConfig } from '@/app/components/system-prompt-editor';
import { optimizeAudio, transcribeAudio } from '@/app/lib/audio-processor';
import { genAI, MODEL_NAME } from './gemini-config';

/**
 * Tạo tóm tắt cuộc họp từ transcript sử dụng Gemini API
 * @param transcript - Nội dung văn bản của cuộc họp
 * @param meetingInfo - Thông tin về cuộc họp
 * @param promptConfig - Cấu hình system prompt
 * @returns Tóm tắt cuộc họp ở định dạng Markdown
 */
async function generateRecap(
  transcript: string,
  meetingInfo: MeetingInfo,
  promptConfig: SystemPromptConfig
): Promise<string> {
  try {
    console.log('Bắt đầu tạo tóm tắt...');
    
    // Tạo prompt cho Gemini API
    const prompt = `
Hãy tạo một tóm tắt cuộc họp với thông tin sau:

Tiêu đề: ${meetingInfo.title}
Ngày: ${meetingInfo.date}
Người tham gia: ${meetingInfo.participants.join(', ')}
Mục đích: ${meetingInfo.purpose}

Nội dung cuộc họp:
${transcript}

Hãy tạo tóm tắt theo định dạng Markdown với các phần:
1. Tổng quan
2. Các điểm thảo luận chính
3. Quyết định đã đưa ra
4. Hành động tiếp theo

${promptConfig.customPrompt ? `\nYêu cầu bổ sung:\n${promptConfig.customPrompt}` : ''}
    `;
    
    // Gọi Gemini API
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recap = response.text();
    
    console.log('Tạo tóm tắt hoàn tất!');
    return recap;
  } catch (error) {
    console.error('Lỗi khi tạo tóm tắt:', error);
    throw new Error('Không thể tạo tóm tắt cuộc họp');
  }
}

/**
 * Xử lý file âm thanh và tạo tóm tắt sử dụng Gemini API
 * @param file - File âm thanh
 * @param meetingInfo - Thông tin về cuộc họp
 * @param promptConfig - Cấu hình system prompt
 * @returns Tóm tắt cuộc họp
 */
export async function processLocalAudio(
  file: File,
  meetingInfo: MeetingInfo,
  promptConfig: SystemPromptConfig
): Promise<string> {
  try {
    // Tạo prompt cho Gemini API
    const prompt = `
Hãy tạo một tóm tắt cuộc họp với thông tin sau:

Tiêu đề: ${meetingInfo.title}
Ngày: ${meetingInfo.date}
Người tham gia: ${meetingInfo.participants.join(', ')}
Mục đích: ${meetingInfo.purpose}

${promptConfig.customPrompt ? `\nYêu cầu bổ sung:\n${promptConfig.customPrompt}` : ''}
    `;

    // Chuyển file thành ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Tạo model Gemini
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Gọi API với audio và prompt
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: Buffer.from(arrayBuffer).toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const recap = response.text();
    
    return recap;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw new Error('Đã xảy ra lỗi khi xử lý file âm thanh');
  }
}

/**
 * Xử lý file âm thanh từ Google Drive và tạo tóm tắt
 * @param driveUrl - URL của file âm thanh trên Google Drive
 * @param meetingInfo - Thông tin về cuộc họp
 * @param promptConfig - Cấu hình system prompt
 * @returns Tóm tắt cuộc họp
 */
export async function processGoogleDriveAudio(
  driveUrl: string,
  meetingInfo: MeetingInfo,
  promptConfig: SystemPromptConfig
): Promise<string> {
  try {
    // Tải file từ Google Drive
    const response = await fetch(driveUrl);
    const blob = await response.blob();
    
    // Chuyển blob thành File object
    const file = new File([blob], 'audio.mp3', { type: blob.type });
    
    // Xử lý file như local audio
    return await processLocalAudio(file, meetingInfo, promptConfig);
  } catch (error) {
    console.error('Error processing Google Drive audio:', error);
    throw new Error('Đã xảy ra lỗi khi xử lý file âm thanh từ Google Drive');
  }
} 