import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface SystemPromptEditorProps {
  onSubmit: (prompt: string) => void;
  meetingInfo: {
    title: string;
    purpose: string;
    date: string;
    participants: Array<{name: string; title: string;}>;
    additionalNotes?: string;
  };
}

// Define the default prompt template
const DEFAULT_PROMPT_TEMPLATE = `Hãy phân tích nội dung âm thanh để xác định loại hội thoại (cuộc họp chính thức, trò chuyện cơ hội kinh doanh, thảo luận không chính thức...) và tạo bản tóm tắt với định dạng phù hợp.

THÔNG TIN QUAN TRỌNG THEO NGỮ CẢNH:
{{additionalNotes}}

NHẬN DẠNG NGỮ CẢNH:
Đầu tiên, xác định ngữ cảnh cuộc trò chuyện dựa trên nội dung âm thanh. Đánh giá nội dung để xác định nếu đây là:
- Cuộc họp chính thức (ví dụ: họp doanh nghiệp, dự án, đánh giá)
- Trò chuyện về cơ hội kinh doanh (ví dụ: đàm phán, tư vấn, bán hàng)
- Thảo luận không chính thức (ví dụ: trao đổi ý tưởng, họp nhóm nhỏ)
- Loại hội thoại khác (xác định cụ thể)

THÔNG TIN CƠ BẢN:
- Tiêu đề: {title}
- Ngày: {date}
- Mục đích: {purpose}
- Người tham gia: {participants}

TÓM TẮT CHÍNH:
Tạo tóm tắt ngắn gọn (2-3 đoạn) về những điểm chính của cuộc trò chuyện. Tóm tắt này nên bắt đầu bằng một câu tổng quát về mục đích và bối cảnh, sau đó đi vào nội dung chính đã được thảo luận. Điều chỉnh giọng điệu và phong cách phù hợp với ngữ cảnh (ví dụ: chính thức cho cuộc họp, chuyên nghiệp nhưng thoải mái hơn cho thảo luận không chính thức).

ĐIỂM CHÍNH:
Liệt kê 3-7 điểm chính đã được đề cập trong cuộc trò chuyện. Đối với:
- Cuộc họp chính thức: Tập trung vào quyết định, chiến lược và kết quả kinh doanh
- Trò chuyện cơ hội: Nhấn mạnh nhu cầu, đề xuất giải pháp, lợi ích và các bước tiếp theo
- Thảo luận không chính thức: Tóm tắt ý tưởng, quan điểm và chủ đề thảo luận

CÔNG VIỆC TIẾP THEO:
Xác định các hành động tiếp theo, nhiệm vụ hoặc trách nhiệm đã được đề cập trong cuộc trò chuyện. Đối với mỗi mục, nêu rõ ai chịu trách nhiệm (nếu được đề cập) và thời hạn (nếu biết). Nếu không có công việc tiếp theo cụ thể, có thể bỏ qua phần này.

CHI TIẾT CÓ GIÁ TRỊ:
Liệt kê các thông tin quan trọng khác có thể hữu ích cho người dùng (số liệu, ngày tháng, thông tin liên hệ, URL, v.v.). Ưu tiên thông tin thực tế, cụ thể hơn là bình luận chung chung.

ĐỊNH DẠNG:
Sử dụng Markdown để định dạng bản tóm tắt, bao gồm:
- Tiêu đề (#, ##)
- Danh sách có dấu đầu dòng (- hoặc *)
- **In đậm** cho điểm nhấn quan trọng
- *In nghiêng* khi thích hợp
- > Blockquote cho các trích dẫn trực tiếp

LƯU Ý: Điều chỉnh độ dài, mức độ chi tiết và tính chính thức dựa trên ngữ cảnh thực tế của cuộc trò chuyện. Tập trung vào những gì mang lại giá trị thực tế cho người dùng.

LƯU Ý ĐẶC BIỆT:
- Sử dụng đúng chức danh/vị trí của mỗi người tham gia khi nhắc đến họ trong tóm tắt
- Ghi chú chi tiết ai đã nói điều gì khi đó là thông tin quan trọng
- Đảm bảo sử dụng đúng chính xác các thuật ngữ chuyên ngành, tên công ty, tên sản phẩm, và các từ viết tắt được đề cập trong ghi chú bổ sung`;

