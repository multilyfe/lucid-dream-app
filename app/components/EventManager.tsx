'use client';

import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { CalendarEvent, EventType, normaliseDate } from '../lib/events';

export default function EventManager() {
  const { events, addEvent, removeEvent, deleteAllEvents, toggles, toggleAutoDaily, toggleAutoPanty } = useEvents();
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'ritual',
    date: normaliseDate(new Date().toISOString()),
    xp: 25
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.type || !newEvent.date) return;

    const event: CalendarEvent = {
      id: `e${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type as EventType,
      date: newEvent.date,
      xp: newEvent.xp || 0,
      completed: false,
      source: 'manual'
    };

    addEvent(event);
    setNewEvent({
      title: '',
      type: 'ritual',
      date: normaliseDate(new Date().toISOString()),
      xp: 25
    });
  };

  const handleDeleteEvent = (id: string) => {
    removeEvent(id);
  };

  const handleDeleteAllEvents = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    deleteAllEvents();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleExportEvents = () => {
    const data = JSON.stringify(events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 p-4 bg-black/20 rounded-lg">
        <h3 className="text-lg font-semibold">Event Manager</h3>
        
        {/* Auto-generation toggles */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={toggles.autoDailyRitual}
              onChange={toggleAutoDaily}
              className="checkbox"
            />
            <span>Auto-generate Daily Rituals</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={toggles.autoPantyReset}
              onChange={toggleAutoPanty}
              className="checkbox"
            />
            <span>Auto-generate Panty Resets</span>
          </label>
        </div>

        {/* Add new event form */}
        <div className="grid grid-cols-4 gap-4">
          <label className="col-span-2">
            <span className="sr-only">Event Title</span>
            <input
              type="text"
              value={newEvent.title}
              onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event Title"
              aria-label="Event Title"
              className="input w-full"
            />
          </label>
          <label>
            <span className="sr-only">Event Type</span>
            <select
              value={newEvent.type}
              onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as EventType }))}
              aria-label="Event Type"
              className="select w-full"
            >
              <option value="ritual">Ritual 🔒</option>
              <option value="quest">Quest 📖</option>
              <option value="pantyReset">Panty Reset 🩲</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>
            <span className="sr-only">XP Reward</span>
            <input
              type="number"
              value={newEvent.xp}
              onChange={e => setNewEvent(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
              placeholder="XP Reward"
              aria-label="XP Reward"
              className="input w-full"
            />
          </label>
          <label className="col-span-3">
            <span className="sr-only">Event Date</span>
            <input
              type="date"
              value={newEvent.date}
              onChange={e => setNewEvent(prev => ({ ...prev, date: normaliseDate(e.target.value) }))}
              aria-label="Event Date"
              className="input w-full"
              />
            </label>
          <button
            onClick={handleAddEvent}
            className="btn btn-primary"
            disabled={!newEvent.title || !newEvent.type || !newEvent.date}
          >
            Add Event
          </button>
        </div>

        {/* Event list */}
        <div className="space-y-2">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-2 bg-black/10 rounded">
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm opacity-70">
                  {event.date} • {event.xp} XP
                  {event.source && ` • ${event.source}`}
                </div>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="btn btn-sm btn-ghost"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleExportEvents}
            className="btn btn-secondary flex-1"
          >
            Export Events
          </button>
          <button
            onClick={handleDeleteAllEvents}
            className="btn btn-danger"
          >
            {showDeleteConfirm ? 'Confirm Delete All' : 'Delete All'}
          </button>
          {showDeleteConfirm && (
            <button
              onClick={handleCancelDelete}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}