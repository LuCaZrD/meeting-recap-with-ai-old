'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface GoogleDriveInputProps {
  onFileLoaded: (content: string) => void;
}

export function GoogleDriveInput({ onFileLoaded }: GoogleDriveInputProps) {
  const [driveUrl, setDriveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driveUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi khi xử lý file Google Drive');
      }

      // TODO: Xử lý nội dung file khi API thực sự trả về dữ liệu
      onFileLoaded(`Nội dung file từ Google Drive: ${driveUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Drive</CardTitle>
        <CardDescription>
          Nhập liên kết Google Drive để tải nội dung cuộc họp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="https://drive.google.com/file/d/..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="flex-1"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !driveUrl}
            className="w-full"
          >
            {isLoading ? 'Đang xử lý...' : 'Tải file'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 