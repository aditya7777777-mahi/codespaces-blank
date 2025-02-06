import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import NotesList from '../components/NotesList';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notePermissionError, setNotePermissionError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error fetching ticket';
      setFetchError(errorMessage);
      if (error.response?.status === 403) {
        // Redirect to tickets list if not authorized
        navigate('/tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError(null);
    setNotePermissionError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', newNote.trim());
      if (attachment) {
        if (attachment.size > 5000000) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }
        formData.append('attachment', attachment);
      }

      await api.post(`/tickets/${id}/notes`, formData);
      setNewNote('');
      setAttachment(null);
      fetchTicket();
    } catch (error) {
      if (error.response?.status === 403) {
        setNotePermissionError('You do not have permission to add notes to this ticket');
      } else {
        setError(error.response?.data?.message || error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      fetchTicket();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/tickets/${id}/notes/${noteId}`);
      fetchTicket();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = async (noteId, content) => {
    try {
      await api.patch(`/tickets/${id}/notes/${noteId}`, { content });
      fetchTicket();
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{fetchError}</p>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Ticket Not Found</h3>
          <p>The requested ticket could not be found.</p>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
            <p className="text-gray-600">Ticket ID: {ticket.ticketId}</p>
          </div>
          {(user.role === 'agent' || user.role === 'admin') && (
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border rounded p-2"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500">
            <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
            <div>Last Updated: {new Date(ticket.lastUpdated).toLocaleString()}</div>
          </div>
        </div>

        <NotesList
          notes={ticket.notes}
          onDelete={handleDeleteNote}
          onEdit={handleEditNote}
        />

        {notePermissionError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {notePermissionError}
          </div>
        )}

        {(user.role === 'admin' || user.role === 'agent' || 
          ticket.customer._id === user._id) && (
          <form onSubmit={handleAddNote} className="mt-6">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full border rounded p-2 mb-2"
              placeholder="Add a note..."
              rows="3"
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <div>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size > 5000000) {
                      setError('File size must be less than 5MB');
                      e.target.value = '';
                    } else {
                      setAttachment(file);
                      setError(null);
                    }
                  }}
                  className="text-sm"
                  disabled={isSubmitting}
                />
                <span className="text-xs text-gray-500 ml-2">Max size: 5MB</span>
              </div>
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
