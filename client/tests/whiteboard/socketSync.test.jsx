// ← NEW
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Whiteboard from '../../src/components/Whiteboard';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import io from 'socket.io-client';

// Mock the API client
vi.mock('../../src/lib/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: true }),
        post: vi.fn(),
    }
}));

// Mock socket.io-client
vi.mock('socket.io-client', () => {
    let listeners = {};
    const mockSocket = {
        on: vi.fn((event, cb) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
        off: vi.fn((event) => {
            delete listeners[event];
        }),
        emit: vi.fn(),
        close: vi.fn(),
        trigger: (event, data) => {
            if (listeners[event]) {
                listeners[event].forEach(cb => cb(data));
            }
        },
        disconnect: vi.fn(),
    };
    
    const ioFn = vi.fn(() => mockSocket);
    ioFn.__mockSocket = mockSocket;
    
    return {
        default: ioFn
    };
});

describe('Whiteboard Socket Synchronization', () => {
    let mockSocket;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify({ id: 'user1', role: 'teacher' }));
        mockSocket = io.__mockSocket;
        vi.clearAllMocks();
    });

    it('should connect and listen to socket events on mount', () => {
        render(
            <MemoryRouter initialEntries={['/board/123']}>
                <Routes>
                    <Route path="/board/:roomId" element={<Whiteboard />} />
                </Routes>
            </MemoryRouter>
        );

        expect(io).toHaveBeenCalled();
        expect(mockSocket.on).toHaveBeenCalledWith('draw-element', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('load-board', expect.any(Function));
    });

    it('should clean up socket listeners on unmount', () => {
        const { unmount } = render(
            <MemoryRouter initialEntries={['/board/123']}>
                <Routes>
                    <Route path="/board/:roomId" element={<Whiteboard />} />
                </Routes>
            </MemoryRouter>
        );

        unmount();

        expect(mockSocket.off).toHaveBeenCalledWith('draw-element');
        expect(mockSocket.off).toHaveBeenCalledWith('load-board');
    });
});
