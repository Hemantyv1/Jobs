import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import InterviewNotes from './components/InterviewNotes';
import { api } from './api';

export default function App() {
  const [view, setView] = useState('list');
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    // Check authentication on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to fetch applications - if 401, will prompt for password
      await api.getApplications();
      setAuthenticated(true);
    } catch (error) {
      // If auth fails, user will be prompted by api.js
      // Wait a moment for the prompt to appear, then check again
      setTimeout(async () => {
        try {
          await api.getApplications();
          setAuthenticated(true);
        } catch (e) {
          // Still failed - user cancelled or wrong password
          setAuthenticated(false);
        } finally {
          setCheckingAuth(false);
        }
      }, 100);
      return;
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setViewingApp(null);
    setView('form');
  };

  const handleView = (app) => {
    setViewingApp(app);
    setEditingApp(null);
    setView('detail');
  };

  const handleFormClose = () => {
    setEditingApp(null);
    setView('list');
  };

  const handleDetailClose = () => {
    setViewingApp(null);
    setView('list');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-gray-900 dark:text-zinc-100">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <nav className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Jobs</h1>
            <div className="space-x-4">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded ${view === 'dashboard' ? 'bg-zinc-700 dark:bg-zinc-700 text-white' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setEditingApp(null);
                  setViewingApp(null);
                  setView('form');
                }}
                className="px-4 py-2 bg-zinc-700 dark:bg-zinc-700 text-white rounded hover:bg-zinc-600 dark:hover:bg-zinc-600"
              >
                + New Application
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/logout`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    window.location.reload();
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                title="Logout to test authentication"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && <Dashboard />}
        {view === 'list' && (
          <ApplicationList onEdit={handleEdit} onView={handleView} />
        )}
        {view === 'form' && (
          <ApplicationForm application={editingApp} onClose={handleFormClose} />
        )}
        {view === 'detail' && viewingApp && (
          <InterviewNotes
            applicationId={viewingApp.id}
            onClose={handleDetailClose}
            onEdit={() => handleEdit(viewingApp)}
          />
        )}
      </main>
    </div>
  );
}
