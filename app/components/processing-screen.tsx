"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { processLocalAudio, processGoogleDriveAudio } from '@/app/lib/ai-service';
import { MeetingInfo } from './meeting-info-form';
import { X } from 'lucide-react';
import { Button } from './ui/button';

// Định nghĩa kiểu dữ liệu cho nguồn âm thanh (local hoặc drive)
type AudioSource = {
  type: 'local' | 'drive';
  data: File | string;
};

// Danh sách các thông điệp thú vị
const FUN_MESSAGES = {
  audio: [
    "Đang lắng nghe từng âm tiết...",
    "Phân tích giọng điệu cuộc họp...",
    "Lọc tiếng ồn background...",
    "Tăng âm lượng những ý kiến nhỏ nhẹ...",
    "Điều chỉnh tần số âm thanh...",
  ],
  ai: [
    "Đang nạp từ điển chuyên ngành...",
    "Đánh thức các neuron nhân tạo...",
    "Huấn luyện AI nhận dạng tiếng cười...",
    "Tìm kiếm trong kho dữ liệu cuộc họp...",
    "Đang xử lý 10,428 mô hình ngôn ngữ...",
  ],
  meeting: [
    "Bỏ qua phần chào hỏi dài dòng...",
    "Đang phát hiện các ý kiến quan trọng...",
    "Phân loại mức độ đồng thuận...",
    "Nhận diện người hay ngắt lời nhất...",
    "Đếm số lần nói 'Ừm' và 'À'...",
  ],
  funny: [
    "Đang lọc các câu 'Mọi người nghe thấy tôi không?'...",
    "Phát hiện những người lén lút chơi game...",
    "Đếm số phút im lặng ngại ngùng...",
    "Nhận diện tiếng thở dài của sếp...",
    "Phân tích mức độ buồn ngủ qua giọng nói...",
  ],
  tasks: [
    "Ghi chép điểm mốc quan trọng...",
    "Đang tổng hợp các ý kiến trái chiều...",
    "Xác định nhiệm vụ được giao...",
    "Sắp xếp ưu tiên công việc...",
    "Lập kế hoạch hành động...",
  ],
  humor: [
    "Pha cà phê cho AI đang làm việc...",
    "Đang nướng bánh quy neuron...",
    "Dỗ dành AI khi nó thấy quá nhiều công việc...",
    "Xin phép mọi người 5 phút tập trung...",
    "Tắt micro của người nói quá nhiều...",
  ]
};

// Hàm Fisher-Yates shuffle
const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Trạng thái xử lý
type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

interface ProcessingScreenProps {
  onComplete: (result: string) => void;
  audioSource: AudioSource;
  meetingInfo: MeetingInfo;
  promptConfig: any;
}

export function ProcessingScreen({ onComplete, audioSource, meetingInfo, promptConfig }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>('Chuẩn bị xử lý...');
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Refs để lưu trữ interval ids
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesQueueRef = useRef<string[]>([]);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo và xử lý
  useEffect(() => {
    // Xáo trộn và chuẩn bị tất cả thông điệp
    let allMessages: string[] = [];
    Object.values(FUN_MESSAGES).forEach(category => {
      allMessages = [...allMessages, ...category];
    });
    messagesQueueRef.current = shuffleArray(allMessages);
    
    // Đặt trạng thái processing
    setProcessingState('processing');
    
    // Bắt đầu đếm thời gian
    timeIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Cập nhật thông điệp mỗi 3 giây
    let messageIndex = 0;
    messageIntervalRef.current = setInterval(() => {
      setCurrentMessage(messagesQueueRef.current[messageIndex]);
      messageIndex = (messageIndex + 1) % messagesQueueRef.current.length;
    }, 3000);
    
    // Cập nhật tiến trình theo đường cong phi tuyến
    progressIntervalRef.current = setInterval(() => {
      setProgress(currentProgress => {
        if (currentProgress >= 95) return currentProgress;
        
        // Phi tuyến: nhanh lúc đầu, chậm dần về sau
        const remainingProgress = 95 - currentProgress;
        const increment = Math.max(0.5, remainingProgress * 0.06);
        return Math.min(95, currentProgress + increment);
      });
    }, 800);
    
    // Thiết lập timeout sau 3 phút nếu xử lý quá lâu
    processingTimeoutRef.current = setTimeout(() => {
      if (processingState === 'processing') {
        setCurrentMessage("Đang xử lý lâu hơn dự kiến, vui lòng đợi thêm...");
      }
    }, 3 * 60 * 1000);
    
    // Thực hiện xử lý thực tế
    const processAudio = async () => {
      try {
        // Xử lý với Gemini API
        let recap: string;
        
        if (audioSource.type === 'local') {
          recap = await processLocalAudio(audioSource.data as File, meetingInfo, promptConfig);
        } else if (audioSource.type === 'drive') {
          recap = await processGoogleDriveAudio(audioSource.data as string, meetingInfo, promptConfig);
        } else {
          throw new Error('Không hỗ trợ định dạng nguồn âm thanh này');
        }
        
        // Nhảy đến 100% và kết thúc
        setProgress(100);
        setCurrentMessage('Hoàn tất!');
        setProcessingState('success');
        
        // Trả về kết quả
        setTimeout(() => {
          onComplete(recap);
        }, 500); // Chờ một chút để hiển thị 100%
      } catch (error) {
        console.error('Lỗi xử lý:', error);
        setError('Đã xảy ra lỗi khi xử lý file âm thanh. Vui lòng thử lại.');
        setCurrentMessage('Lỗi xử lý');
        setProcessingState('error');
      }
    };

    processAudio();
    
    // Cleanup khi unmount
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, [audioSource, meetingInfo, promptConfig, onComplete]);
  
  // Format thời gian đã trôi qua
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Hàm hủy xử lý
  const handleCancel = () => {
    // Cleanup tất cả intervals và timeout
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    
    // Đặt lỗi và trạng thái error
    setError('Quá trình xử lý đã bị hủy.');
    setProcessingState('error');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {audioSource.type === 'local' 
            ? 'Đang xử lý file âm thanh' 
            : 'Đang tải và xử lý file từ Google Drive'}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Thời gian: {formatElapsedTime(elapsedTime)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>{currentMessage}</span>
          </div>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="bg-destructive/10 p-4 rounded-md text-sm text-destructive">
            {error}
          </div>
        )}
        
        {/* Nút hủy xử lý */}
        {processingState === 'processing' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={handleCancel}
          >
            <X className="mr-2 h-4 w-4" /> Hủy xử lý
          </Button>
        )}
        
        {/* Hiển thị thông báo khi thành công */}
        {processingState === 'success' && (
          <div className="bg-green-100 p-4 rounded-md text-sm text-green-800">
            Phân tích hoàn tất! Đang tải kết quả...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 