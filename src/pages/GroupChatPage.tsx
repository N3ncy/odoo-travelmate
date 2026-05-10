import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '@/services/api';
import { wsService } from '@/services/websocket';
import { useAuth } from '@/hooks/useAuth';
import type { Message, GroupChatMessage, TypingIndicator } from '@/types';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Users,
  Image,
  MapPin,
  Smile,
  Reply,
  Pin,
  Trash2,
  AlertTriangle,
  Check,
  CheckCheck,
  Shield,
  Battery,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';

export function GroupChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [replyingTo, setReplyingTo] = useState<GroupChatMessage | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  // Mock room data
  const room = {
    id: roomId || 'room-1',
    name: 'Ladakh Adventure Group',
    type: 'group' as const,
    participants: [
      { id: '1', user_id: 'demo-user', profile: profile },
      { id: '2', user_id: '2', profile: { full_name: 'Priya Sharma', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' } },
      { id: '3', user_id: '3', profile: { full_name: 'Rahul Verma', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' } },
    ],
  };

  // Mock battery/location status
  const memberStatus = [
    { user_id: 'demo-user', battery: 85, lastLocation: '2 min ago', online: true },
    { user_id: '2', battery: 15, lastLocation: '5 min ago', online: true },
    { user_id: '3', battery: 62, lastLocation: '1 min ago', online: false },
  ];

  useEffect(() => {
    if (roomId) {
      loadMessages();
      connectWebSocket();
    }

    return () => {
      wsService.leaveRoom(roomId || '');
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = async () => {
    try {
      await wsService.connect(user?.id || 'demo-user', roomId);

      // Listen for new messages
      wsService.on('message', (event) => {
        if (event.type === 'message') {
          setMessages(prev => [...prev, event.payload as GroupChatMessage]);
        }
      });

      // Listen for typing indicators
      wsService.on('typing', (event) => {
        if (event.type === 'typing') {
          const indicator = event.payload as TypingIndicator;
          if (indicator.user_id !== user?.id) {
            setTypingUsers(prev => {
              const exists = prev.find(t => t.user_id === indicator.user_id);
              if (exists) return prev;
              return [...prev, indicator];
            });
          }
        }
      });

      wsService.on('typing_stop', (event) => {
        if (event.type === 'typing_stop') {
          const { user_id } = event.payload as { user_id: string };
          setTypingUsers(prev => prev.filter(t => t.user_id !== user_id));
        }
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const loadMessages = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const data = await chatService.getMessages(roomId);
      // Convert to GroupChatMessage format
      const groupMessages: GroupChatMessage[] = data.map(m => ({
        ...m,
        mentions: [],
        reactions: [],
        is_pinned: false,
        is_deleted: false,
      }));
      setMessages(groupMessages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    wsService.startTyping(roomId || '', profile?.full_name || 'User');
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !roomId) return;

    setSending(true);
    wsService.stopTyping(roomId);

    try {
      wsService.sendMessage(roomId, newMessage.trim(), replyingTo?.id);
      setNewMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    wsService.addReaction(messageId, emoji);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSenderName = (senderId: string) => {
    const participant = room.participants.find(p => p.user_id === senderId);
    return participant?.profile?.full_name || 'Unknown';
  };

  const getSenderAvatar = (senderId: string) => {
    const participant = room.participants.find(p => p.user_id === senderId);
    return participant?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex -space-x-2">
              {room.participants.slice(0, 3).map((p, i) => (
                <img
                  key={p.id}
                  src={p.profile?.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <div>
              <h2 className="font-semibold text-white">{room.name}</h2>
              <p className="text-xs text-gray-400">{room.participants.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSafetyPanel(!showSafetyPanel)}
              className="p-2 hover:bg-gray-700 rounded-lg text-emerald-400"
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety Status Panel */}
        {showSafetyPanel && (
          <div className="mt-3 p-3 bg-gray-700/50 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Group Safety Status
            </h4>
            <div className="space-y-2">
              {room.participants.map((p) => {
                const status = memberStatus.find(s => s.user_id === p.user_id);
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status?.online ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className="text-gray-300">{p.profile?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 ${(status?.battery || 0) < 20 ? 'text-red-400' : 'text-gray-400'}`}>
                        <Battery className="w-4 h-4" />
                        <span>{status?.battery}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Navigation className="w-4 h-4" />
                        <span>{status?.lastLocation}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {memberStatus.some(s => s.battery < 20) && (
              <div className="mt-2 p-2 bg-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4" />
                Low battery warning for some members
              </div>
            )}
          </div>
        )}

        {/* Members Panel */}
        {showMembers && (
          <div className="mt-3 p-3 bg-gray-700/50 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-2">Group Members</h4>
            <div className="space-y-2">
              {room.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img
                    src={p.profile?.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm text-white">{p.profile?.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {p.user_id === 'demo-user' ? 'You (Admin)' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Users className="w-12 h-12 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id || message.sender_id === 'demo-user';
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="w-8">
                      {showAvatar && (
                        <img
                          src={getSenderAvatar(message.sender_id)}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                    </div>
                  )}
                  <div>
                    {!isOwn && showAvatar && (
                      <p className="text-xs text-gray-500 mb-1 ml-2">
                        {getSenderName(message.sender_id)}
                      </p>
                    )}

                    {/* Reply indicator */}
                    {message.reply_to && (
                      <div className={`text-xs text-gray-500 mb-1 px-3 py-1 bg-gray-800 rounded-t-lg border-l-2 border-emerald-500 ${isOwn ? 'ml-auto' : ''}`}>
                        Replying to a message
                      </div>
                    )}

                    <div
                      className={`relative group px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-emerald-600 text-white rounded-tr-sm'
                          : 'bg-gray-700 text-white rounded-tl-sm'
                      } ${message.is_pinned ? 'ring-2 ring-yellow-500' : ''}`}
                    >
                      {message.is_pinned && (
                        <Pin className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                        {isOwn && (
                          message.is_read ? (
                            <CheckCheck className="w-3 h-3 text-blue-300" />
                          ) : (
                            <Check className="w-3 h-3 opacity-70" />
                          )
                        )}
                      </div>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {message.reactions.map((r, i) => (
                            <span key={i} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">
                              {r.emoji} {r.count}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick actions on hover */}
                      <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} hidden group-hover:flex items-center gap-1`}>
                        <button
                          onClick={() => setReplyingTo(message)}
                          className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          <Reply className="w-3 h-3 text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '👍')}
                          className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          <Smile className="w-3 h-3 text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.map(t => t.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <div>
              <p className="text-xs text-emerald-400">Replying to {getSenderName(replyingTo.sender_id)}</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{replyingTo.content}</p>
            </div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-700 rounded">
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
            <MapPin className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
