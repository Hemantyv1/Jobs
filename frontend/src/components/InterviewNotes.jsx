import { useState, useEffect } from 'react';
import { api } from '../api';

export default function InterviewNotes({
  applicationId,
  onClose,
  onEdit,
}) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: new Date().toISOString().split('T')[0],
    round_type: 'phone',
    interviewer_name: '',
    questions_asked: '',
    my_answers: '',
    outcome: 'pending',
    notes: '',
  });
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    skill_type: 'required',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      const data = await api.getApplication(applicationId);
      setApp(data);
    } catch (error) {
      console.error('Failed to load application:', error);
      alert('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addInterview({
        application_id: applicationId,
        ...interviewForm,
      });
      setShowInterviewForm(false);
      setInterviewForm({
        interview_date: new Date().toISOString().split('T')[0],
        round_type: 'phone',
        interviewer_name: '',
        questions_asked: '',
        my_answers: '',
        outcome: 'pending',
        notes: '',
      });
      loadApplication();
    } catch (error) {
      console.error('Failed to add interview:', error);
      alert('Failed to add interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_name.trim()) return;
    setSubmitting(true);
    try {
      await api.addSkill({
        application_id: applicationId,
        ...skillForm,
      });
      setShowSkillForm(false);
      setSkillForm({ skill_name: '', skill_type: 'required' });
      loadApplication();
    } catch (error) {
      console.error('Failed to add skill:', error);
      alert('Failed to add skill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !app) {
    return <div className="text-center py-8 text-gray-900 dark:text-zinc-100">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {app.company_name} – {app.position_title}
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
              Applied {new Date(app.date_applied).toLocaleDateString()}
              {app.location && ` · ${app.location}`}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                {
                  applied: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                  phone_screen: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
                  technical: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
                  onsite: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
                  offer: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                  rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
                }[app.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {app.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
                className="px-4 py-2 bg-zinc-700 dark:bg-zinc-700 text-white rounded hover:bg-zinc-600 dark:hover:bg-zinc-600 text-sm"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-300 dark:hover:bg-zinc-700 text-sm"
            >
              Back
            </button>
          </div>
        </div>

        {app.job_url && (
          <a
            href={app.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Job posting →
          </a>
        )}
        {app.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Notes</p>
            <p className="text-gray-600 dark:text-zinc-300 text-sm mt-1 whitespace-pre-wrap">
              {app.notes}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview notes</h3>
          <button
            onClick={() => setShowInterviewForm(!showInterviewForm)}
            className="px-3 py-1 bg-zinc-700 dark:bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600 dark:hover:bg-zinc-600"
          >
            {showInterviewForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showInterviewForm && (
          <form
            onSubmit={handleAddInterview}
            className="mb-6 p-4 border border-gray-200 dark:border-zinc-700 rounded space-y-3 bg-gray-50 dark:bg-zinc-800"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={interviewForm.interview_date}
                  onChange={(e) =>
                    setInterviewForm((p) => ({
                      ...p,
                      interview_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Round
                </label>
                <select
                  value={interviewForm.round_type}
                  onChange={(e) =>
                    setInterviewForm((p) => ({
                      ...p,
                      round_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                >
                  <option value="phone">Phone</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interviewer
              </label>
              <input
                type="text"
                value={interviewForm.interviewer_name}
                onChange={(e) =>
                  setInterviewForm((p) => ({
                    ...p,
                    interviewer_name: e.target.value,
                  }))
                }
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Questions asked
              </label>
              <textarea
                value={interviewForm.questions_asked}
                onChange={(e) =>
                  setInterviewForm((p) => ({
                    ...p,
                    questions_asked: e.target.value,
                  }))
                }
                rows={3}
                placeholder="What did they ask?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                My answers
              </label>
              <textarea
                value={interviewForm.my_answers}
                onChange={(e) =>
                  setInterviewForm((p) => ({
                    ...p,
                    my_answers: e.target.value,
                  }))
                }
                rows={3}
                placeholder="What I said..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={interviewForm.outcome}
                onChange={(e) =>
                  setInterviewForm((p) => ({ ...p, outcome: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {app.interviews?.length === 0 && !showInterviewForm && (
            <p className="text-gray-500 dark:text-zinc-400 text-sm">No interview notes yet.</p>
          )}
          {app.interviews?.map((i) => (
            <div
              key={i.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-zinc-100">
                  {i.round_type} ·{' '}
                  {i.interview_date
                    ? new Date(i.interview_date).toLocaleDateString()
                    : '—'}
                </span>
                <span className="text-gray-500 dark:text-zinc-400">{i.outcome || 'pending'}</span>
              </div>
              {i.interviewer_name && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Interviewer: {i.interviewer_name}
                </p>
              )}
              {i.questions_asked && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    Questions asked
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {i.questions_asked}
                  </p>
                </div>
              )}
              {i.my_answers && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                    My answers
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{i.my_answers}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Skills required</h3>
          <button
            onClick={() => setShowSkillForm(!showSkillForm)}
            className="px-3 py-1 bg-zinc-700 dark:bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600 dark:hover:bg-zinc-600"
          >
            {showSkillForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showSkillForm && (
          <form
            onSubmit={handleAddSkill}
            className="mb-4 flex gap-2 flex-wrap"
          >
            <input
              type="text"
              value={skillForm.skill_name}
              onChange={(e) =>
                setSkillForm((p) => ({ ...p, skill_name: e.target.value }))
              }
              placeholder="e.g. Python, AWS, Terraform"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm flex-1 min-w-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={skillForm.skill_type}
              onChange={(e) =>
                setSkillForm((p) => ({ ...p, skill_type: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
            >
              <option value="required">Required</option>
              <option value="preferred">Preferred</option>
              <option value="nice-to-have">Nice to have</option>
            </select>
            <button
              type="submit"
              disabled={submitting || !skillForm.skill_name.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
            >
              Add
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {app.skills?.length === 0 && !showSkillForm && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet.</p>
          )}
          {app.skills?.map((s) => (
            <span
              key={s.id}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm"
            >
              {s.skill_name}
              {s.skill_type && (
                <span className="text-purple-600 dark:text-purple-300 ml-1 text-xs">
                  ({s.skill_type})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
