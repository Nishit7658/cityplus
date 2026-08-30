'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/config/api';

interface SocketEvent {
  type: string;
  data: unknown;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastEvent: SocketEvent | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastEvent: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[SocketProvider] Real-time websocket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[SocketProvider] Real-time websocket disconnected');
      setIsConnected(false);
    });

    // Listen for new complaints from WhatsApp/webhook
    socketInstance.on('new_complaint', (data: unknown) => {
      setLastEvent({ type: 'new_complaint', data });
    });

    // Listen for status changes
    socketInstance.on('complaint_status_changed', (data: unknown) => {
      setLastEvent({ type: 'complaint_status_changed', data });
    });

    // Listen for complaint reopened by citizen
    socketInstance.on('complaint_reopened', (data: unknown) => {
      setLastEvent({ type: 'complaint_reopened', data });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastEvent }}>
      {children}
    </SocketContext.Provider>
  );
};
