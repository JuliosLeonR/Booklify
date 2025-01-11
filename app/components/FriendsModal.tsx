import React from 'react';

type Friend = {
  id: number;
  profile_picture: string;
  username: string;
  name: string;
};

type FriendsModalProps = {
  show: boolean;
  onClose: () => void;
  friends: Friend[];
};

const FriendsModal: React.FC<FriendsModalProps> = ({ show, onClose, friends }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Friends</h3>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
            &times;
          </button>
        </div>
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center">
              <img src={`http://localhost/storage/${friend.profile_picture}`} alt={friend.username} className="w-10 h-10 rounded-full" />
              <div className="ml-4">
                <p className="text-gray-800 dark:text-gray-100 font-bold">{friend.name}</p>
                <p className="text-gray-600 dark:text-gray-300">@{friend.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;