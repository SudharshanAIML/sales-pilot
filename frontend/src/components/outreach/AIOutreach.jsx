import { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Trash2,
  Users,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  Filter,
} from 'lucide-react';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getRAGStatus,
  getContactsByThreshold,
  generateEmails,
  sendEmails,
} from '../../services/outreachService';

const STATUS_OPTIONS = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'MQL', label: 'MQL' },
  { value: 'SQL', label: 'SQL' },
  { value: 'OPPORTUNITY', label: 'Opportunity' },
  { value: 'CUSTOMER', label: 'Customer' },
];

const AIOutreach = () => {
  // State
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // RAG State
  const [ragStatus, setRagStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Filter State
  const [fromStatus, setFromStatus] = useState('LEAD');
  const [toStatus, setToStatus] = useState('MQL');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Email Generation State
  const [employeeIntent, setEmployeeIntent] = useState('');
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [previewEmail, setPreviewEmail] = useState(null);

  // Sending State
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  // Load RAG status on mount
  useEffect(() => {
    loadRAGStatus();
  }, []);

  const loadRAGStatus = async () => {
    try {
      const status = await getRAGStatus();
      setRagStatus(status);
    } catch (err) {
      console.error('Failed to load RAG status:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await uploadDocument(file);
      setSuccess('Document uploaded successfully!');
      await loadRAGStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return;

    try {
      await deleteDocument(docId);
      await loadRAGStatus();
      setSuccess('Document deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getContactsByThreshold(fromStatus, toStatus);
      setContacts(result.contacts || []);
      setSelectedContacts([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.contact_id));
    }
  };

  const handleGenerateEmails = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }
    if (!employeeIntent.trim()) {
      setError('Please enter your intent/instructions');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await generateEmails({
        contactIds: selectedContacts,
        employeeIntent,
        fromStatus,
        toStatus,
      });
      setGeneratedEmails(result.results || []);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    const emailsToSend = generatedEmails
      .filter((e) => e.success)
      .map((e) => ({
        contactId: e.contactId,
        to: e.contactEmail,
        subject: e.email.subject,
        body: e.email.body,
        htmlBody: e.email.htmlBody,
      }));

    if (emailsToSend.length === 0) {
      setError('No valid emails to send');
      return;
    }

    try {
      setSending(true);
      setError(null);
      const result = await sendEmails(emailsToSend);
      setSendResults(result);
      setSuccess(`Sent ${result.summary.sent} of ${result.summary.total} emails`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const resetFlow = () => {
    setActiveStep(1);
    setContacts([]);
    setSelectedContacts([]);
    setEmployeeIntent('');
    setGeneratedEmails([]);
    setSendResults(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI Outreach</h2>
            <p className="text-sm text-gray-500">Generate personalized emails using AI</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Steps Indicator */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => step < activeStep && setActiveStep(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  activeStep >= step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step}
              </button>
              {step < 3 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              )}
            </div>
          ))}
          <span className="ml-3 text-sm text-gray-600">
            {activeStep === 1 && 'Setup & Select Contacts'}
            {activeStep === 2 && 'Write Intent & Generate'}
            {activeStep === 3 && 'Review & Send'}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Setup & Select Contacts */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* RAG Documents Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Company Documents (RAG)
                </h3>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload
                  </span>
                </label>
              </div>

              {ragStatus?.documents?.length > 0 ? (
                <div className="space-y-2">
                  {ragStatus.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{doc.filename}</span>
                        <span className="text-xs text-gray-400">
                          ({doc.chunksCount} chunks)
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Upload company documents (PDF, DOCX, TXT) to enable AI-powered personalization.
                </p>
              )}
            </div>

            {/* Status Threshold Filter */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                Status Threshold
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">From Status</label>
                  <select
                    value={fromStatus}
                    onChange={(e) => setFromStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.slice(0, -1).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 mt-5" />
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To Status</label>
                  <select
                    value={toStatus}
                    onChange={(e) => setToStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.slice(1).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={loadContacts}
                  disabled={loading}
                  className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Load
                </button>
              </div>
            </div>

            {/* Contacts List */}
            {contacts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contacts ({contacts.length})
                  </h3>
                  <button
                    onClick={selectAllContacts}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {contacts.map((contact) => (
                    <label
                      key={contact.contact_id}
                      className={`flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer transition-colors ${
                        selectedContacts.includes(contact.contact_id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contact_id)}
                        onChange={() => toggleContactSelection(contact.contact_id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            contact.temperature === 'HOT'
                              ? 'bg-red-100 text-red-700'
                              : contact.temperature === 'WARM'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {contact.temperature}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Next Button */}
            {selectedContacts.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Next: Write Intent
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Write Intent & Generate */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Your Intent / Instructions</h3>
              <p className="text-sm text-gray-500 mb-3">
                Describe what you want to communicate. The AI will use this along with company
                documents to generate personalized emails.
              </p>
              <textarea
                value={employeeIntent}
                onChange={(e) => setEmployeeIntent(e.target.value)}
                placeholder="e.g., I want to introduce our new product features and schedule a demo call. Focus on how we can help them improve their workflow efficiency..."
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-indigo-800 mb-2">Summary</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• {selectedContacts.length} contacts selected</li>
                <li>• Status transition: {fromStatus} → {toStatus}</li>
                <li>• {ragStatus?.documentsCount || 0} company documents loaded</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerateEmails}
                disabled={loading || !employeeIntent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Emails
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Send */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Generated Emails</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedEmails.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-white border-gray-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm text-gray-800">
                          {result.contactName}
                        </span>
                        <span className="text-xs text-gray-500">{result.contactEmail}</span>
                      </div>
                      {result.success && (
                        <button
                          onClick={() => setPreviewEmail(result)}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      )}
                    </div>
                    {result.success ? (
                      <p className="text-sm text-gray-600 truncate">
                        Subject: {result.email.subject}
                      </p>
                    ) : (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {sendResults && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Send Results</h4>
                <p className="text-sm text-green-700">
                  Successfully sent {sendResults.summary.sent} of {sendResults.summary.total} emails
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={resetFlow}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Start Over
              </button>
              {!sendResults && (
                <button
                  onClick={handleSendEmails}
                  disabled={sending || generatedEmails.filter((e) => e.success).length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send All Emails
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Email Preview</h3>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <p className="text-sm text-gray-500">To:</p>
                <p className="text-gray-800">{previewEmail.contactEmail}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Subject:</p>
                <p className="font-medium text-gray-800">{previewEmail.email.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Body:</p>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                  {previewEmail.email.body}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOutreach;
