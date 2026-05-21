// ← NEW FILE | Issue #59 | Centralized Socket Event Manager

export const EVENTS = Object.freeze({
    // Board State & Elements
    BOARD_JOIN: 'join-room',
    BOARD_LOAD: 'load-board',
    BOARD_DELETED: 'board-deleted',
    DRAWING_STROKE: 'drawing-stroke',
    DRAW_ELEMENT: 'draw-element',
    DELETE_ELEMENT: 'delete-element',
    UPDATE_ELEMENT: 'update-element',
    SYNC_ELEMENTS: 'sync-elements',
    SYNC_STATE: 'sync-state',
    CLEAR_CANVAS: 'clear-canvas',

    // Theming & Viewport
    CHANGE_THEME: 'change-theme',
    THEME_CHANGED: 'theme-changed',
    VIEWPORT_CHANGE: 'viewport-change',

    // Cursors
    CURSOR_MOVE: 'cursor-move',

    // Permissions & Users
    ROOM_USERS_UPDATED: 'room-users-updated',
    GRANT_PERMISSION: 'grant-student-permission',
    REVOKE_PERMISSION: 'revoke-student-permission',
    PERMISSION_CHANGED: 'editing-permission-changed',
    TOGGLE_EDITING: 'toggle-student-editing',
    EDITING_CHANGED: 'student-editing-changed',
});
