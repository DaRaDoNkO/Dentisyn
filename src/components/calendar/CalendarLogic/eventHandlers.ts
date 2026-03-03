/**
 * EventHandlers - Barrel export for calendar event handling modules
 * 
 * This module re-exports popup and drag-drop handlers from specialized submodules:
 * - popups/eventDetailsPopup: Event details display and deletion
 * - popups/editPopup: Inline appointment editing
 * - popups/confirmMoveModal: Move confirmation UI
 * - dropHandler: Drag & drop validation and appointment movement
 */

export { showEventDetailsPopup } from './popups/eventDetailsPopup';
export { handleEventDrop } from './dropHandler';
