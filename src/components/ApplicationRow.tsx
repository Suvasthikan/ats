'use client';

import { useState } from 'react';
import { ApplicationWithDetails, ApplicationStatus, APPLICATION_STATUSES } from '@/types';
import StatusBadge from './StatusBadge';

interface ApplicationRowProps {
  application: ApplicationWithDetails;
}

export default function ApplicationRow({ application }: ApplicationRowProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status as ApplicationStatus);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState(application.notes || []);
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setStatus(newStatus);
    } catch (error) {
      alert('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/applications/${application.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes([data.data, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      alert('Error adding note');
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {application.candidate.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {application.candidate.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">{application.job?.title}</div>
          <div className="text-xs text-gray-500">
            {new Date(application.appliedAt).toLocaleDateString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <span 
              className={`text-xs font-bold ${
                (application.aiScore || 0) >= 90 ? 'text-green-600' :
                (application.aiScore || 0) >= 70 ? 'text-blue-600' :
                'text-yellow-600'
              }`}
            >
              Score: {application.aiScore}/100
            </span>
            <div className="text-xs text-gray-500 truncate max-w-[200px]" title={application.aiSummary || ''}>
              {application.aiSummary}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
            disabled={isUpdating}
            className="text-sm rounded-full px-3 py-1 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isNotesOpen ? 'Close Notes' : `Notes (${notes.length})`}
            </button>
            {application.candidate.resumeName && (
              <a
                href={`/api/applications/${application.id}/resume`}
                download={application.candidate.resumeName}
                className="inline-flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Resume
              </a>
            )}
          </div>
        </td>
      </tr>
      {isNotesOpen && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a private note..."
                  className="input flex-1"
                />
                <button type="submit" className="btn btn-primary text-sm whitespace-nowrap">
                  Add Note
                </button>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No notes yet.</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
