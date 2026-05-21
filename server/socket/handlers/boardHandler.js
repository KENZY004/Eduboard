// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
const EVENTS = require('../events');
const Board = require('../../models/Board');
const { roomUsers } = require('../state');

const registerBoardHandlers = (io, socket) => {
    socket.on(EVENTS.DRAWING_STROKE, (strokeData) => {
        socket.to(strokeData.roomId).emit(EVENTS.DRAWING_STROKE, strokeData);
    });

    socket.on(EVENTS.DRAW_ELEMENT, async (element) => {
        socket.to(element.roomId).emit(EVENTS.DRAW_ELEMENT, element);
        try {
            const roomId = element.roomId;
            const updatedMatch = await Board.findOneAndUpdate(
                { roomId: roomId, "elements.id": element.id },
                { $set: { "elements.$": element, updatedAt: new Date() } },
                { new: true }
            );

            if (!updatedMatch) {
                await Board.findOneAndUpdate(
                    { roomId: roomId },
                    { $push: { elements: element }, $set: { updatedAt: new Date() } },
                    { upsert: true, new: true }
                );
            }
        } catch (err) {
            console.error('Error saving element:', err);
        }
    });

    socket.on(EVENTS.DELETE_ELEMENT, async ({ roomId, elementId }) => {
        socket.to(roomId).emit(EVENTS.DELETE_ELEMENT, elementId);
        try {
            await Board.findOneAndUpdate(
                { roomId },
                { $pull: { elements: { id: elementId } }, $set: { updatedAt: new Date() } }
            );
        } catch (err) {
            console.error('Error deleting element:', err);
        }
    });

    socket.on(EVENTS.UPDATE_ELEMENT, async ({ roomId, elementId, updates }) => {
        socket.to(roomId).emit(EVENTS.UPDATE_ELEMENT, { elementId, updates });
        try {
            await Board.findOneAndUpdate(
                { roomId, 'elements.id': elementId },
                { $set: { 'elements.$': updates, updatedAt: new Date() } }
            );
        } catch (err) {
            console.error('Error updating element:', err);
        }
    });

    socket.on(EVENTS.SYNC_ELEMENTS, async ({ roomId, elements }) => {
        socket.to(roomId).emit(EVENTS.SYNC_ELEMENTS, elements);
        try {
            await Board.findOneAndUpdate({ roomId }, { $set: { elements: elements, updatedAt: new Date() } });
        } catch (err) {
            console.error('Error syncing elements:', err);
        }
    });

    socket.on(EVENTS.SYNC_STATE, async ({ roomId, elements }) => {
        socket.to(roomId).emit(EVENTS.SYNC_STATE, elements);
        try {
            await Board.findOneAndUpdate({ roomId }, { $set: { elements: elements, updatedAt: new Date() } });
        } catch (err) {
            console.error('Error syncing state:', err);
        }
    });

    socket.on(EVENTS.CLEAR_CANVAS, async (roomId) => {
        io.to(roomId).emit(EVENTS.CLEAR_CANVAS);
        try {
            await Board.findOneAndUpdate({ roomId }, { $set: { elements: [] } }, { upsert: true });
        } catch (err) {
            console.error('Error clearing board:', err);
        }
    });

    socket.on(EVENTS.CHANGE_THEME, ({ roomId, isDark }) => {
        socket.to(roomId).emit(EVENTS.THEME_CHANGED, isDark);
    });

    socket.on(EVENTS.VIEWPORT_CHANGE, (data) => {
        socket.to(data.roomId).emit(EVENTS.VIEWPORT_CHANGE, data);
    });

    socket.on(EVENTS.GRANT_PERMISSION, async ({ roomId, studentId }) => {
        try {
            await Board.findOneAndUpdate({ roomId }, { $addToSet: { allowedStudents: studentId } });
            const roomUsersList = roomUsers.get(roomId);
            if (roomUsersList) {
                const student = roomUsersList.get(studentId);
                if (student) {
                    io.to(student.socketId).emit(EVENTS.PERMISSION_CHANGED, true);
                }
            }
        } catch (err) {
            console.error('Error granting permission:', err);
        }
    });

    socket.on(EVENTS.REVOKE_PERMISSION, async ({ roomId, studentId }) => {
        try {
            await Board.findOneAndUpdate({ roomId }, { $pull: { allowedStudents: studentId } });
            const roomUsersList = roomUsers.get(roomId);
            if (roomUsersList) {
                const student = roomUsersList.get(studentId);
                if (student) {
                    io.to(student.socketId).emit(EVENTS.PERMISSION_CHANGED, false);
                }
            }
        } catch (err) {
            console.error('Error revoking permission:', err);
        }
    });

    socket.on(EVENTS.TOGGLE_EDITING, async ({ roomId, allowEditing }) => {
        socket.to(roomId).emit(EVENTS.EDITING_CHANGED, allowEditing);
        try {
            await Board.findOneAndUpdate({ roomId }, { $set: { allowStudentEditing: allowEditing } });
        } catch (err) {
            console.error('Error updating student editing permission:', err);
        }
    });
};

module.exports = { registerBoardHandlers };
