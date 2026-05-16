import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socketInstance: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Reuse existing connection
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep alive for the session
    };
  }, []);

  return socketRef;
}
