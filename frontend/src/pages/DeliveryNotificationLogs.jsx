import { useState, useEffect } from 'react';
import { Mail, AlertTriangle, Clock, MapPin, User, CheckCircle, RotateCcw, Filter, Search, Activity, Play, Loader2 } from 'lucide-react';
import { getNotifications, getSystemStatus, resendNotification, resendAllNotifications, runDeliveryAgent } from '../services/deliveryTrackerService';

const DeliveryNotificationLogs = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [systemActive, setSystemActive] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);
  const [error, setError] = useState(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [agentResult, setAgentResult] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchSystemStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchSystemStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(24);
      setNotifications(data || []);
    } catch (err) {
      setError('Failed to load notifications from server.');
      console.error('Error:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const status = await getSystemStatus();
      setSystemActive(status?.systemActive ?? true);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setSystemActive(true); // Default to active
    }
  };

  const handleRunAgent = async () => {
    setRunningAgent(true);
    setAgentResult(null);
    try {
      const result = await runDeliveryAgent(24);
      setAgentResult({
        success: true,
        message: `Agent completed! Processed ${result.data?.totalProcessed || 0} orders, sent ${result.data?.successfulNotifications || 0} notifications.`,
      });
      // Refresh notifications after agent run
      await fetchNotifications();
    } catch (err) {
      console.error('Error running delivery agent:', err);
      setAgentResult({
        success: false,
        message: 'Failed to run delivery agent. Please try again.',
      });
    } finally {
      setRunningAgent(false);
      // Clear result message after 5 seconds
      setTimeout(() => setAgentResult(null), 5000);
    }
  };

  const getEmailStatusBadge = (status) => {
    const statusConfig = {
      delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Delivered' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Failed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  const getDelayStatusBadge = (delayHours) => {
    let color = 'text-yellow-700 bg-yellow-100';
    if (delayHours > 48) color = 'text-red-700 bg-red-100';
    if (delayHours < 12) color = 'text-orange-700 bg-orange-100';

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${color} text-sm font-medium`}>
        <AlertTriangle className="w-4 h-4" />
        {delayHours}h Delayed
      </div>
    );
  };

  const handleResendEmail = async (notificationId) => {
    setResendingId(notificationId);
    try {
      await resendNotification(notificationId);
      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                notificationAttempts: n.notificationAttempts + 1,
                lastAttempt: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (err) {
      console.error('Error resending notification:', err);
    } finally {
      setResendingId(null);
    }
  };

  const handleResendAll = async () => {
    setResendingId('all');
    try {
      await resendAllNotifications();
      // Update local state for all failed notifications
      setNotifications(
        notifications.map((n) =>
          n.emailStatus === 'failed'
            ? {
                ...n,
                notificationAttempts: n.notificationAttempts + 1,
                lastAttempt: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (err) {
      console.error('Error resending all notifications:', err);
    } finally {
      setResendingId(null);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || notif.emailStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  const formatDateOnly = (isoString) => {
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Delivery Tracker</h1>
            </div>
            <button
              onClick={handleRunAgent}
              disabled={runningAgent}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg ${
                runningAgent
                  ? 'bg-purple-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {runningAgent ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Agent...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Delivery Agent
                </>
              )}
            </button>
          </div>
          <p className="text-gray-600">Track automated delay notification emails sent to customers</p>
          
          {/* Agent Result Alert */}
          {agentResult && (
            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
              agentResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {agentResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`font-medium ${agentResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {agentResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">{error}</p>
              <p className="text-sm text-amber-700 mt-1">Displaying cached data if available.</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-xl border-2 bg-blue-50 text-blue-600 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
            <p className="text-sm text-blue-600 mt-1">Total Notifications</p>
          </div>

          <div className="p-5 rounded-xl border-2 bg-green-50 text-green-600 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.emailStatus === 'delivered').length}
            </p>
            <p className="text-sm text-green-600 mt-1">Delivered</p>
          </div>

          <div className="p-5 rounded-xl border-2 bg-red-50 text-red-600 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.emailStatus === 'failed').length}
            </p>
            <p className="text-sm text-red-600 mt-1">Failed</p>
          </div>

          <div className="p-5 rounded-xl border-2 bg-orange-50 text-orange-600 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round(notifications.reduce((sum, n) => sum + n.delayHours, 0) / notifications.length)}h
            </p>
            <p className="text-sm text-orange-600 mt-1">Avg Delay</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, email, company, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter and Resend All */}
            <div className="flex gap-2 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {['all', 'delivered', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  disabled
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${
                    systemActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  title="System Status"
                >
                  <Activity className="w-4 h-4" />
                  {systemActive ? 'System Active' : 'System Inactive'}
                </button>
                <button
                  onClick={handleResendAll}
                  disabled={resendingId === 'all' || notifications.filter((n) => n.emailStatus === 'failed').length === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    notifications.filter((n) => n.emailStatus === 'failed').length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : resendingId === 'all'
                      ? 'bg-orange-600 text-white animate-pulse'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  {resendingId === 'all' ? 'Resending All...' : 'Resend All'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Log Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Delay Info</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNotifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{notif.customerName}</p>
                      <p className="text-sm text-gray-600">{notif.customerEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.companyName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{notif.orderId}</p>
                      <p className="text-sm text-gray-600">{notif.productName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {getDelayStatusBadge(notif.delayHours)}
                      <p className="text-xs text-gray-600 mt-2">{notif.delayReason}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {getEmailStatusBadge(notif.emailStatus)}
                      <p className="text-xs text-gray-500">Sent: {formatDateTime(notif.emailSentAt)}</p>
                      <p className="text-xs text-gray-500">Attempts: {notif.notificationAttempts}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleResendEmail(notif.id)}
                      disabled={resendingId === notif.id || notif.emailStatus === 'delivered'}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                        notif.emailStatus === 'delivered'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : resendingId === notif.id
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {resendingId === notif.id ? 'Resending...' : 'Resend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notification Cards - Mobile */}
        <div className="lg:hidden grid grid-cols-1 gap-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => setSelectedNotification(selectedNotification?.id === notif.id ? null : notif)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notif.customerName}</h3>
                    <p className="text-sm text-gray-600">{notif.customerEmail}</p>
                  </div>
                  {getEmailStatusBadge(notif.emailStatus)}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {getDelayStatusBadge(notif.delayHours)}
                </div>
                <p className="text-xs text-gray-500">{notif.orderId} • {notif.productName}</p>
              </div>

              {selectedNotification?.id === notif.id && (
                <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Delay Reason</p>
                    <p className="text-sm text-gray-900">{notif.delayReason}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Email Sent</p>
                      <p className="text-sm text-gray-900">{formatDateTime(notif.emailSentAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Attempts</p>
                      <p className="text-sm text-gray-900">{notif.notificationAttempts}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResendEmail(notif.id)}
                    disabled={resendingId === notif.id || notif.emailStatus === 'delivered'}
                    className={`w-full py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      notif.emailStatus === 'delivered'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : resendingId === notif.id
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {resendingId === notif.id ? 'Resending...' : 'Resend Email'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryNotificationLogs;
