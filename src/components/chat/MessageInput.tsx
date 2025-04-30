import React, { useState, useRef } from 'react';
import { Send, Image, X } from 'lucide-react';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (text: string, imageFile?: File) => Promise<void>;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!message && !imageFile) || isSending) return;
    
    setIsSending(true);
    
    try {
      await onSendMessage(message, imageFile || undefined);
      setMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="h-20 w-auto rounded-md object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white shadow-md"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={1}
          disabled={disabled || isSending}
        />
        
        <div className="flex items-center gap-1">
          <Button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || isSending}
          >
            <Image size={18} />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            type="button"
            variant="primary"
            size="sm"
            disabled={disabled || isSending || (!message && !imageFile)}
            isLoading={isSending}
          >
            <Send size={18} />
          </Button>
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MessageInput;