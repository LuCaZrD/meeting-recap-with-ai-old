import { NextRequest, NextResponse } from 'next/server';

// Cấu hình để route này chạy động trên server
export const dynamic = 'force-dynamic';

// Trích xuất ID từ URL Google Drive
function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /https:\/\/docs\.google\.com\/(.*?)\/d\/([a-zA-Z0-9_-]+)/,
    /https:\/\/drive\.google\.com\/uc\?export=download&id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[2] || null;
    }
  }

  return null;
}

// Xác thực định dạng file và kích thước
async function validateAudioFile(response: Response): Promise<{ valid: boolean; reason?: string }> {
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  
  // Kiểm tra định dạng
  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a'];
  if (contentType && !validTypes.some(type => contentType.includes(type))) {
    return { valid: false, reason: 'Định dạng file không hỗ trợ. Chỉ hỗ trợ MP3, WAV, M4A.' };
  }
  
  // Kiểm tra kích thước (giới hạn 24MB)
  if (contentLength && parseInt(contentLength) > 24 * 1024 * 1024) {
    return { valid: false, reason: 'File quá lớn. Kích thước tối đa là 24MB.' };
  }
  
  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    // Lấy URL từ query params
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'Thiếu tham số URL' },
        { status: 400 }
      );
    }
    
    // Trích xuất ID file
    const fileId = extractGoogleDriveFileId(url);
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Không thể trích xuất ID file từ URL Google Drive' },
        { status: 400 }
      );
    }
    
    // Tạo URL trực tiếp để tải xuống
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Tải file
    console.log(`Đang tải file từ Google Drive: ${directUrl}`);
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Google Drive trả về lỗi: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Xác thực file
    const validation = await validateAudioFile(response);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }
    
    // Tạo stream từ dữ liệu và chuyển tiếp
    const blob = await response.blob();
    const newResponse = new NextResponse(blob);
    
    // Sao chép headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      newResponse.headers.set('content-type', contentType);
    }
    
    return newResponse;
  } catch (error) {
    console.error('Lỗi khi xử lý file từ Google Drive:', error);
    return NextResponse.json(
      { error: 'Xảy ra lỗi khi xử lý file từ Google Drive' },
      { status: 500 }
    );
  }
} 