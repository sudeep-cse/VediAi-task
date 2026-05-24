'use client';

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

/** Returns a shared Socket.io client, connecting lazily on first use. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function subscribeToPaper(paperId: string): void {
  getSocket().emit('subscribe', paperId);
}

export function unsubscribeFromPaper(paperId: string): void {
  getSocket().emit('unsubscribe', paperId);
}
