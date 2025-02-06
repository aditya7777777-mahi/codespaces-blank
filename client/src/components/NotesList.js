import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NotesList = ({ notes, onDelete, onEdit }) => {
  const { user } = useAuth();
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (note) => {
    setEditingNote(note._id);
    setEditContent(note.content);
  };

  const handleSave = async (noteId) => {
    await onEdit(noteId, editContent);
    setEditingNote(null);
    setEditContent('');
  };

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note._id} 
             className={`bg-white p-4 rounded-lg shadow ${
               note.addedBy?.role === 'agent' || note.addedBy?.role === 'admin' 
               ? 'border-l-4 border-blue-500' 
               : 'border-l-4 border-gray-300'
             }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium">{note.addedBy?.name}</span>
              <span className={`text-sm ml-2 px-2 py-0.5 rounded-full ${
                note.addedBy?.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                note.addedBy?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {note.addedBy?.role}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
              {note.editedAt && ' (edited)'}
            </div>
          </div>

          {editingNote === note._id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border rounded p-2"
                rows="3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(note._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              
              {note.attachment && (
                <a
                  href={`/uploads/${note.attachment.filename}`}
                  className="text-blue-600 hover:underline mt-2 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 {note.attachment.filename}
                </a>
              )}

              {(user.role === 'admin' || user.role === 'agent' || 
                user._id === note.addedBy?._id) && (
                <div className="absolute top-0 right-0 hidden group-hover:flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <button
                      onClick={() => onDelete(note._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotesList;
