import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import Avatar from '../ui/Avatar';

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onDeleteMessage }) => {
  const { currentUser, isAdmin } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUser?.uid;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] items-end gap-2`}>
              {!isOwnMessage && <Avatar size="sm" />}
              
              <div
                className={`
                  rounded-lg p-3 shadow-sm
                  ${isOwnMessage
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                  }
                `}
              >
                {message.text && (
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                )}
                
                {message.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={message.imageUrl}
                      alt="Attached"
                      className="max-w-full rounded-md max-h-60 object-contain"
                    />
                  </div>
                )}
                
                <div className={`text-xs mt-1 flex justify-between ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;