import React from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface RegistrationRequestCardProps {
  user: {
    uid: string;
    email: string;
    message?: string;
    createdAt: number;
  };
  onApprove: (uid: string) => void;
  onReject: (uid: string) => void;
  isLoading?: boolean;
}

const RegistrationRequestCard: React.FC<RegistrationRequestCardProps> = ({
  user,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start">
        <Avatar size="md" />
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium">{user.email}</h3>
              <p className="text-xs text-gray-500">
                Requested on {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          
          {user.message && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
              <p className="whitespace-pre-wrap">{user.message}</p>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(user.uid)}
              disabled={isLoading}
            >
              Approve
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(user.uid)}
              disabled={isLoading}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationRequestCard;