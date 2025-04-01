"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { processLocalAudio } from '@/app/lib/ai-service';

interface ProcessingScreenProps {
  onComplete: (result: string) => void;
  audioFile: File;
  meetingInfo: any;
  promptConfig: any;
}

export function ProcessingScreen({ onComplete, audioFile, meetingInfo, promptConfig }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('Chuẩn bị xử lý...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAudio = async () => {
      try {
        // 1. Chuẩn bị xử lý
        setProgress(20);
        setCurrentStep('Đang chuẩn bị xử lý file âm thanh...');

        // 2. Xử lý với Gemini API
        setProgress(50);
        setCurrentStep('Đang phân tích nội dung cuộc họp...');
        const recap = await processLocalAudio(audioFile, meetingInfo, promptConfig);

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
  }, [audioFile, meetingInfo, promptConfig, onComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Đang xử lý file âm thanh</CardTitle>
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