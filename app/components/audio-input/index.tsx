"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Link, FileAudio, AlertCircle } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";

// Định nghĩa props cho component
interface AudioInputProps {
  onFileSelect: (result: { type: 'local' | 'drive'; data: any }) => void;
}

// Hàm trích xuất ID file từ Google Drive URL
function extractGoogleDriveFileId(url: string): string | null {
  // Pattern cho các URL Google Drive phổ biến
  const patterns = [
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/, 
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /https:\/\/docs\.google\.com\/(.*?)\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // Trả về group đầu tiên có ID
      return match[1] || match[2];
    }
  }
  
  return null;
}

// Hàm kiểm tra URL Google Drive hợp lệ
function isValidGoogleDriveUrl(url: string): boolean {
  // Kiểm tra URL có phải định dạng Google Drive không
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return false;
  }
  
  // Kiểm tra có trích xuất được ID không
  const fileId = extractGoogleDriveFileId(url);
  return fileId !== null;
}

export function AudioInput({ onFileSelect }: AudioInputProps) {
  // State cho tệp âm thanh và URL của Google Drive
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [driveUrl, setDriveUrl] = useState('');
  const [driveUrlValid, setDriveUrlValid] = useState<boolean | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [isValidatingDrive, setIsValidatingDrive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Kiểm tra URL Google Drive khi người dùng nhập
  useEffect(() => {
    if (driveUrl.trim() === '') {
      setDriveUrlValid(null);
      setDriveFileId(null);
      return;
    }
    
    const isValid = isValidGoogleDriveUrl(driveUrl);
    setDriveUrlValid(isValid);
    
    if (isValid) {
      setDriveFileId(extractGoogleDriveFileId(driveUrl));
    } else {
      setDriveFileId(null);
    }
  }, [driveUrl]);
  
  // Xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Kiểm tra loại file
      const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
      if (!acceptedTypes.includes(file.type)) {
        toast.error('Định dạng file không hỗ trợ', {
          description: 'Vui lòng tải lên file âm thanh định dạng MP3, WAV hoặc M4A.'
        });
        return;
      }
      
      // Kiểm tra kích thước file (giới hạn 24MB)
      if (file.size > 24 * 1024 * 1024) {
        toast.error('File quá lớn', {
          description: 'Vui lòng tải lên file nhỏ hơn 24MB.'
        });
        return;
      }
      
      setAudioFile(file);
      toast.success('Đã tải file thành công', {
        description: file.name
      });
    }
  };
  
  // Xử lý khi người dùng nhấn nút tải lên
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Xử lý khi người dùng tiếp tục với file đã chọn
  const handleLocalContinue = () => {
    if (audioFile) {
      onFileSelect({ type: 'local', data: audioFile });
    } else {
      toast.error('Chưa chọn file', {
        description: 'Vui lòng chọn một file âm thanh để tiếp tục.'
      });
    }
  };
  
  // Xử lý khi người dùng tiếp tục với URL Google Drive
  const handleDriveContinue = async () => {
    if (!driveUrl) {
      toast.error('URL không hợp lệ', {
        description: 'Vui lòng nhập URL Google Drive hợp lệ.'
      });
      return;
    }
    
    if (!driveUrlValid) {
      toast.error('URL Google Drive không hợp lệ', {
        description: 'Vui lòng nhập đúng URL của file âm thanh từ Google Drive.'
      });
      return;
    }
    
    setIsValidatingDrive(true);
    
    try {
      // Giả lập kiểm tra quyền truy cập (trong triển khai thực, bạn nên có API endpoint để xác thực)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onFileSelect({ 
        type: 'drive', 
        data: `https://drive.google.com/uc?export=download&id=${driveFileId}` 
      });
    } catch (error) {
      toast.error('Không thể truy cập file', {
        description: 'Đảm bảo file được chia sẻ công khai hoặc "Ai có đường link đều xem được".'
      });
    } finally {
      setIsValidatingDrive(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tải lên file ghi âm cuộc họp</CardTitle>
        <CardDescription>
          Tải lên file ghi âm cuộc họp để AI tạo tóm tắt. Hỗ trợ định dạng MP3, WAV, và M4A.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Tải từ máy tính</TabsTrigger>
            <TabsTrigger value="drive">Từ Google Drive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleUploadClick}>
              <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/mp4,audio/m4a,audio/x-m4a"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-1">
                Nhấp để tải lên hoặc kéo thả file âm thanh vào đây
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV hoặc M4A. Tối đa 24MB.
              </p>
            </div>
            
            {audioFile && (
              <div className="flex items-center justify-between p-3 border rounded-lg mt-4">
                <div className="flex items-center gap-2 truncate">
                  <FileAudio className="h-5 w-5 text-muted-foreground" />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  onClick={handleLocalContinue}
                >
                  Tiếp tục
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="drive" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drive-url">URL Google Drive</Label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Link className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="drive-url"
                      placeholder="https://drive.google.com/file/d/..."
                      className={`pl-8 ${driveUrlValid === false ? 'border-red-500' : ''}`}
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="default"
                    onClick={handleDriveContinue}
                    disabled={!driveUrlValid || isValidatingDrive}
                  >
                    {isValidatingDrive ? 'Đang kiểm tra...' : 'Tiếp tục'}
                  </Button>
                </div>
              </div>
              
              {driveFileId && (
                <Alert className="bg-green-50 text-green-800 border-green-300">
                  <FileAudio className="h-4 w-4" />
                  <AlertTitle>Đã phát hiện file trên Google Drive</AlertTitle>
                  <AlertDescription>
                    File ID: {driveFileId.substring(0, 12)}...
                  </AlertDescription>
                </Alert>
              )}
              
              {driveUrlValid === false && driveUrl.trim() !== '' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>URL không hợp lệ</AlertTitle>
                  <AlertDescription>
                    Vui lòng nhập URL hợp lệ của file trên Google Drive. 
                    Ví dụ: https://drive.google.com/file/d/abc123.../view
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-xs text-muted-foreground">
                <p>Lưu ý:</p>
                <ul className="list-disc list-inside pl-2 space-y-1 mt-1">
                  <li>File nên được chia sẻ công khai hoặc "Ai có đường link đều xem được"</li>
                  <li>Chỉ hỗ trợ file âm thanh có định dạng MP3, WAV, M4A</li>
                  <li>Kích thước file tối đa 24MB</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 