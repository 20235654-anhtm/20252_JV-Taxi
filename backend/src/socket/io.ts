import { Server } from 'socket.io';

let _io: Server;

export function setIO(io: Server) {
  _io = io;
}

export function getIO(): Server {
  if (!_io) throw new Error('Socket.io not initialized');
  return _io;
}
