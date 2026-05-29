// ← NEW
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Whiteboard from '../../src/components/Whiteboard';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import io from 'socket.io-client';

vi.mock('../../src/lib/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: true })
    }
}));

vi.mock('socket.io-client', () => {
    let listeners = {};
    const mockSocket = {
        on: vi.fn((event, cb) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
        off: vi.fn(),
        emit: vi.fn(),
        close: vi.fn(),
        trigger: (event, data) => {
            if (listeners[event]) listeners[event].forEach(cb => cb(data));
        }
    };
    const ioFn = vi.fn(() => mockSocket);
    ioFn.__mockSocket = mockSocket;
    return { default: ioFn };
});

describe('Whiteboard Collaboration', () => {
    let mockSocket;

    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify({ id: 'user1', role: 'teacher' }));
        mockSocket = io.__mockSocket;
        vi.clearAllMocks();
    });

    it('emits clear-canvas event when clear button is clicked', () => {
        const { getByTitle } = render(
            <MemoryRouter initialEntries={['/board/123']}>
                <Routes>
                    <Route path="/board/:roomId" element={<Whiteboard />} />
                </Routes>
            </MemoryRouter>
        );

        const clearBtn = getByTitle('Clear All');
        fireEvent.click(clearBtn);

        expect(mockSocket.emit).toHaveBeenCalledWith('clear-canvas', '123');
    });
});
