import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '@/store';
import { chatService } from '@/services/api';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { Message, ChatRoom } from '@/types';

export function useChat(userId: string) {
  const {
    rooms,
    currentRoom,
    messages,
    unreadCount,
    setRooms,
    setCurrentRoom,
    setMessages,
    addMessage,
    setUnreadCount,
  } = useChatStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch all chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getRooms(userId);
      setRooms(data);

      // Calculate unread count
      const unread = data.reduce((acc, room) => {
        if (room.last_message && !room.last_message.is_read && room.last_message.sender_id !== userId) {
          return acc + 1;
        }
        return acc;
      }, 0);
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, setRooms, setUnreadCount]);

  // Fetch messages for a room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(roomId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setMessages]);

  // Send a message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'location' = 'text') => {
    if (!currentRoom) return;

    try {
      const message = await chatService.sendMessage({
        room_id: currentRoom.id,
        sender_id: userId,
        content,
        message_type: messageType,
      });
      addMessage(message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentRoom, userId, addMessage]);

  // Open a chat room
  const openRoom = useCallback(async (room: ChatRoom) => {
    setCurrentRoom(room);
    await fetchMessages(room.id);
  }, [setCurrentRoom, fetchMessages]);

  // Close current room
  const closeRoom = useCallback(() => {
    setCurrentRoom(null);
    setMessages([]);
  }, [setCurrentRoom, setMessages]);

  // Create a new chat room
  const createRoom = useCallback(async (tripId: string, participantIds: string[]) => {
    try {
      const room = await chatService.createRoom(tripId, participantIds);
      setRooms([room, ...rooms]);
      return room;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [rooms, setRooms]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentRoom || isDemoMode) return;

    channelRef.current = supabase
      .channel(`room-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentRoom.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== userId) {
            addMessage(newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentRoom, userId, addMessage]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchRooms();
    }
  }, [userId, fetchRooms]);

  return {
    rooms,
    currentRoom,
    messages,
    unreadCount,
    loading,
    error,
    fetchRooms,
    fetchMessages,
    sendMessage,
    openRoom,
    closeRoom,
    createRoom,
  };
}
