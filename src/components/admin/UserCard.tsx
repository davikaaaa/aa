import React from 'react';
import { MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface UserCardProps {
  id: string;
  name: string | null;
  photoURL: string | null;
  lastMessage?: string;
  unreadCount?: number;
  onClick: () => void;
  isActive?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  photoURL,
  lastMessage,
  unreadCount = 0,
  onClick,
  isActive = false
}) => {
  return (
    <div 
      className={`
        flex items-center p-3 cursor-pointer transition-colors
        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
        border-b border-gray-200
      `}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-3">
        <Avatar src={photoURL} alt={name || 'User'} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium truncate">
            {name || 'Unnamed User'}
          </h3>
          
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        
        {lastMessage && (
          <p className="text-xs text-gray-500 truncate">
            {lastMessage}
          </p>
        )}
      </div>
      
      <MessageSquare className="ml-2 text-gray-400" size={16} />
    </div>
  );
};

export default UserCard;