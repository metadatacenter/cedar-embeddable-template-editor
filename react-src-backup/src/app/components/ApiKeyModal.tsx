import { useState } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function ApiKeyModal({ isOpen, onClose, apiKey, onApiKeyChange, COLORS }: ApiKeyModalProps) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onApiKeyChange(localKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleCancel = () => {
    setLocalKey(apiKey);
    setShowKey(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primaryLight }}>
              <Key className="w-5 h-5" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">BioPortal API Key</h2>
              <p className="text-sm text-gray-600">Configure your CEDAR terminology service credentials</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <div className="space-y-5">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <div className="font-semibold mb-1">About the API Key</div>
                  <p className="mb-2">
                    This API key is used to authenticate requests to the CEDAR terminology service which queries BioPortal.
                  </p>
                  <p className="text-xs">
                    Endpoint: <code className="bg-blue-100 px-1.5 py-0.5 rounded">https://terminology.metadatacenter.org/bioportal/search</code>
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="Enter your BioPortal API key"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm font-mono"
                  style={{
                    focusRing: `2px solid ${COLORS.primary}33`
                  }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your API key is stored locally in your browser and is never sent to any server except BioPortal.
              </p>
            </div>

            {/* How to Get API Key */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">How to get your API key:</div>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-gray-900 flex-shrink-0">1.</span>
                  <span>
                    Visit{' '}
                    <a 
                      href="https://bioportal.bioontology.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                      style={{ color: COLORS.primary }}
                    >
                      BioPortal
                    </a>
                    {' '}and create an account (or sign in)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-gray-900 flex-shrink-0">2.</span>
                  <span>Navigate to your Account settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-gray-900 flex-shrink-0">3.</span>
                  <span>Copy your API key from the account page</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-gray-900 flex-shrink-0">4.</span>
                  <span>Paste it into the field above</span>
                </li>
              </ol>
            </div>

            {/* Current Status */}
            {apiKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">API key is configured</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Controlled term fields will now be able to search BioPortal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2"
            style={{
              backgroundColor: isSaved ? '#10B981' : COLORS.primary,
              cursor: isSaved ? 'default' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSaved) e.currentTarget.style.backgroundColor = COLORS.primaryHover;
            }}
            onMouseLeave={(e) => {
              if (!isSaved) e.currentTarget.style.backgroundColor = COLORS.primary;
            }}
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save API Key'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
