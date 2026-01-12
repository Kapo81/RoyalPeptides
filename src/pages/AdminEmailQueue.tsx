import { useEffect, useState } from 'react';
import { Mail, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface EmailQueueItem {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  html_body: string;
  order_id: string | null;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  attempts: number;
  last_attempt_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminEmailQueue() {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [retrying, setRetrying] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    console.log('[AdminEmailQueue] Mounted');
    fetchEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, statusFilter]);

  const fetchEmails = async () => {
    console.log('[AdminEmailQueue] Fetching email queue...');
    setLoading(true);

    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminEmailQueue] FETCH FAILED:', error);
      setToastMessage(`Failed to fetch emails: ${error.message}`);
    } else if (data) {
      console.log(`[AdminEmailQueue] Successfully fetched ${data.length} emails`);
      setEmails(data);
    } else {
      console.warn('[AdminEmailQueue] No data returned');
      setEmails([]);
    }

    setLoading(false);
  };

  const filterEmails = () => {
    let filtered = [...emails];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((email) => email.status === statusFilter);
    }

    setFilteredEmails(filtered);
  };

  const handleRetry = async (email: EmailQueueItem) => {
    console.log('[AdminEmailQueue] Retrying email:', email.id);
    setRetrying(email.id);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: email.order_id,
          email_id: email.id
        }),
      });

      const result = await response.json();

      if (response.ok && result.email_sent) {
        console.log('[AdminEmailQueue] Retry successful');
        setToastMessage('Email sent successfully!');
        await fetchEmails();
      } else {
        console.error('[AdminEmailQueue] Retry failed:', result);
        setToastMessage(`Retry failed: ${result.error || 'Unknown error'}`);
        await fetchEmails();
      }
    } catch (error: any) {
      console.error('[AdminEmailQueue] Retry error:', error);
      setToastMessage(`Retry failed: ${error.message}`);
    } finally {
      setRetrying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      sent: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    };

    const style = styles[status] || styles.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${style.bg} ${style.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      order_confirmation: 'Order Confirmation',
      tracking_notification: 'Tracking Update',
    };
    return labels[type] || type;
  };

  const getStats = () => {
    return {
      total: emails.length,
      sent: emails.filter(e => e.status === 'sent').length,
      failed: emails.filter(e => e.status === 'failed').length,
      pending: emails.filter(e => e.status === 'pending').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading email queue...</div>;
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Queue</h1>
        <p className="text-gray-500 mt-2">Monitor and retry failed email notifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            onClick={fetchEmails}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {getEmailTypeLabel(email.email_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{email.recipient_email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{email.subject}</div>
                      {email.error_message && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="truncate">{email.error_message}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(email.status)}
                    {email.attempts > 1 && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({email.attempts} attempts)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(email.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(email.status === 'failed' || email.status === 'pending') && email.order_id && (
                      <button
                        onClick={() => handleRetry(email)}
                        disabled={retrying === email.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {retrying === email.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Retry
                          </>
                        )}
                      </button>
                    )}
                    {email.status === 'sent' && (
                      <span className="text-xs text-green-600">
                        Sent {email.sent_at && new Date(email.sent_at).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No emails found matching your filters</p>
            {statusFilter === 'failed' && (
              <p className="text-sm mt-2">All emails sent successfully!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
