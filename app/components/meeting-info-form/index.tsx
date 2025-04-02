"use client";

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Plus, X } from 'lucide-react';

// Định nghĩa interface cho thông tin người tham gia
export interface Participant {
  name: string;
  title: string;
}

// Định nghĩa interface cho thông tin cuộc họp
export interface MeetingInfo {
  title: string;
  date: string;
  participants: Participant[];
  purpose: string;
  additionalNotes?: string;
}

// Định nghĩa props cho component
interface MeetingInfoFormProps {
  onSubmit: (info: MeetingInfo) => void;
}

export function MeetingInfoForm({ onSubmit }: MeetingInfoFormProps) {
  // State cho thông tin cuộc họp
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({
    title: '',
    date: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
    participants: [
      { name: '', title: '' }, // Người thứ nhất
      { name: '', title: '' }  // Người thứ hai
    ],
    purpose: '',
    additionalNotes: '',
  });
  
  // Xử lý khi thông tin cuộc họp thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeetingInfo({
      ...meetingInfo,
      [name]: value,
    });
  };
  
  // Xử lý khi thông tin người tham gia thay đổi
  const handleParticipantChange = (index: number, field: 'name' | 'title', value: string) => {
    const updatedParticipants = [...meetingInfo.participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value
    };
    
    setMeetingInfo({
      ...meetingInfo,
      participants: updatedParticipants
    });
  };
  
  // Xử lý khi người dùng thêm người tham gia mới
  const handleAddParticipant = () => {
    setMeetingInfo({
      ...meetingInfo,
      participants: [...meetingInfo.participants, { name: '', title: '' }]
    });
  };
  
  // Xử lý khi người dùng xóa người tham gia
  const handleRemoveParticipant = (index: number) => {
    if (meetingInfo.participants.length > 1) { // Luôn giữ ít nhất một người tham gia
      const updatedParticipants = [...meetingInfo.participants];
      updatedParticipants.splice(index, 1);
      setMeetingInfo({
        ...meetingInfo,
        participants: updatedParticipants
      });
    }
  };
  
  // Xử lý khi người dùng submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc
    if (!meetingInfo.title || !meetingInfo.date) {
      return;
    }
    
    // Lọc bỏ người tham gia có tên trống
    const filteredParticipants = meetingInfo.participants.filter(p => p.name.trim() !== '');
    
    // Nếu không có người tham gia nào, thêm người dùng hiện tại
    if (filteredParticipants.length === 0) {
      filteredParticipants.push({ name: 'Bạn', title: '' });
    }
    
    onSubmit({
      ...meetingInfo,
      participants: filteredParticipants
    });
  };
  
  // Đặt placeholder cho người đầu tiên và người tiếp theo
  const getNamePlaceholder = (index: number) => {
    return index === 0 ? "Tên bạn" : "Tên đối tác/đồng nghiệp";
  };
  
  const getTitlePlaceholder = () => "Chức vụ";
  
  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-6">
          <CardTitle>Thông tin cuộc họp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title">Tiêu đề cuộc họp <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="Ví dụ: Cuộc họp nhóm dự án XYZ hàng tuần"
              value={meetingInfo.title}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="date">Ngày họp <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={meetingInfo.date}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Người tham gia (optional)</Label>
              <Button 
                type="button" 
                onClick={handleAddParticipant}
                variant="outline"
                size="sm"
                className="h-9 px-3"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm người
              </Button>
            </div>
            
            <div className="space-y-2">
              {meetingInfo.participants.map((participant, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-center p-2 bg-muted/10 rounded-md">
                  <div className="space-y-1">
                    <Input
                      placeholder={getNamePlaceholder(index)}
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                    </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder={getTitlePlaceholder()}
                        value={participant.title}
                        onChange={(e) => handleParticipantChange(index, 'title', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-destructive/10"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        <X className="h-5 w-5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="purpose">Mục đích cuộc họp <span className="text-red-500">*</span></Label>
            <Textarea
              id="purpose"
              name="purpose"
              placeholder="Mô tả ngắn gọn mục đích của cuộc họp"
              value={meetingInfo.purpose}
              onChange={handleChange}
              required
              className="resize-none min-h-[100px]"
              rows={3}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="additionalNotes">Ghi chú bổ sung (optional)</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              placeholder="Các thông tin bổ sung khác về cuộc họp (không bắt buộc)"
              value={meetingInfo.additionalNotes}
              onChange={handleChange}
              className="resize-none min-h-[100px]"
              rows={3}
            />
            <p className="text-sm text-muted-foreground italic pt-1">
              *Bạn nên bổ sung thêm các thông tin về tên công ty, tên sản phẩm, các tên viết tắt,... để AI hiểu và ghi chính xác hơn trong phần recap
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button type="submit" className="px-6 py-5 h-11 text-base">Tiếp tục</Button>
        </CardFooter>
      </form>
    </Card>
  );
}