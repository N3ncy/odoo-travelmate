import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  MapPin,
  Image as ImageIcon,
  Smile,
  Shield,
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store';
import type { ChatRoom, Message } from '@/types';

export function ChatPage() {
  const { profile } = useAuthStore();
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    sendMessage,
    openRoom,
    closeRoom,
  } = useChat(profile?.id || 'demo-user');

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(messageInput.trim());
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParticipant = (room: ChatRoom) => {
    return room.participants.find((p) => p.user_id !== profile?.id && p.profile)?.profile;
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Sidebar - Room List */}
      <div
        className={`${
          currentRoom ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-500">
                Match with travelers to start chatting
              </p>
            </div>
          ) : (
            rooms.map((room) => {
              const otherUser = getOtherParticipant(room);
              const isActive = currentRoom?.id === room.id;
              const hasUnread = room.last_message && !room.last_message.is_read && room.last_message.sender_id !== profile?.id;

              return (
                <button
                  key={room.id}
                  onClick={() => openRoom(room)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-emerald-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {room.type === 'group' ? (
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-bold">
                          {room.name?.charAt(0) || 'G'}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.full_name}`}
                        alt={otherUser?.full_name || 'User'}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {room.type === 'group' ? room.name : otherUser?.full_name || 'Unknown'}
                      </h3>
                      {room.last_message && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(room.last_message.created_at), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    {room.last_message && (
                      <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {room.last_message.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat View */}
      {currentRoom ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={closeRoom}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {currentRoom.type === 'group' ? (
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold">
                  {currentRoom.name?.charAt(0) || 'G'}
                </span>
              </div>
            ) : (
              <img
                src={getOtherParticipant(currentRoom)?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
            )}

            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">
                {currentRoom.type === 'group'
                  ? currentRoom.name
                  : getOtherParticipant(currentRoom)?.full_name || 'Unknown'}
              </h2>
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Verified Traveler</span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === profile?.id || message.sender_id === 'demo-user';
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && showAvatar && (
                          <img
                            src={message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.full_name}`}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-emerald-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-emerald-200' : 'text-gray-400'
                            }`}
                          >
                            {format(new Date(message.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <MapPin className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Empty state for desktop
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