// Replace variables with highlighted versions for display in the UI
const formatPromptForDisplay = (prompt: string) => {
  return prompt
    .replace(/\{title\}/g, '<span class="param-highlight">{title}</span>')
    .replace(/\{purpose\}/g, '<span class="param-highlight">{purpose}</span>')
    .replace(/\{date\}/g, '<span class="param-highlight">{date}</span>')
    .replace(/\{participants\}/g, '<span class="param-highlight">{participants}</span>');
};

export function SystemPromptEditor({ onSubmit, meetingInfo }: SystemPromptEditorProps) {
  // Xử lý placeholder additionalNotes
  const processAdditionalNotes = (info: typeof meetingInfo) => {
    if (info.additionalNotes && info.additionalNotes.trim()) {
      return `Người dùng cung cấp thông tin bổ sung sau đây, hãy đặc biệt lưu ý và sử dụng đúng các thuật ngữ, tên công ty, sản phẩm và viết tắt được đề cập:
"${info.additionalNotes.trim()}"`;
    }
    return ''; // Return empty string if no notes
  };

  // Tạo hàm để tạo prompt với tất cả thông tin
  const createFormattedPrompt = () => {
    // Tạo nội dung participants string
    const participantsText = meetingInfo.participants
      .map(p => {
        const name = p.name?.trim();
        const title = p.title?.trim();
        if (!name) return null; // Skip participants without a name
        return name + (title ? ` (${title})` : '');
      })
      .filter(Boolean) // Remove null entries
      .join(', ') || '(Không có người tham gia được chỉ định)'; // Fallback if no valid participants

    // Thay thế placeholder với các giá trị thực
    let processedPrompt = DEFAULT_PROMPT_TEMPLATE
      .replace('{title}', meetingInfo.title || '(Chưa có tiêu đề)')
      .replace('{purpose}', meetingInfo.purpose || '(Chưa có mục đích)')
      .replace('{date}', meetingInfo.date || '(Chưa có ngày)')
      .replace('{participants}', participantsText);

    // Handle additional notes - remove the section entirely if empty
    const additionalNotesContent = processAdditionalNotes(meetingInfo);
    if (additionalNotesContent) {
       processedPrompt = processedPrompt.replace('{{additionalNotes}}', additionalNotesContent);
    } else {
      // Remove the entire "THÔNG TIN QUAN TRỌNG THEO NGỮ CẢNH" section including the heading and the placeholder line
       processedPrompt = processedPrompt.replace(/THÔNG TIN QUAN TRỌNG THEO NGỮ CẢNH:\s*{{additionalNotes}}\s*/, '');
    }

    return processedPrompt;
  };

  // Khởi tạo prompt với tất cả thông tin
  const [prompt, setPrompt] = useState(createFormattedPrompt());

  // Khôi phục prompt mặc định với các giá trị hiện tại
  const handleResetPrompt = () => {
    setPrompt(createFormattedPrompt());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  // Hiển thị các biến với highlight - *No longer used directly for initial display*
  // const highlightVariables = (text: string) => { ... };

  return (
    <div className="bg-paper border border-border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tùy chỉnh yêu cầu AI</h2>
        <button
          type="button"
          onClick={handleResetPrompt}
          className="flex items-center text-sm text-content/70 hover:text-content"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Khôi phục mặc định
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block mb-1 font-medium">
            Yêu cầu cho AI <span className="text-red-500">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={20}
            className="w-full p-3 border border-border rounded bg-paper font-mono text-sm whitespace-pre-wrap"
            placeholder="Xem lại và chỉnh sửa yêu cầu cho AI tại đây..."
            required
          />
          <p className="mt-2 text-sm text-content/70">
            Sử dụng các biến như <span className="font-semibold bg-green-600/20 px-1 rounded text-content">{'{title}'}</span>, <span className="font-semibold bg-green-600/20 px-1 rounded text-content">{'{purpose}'}</span>, <span className="font-semibold bg-green-600/20 px-1 rounded text-content">{'{date}'}</span>, <span className="font-semibold bg-green-600/20 px-1 rounded text-content">{'{participants}'}</span> để đưa thông tin cuộc họp vào prompt.
          </p>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2 bg-content text-paper rounded hover:bg-content/90 font-medium"
          >
            Bắt đầu xử lý
          </button>
        </div>
      </form>

      <style jsx>{`
        .param-highlight {
          background-color: rgba(22, 163, 74, 0.2);
          font-weight: 600;
          padding: 0 2px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
} 