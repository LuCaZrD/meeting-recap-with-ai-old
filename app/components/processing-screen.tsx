"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { processLocalAudio, processGoogleDriveAudio } from '@/app/lib/ai-service';
import { MeetingInfo } from './meeting-info-form';

// Định nghĩa kiểu dữ liệu cho nguồn âm thanh (local hoặc drive)
type AudioSource = {
  type: 'local' | 'drive';
  data: File | string;
};

interface ProcessingScreenProps {
  onComplete: (result: string) => void;
  audioSource: AudioSource;
  meetingInfo: MeetingInfo;
  promptConfig: any;
}

export function ProcessingScreen({ onComplete, audioSource, meetingInfo, promptConfig }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('Chuẩn bị xử lý...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAudio = async () => {
      try {
        // 1. Chuẩn bị xử lý
        setProgress(20);
        setCurrentStep('Đang chuẩn bị xử lý file âm thanh...');

        let recap: string;

        // 2. Xử lý với Gemini API
        setProgress(50);
        setCurrentStep('Đang phân tích nội dung cuộc họp...');
        
        if (audioSource.type === 'local') {
          recap = await processLocalAudio(audioSource.data as File, meetingInfo, promptConfig);
        } else if (audioSource.type === 'drive') {
          recap = await processGoogleDriveAudio(audioSource.data as string, meetingInfo, promptConfig);
        } else {
          throw new Error('Không hỗ trợ định dạng nguồn âm thanh này');
        }

        // 3. Hoàn tất
        setProgress(100);
        setCurrentStep('Hoàn tất!');
        
        // Trả về kết quả
        onComplete(recap);
      } catch (error) {
        console.error('Lỗi xử lý:', error);
        setError('Đã xảy ra lỗi khi xử lý file âm thanh. Vui lòng thử lại.');
        setCurrentStep('Lỗi xử lý');
      }
    };

    processAudio();
  }, [audioSource, meetingInfo, promptConfig, onComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {audioSource.type === 'local' 
            ? 'Đang xử lý file âm thanh' 
            : 'Đang tải và xử lý file từ Google Drive'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{currentStep}</p>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
} 