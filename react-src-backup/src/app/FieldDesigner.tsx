import { useState } from 'react';
import { Library, CustomField, ValidationRule } from './types';
import { FIELD_ICONS, LIBRARY_ICONS, FieldIconKey, LibraryIconKey } from './FieldDesignerIcons';

// Cedar green color palette
const COLORS = {
  primary: '#2D6F5F',
  primaryHover: '#245A4D',
  primaryLight: '#E8F3F0',
  border: '#3B7A5D'
};

interface ProfileConfig {
  name: string;
  iconColor: string;
  showFieldDesigner: boolean;
}

interface FieldDesignerProps {
  libraries: Library[];
  customFields: CustomField[];
  onLibrariesChange: (libraries: Library[]) => void;
  onCustomFieldsChange: (fields: CustomField[]) => void;
  onBackToBuilder: () => void;
  currentProfile: string;
  profileConfig: ProfileConfig;
}

const BASE_FIELD_TYPES = [
  { value: 'text', label: 'Text', iconKey: 'text' as FieldIconKey },
  { value: 'paragraph', label: 'Paragraph', iconKey: 'paragraph' as FieldIconKey },
  { value: 'number', label: 'Number', iconKey: 'number' as FieldIconKey },
  { value: 'email', label: 'Email', iconKey: 'email' as FieldIconKey },
  { value: 'date', label: 'Date', iconKey: 'date' as FieldIconKey },
  { value: 'time', label: 'Time', iconKey: 'time' as FieldIconKey },
  { value: 'link', label: 'Link', iconKey: 'link' as FieldIconKey },
  { value: 'phone', label: 'Phone', iconKey: 'phone' as FieldIconKey },
];

const VALIDATION_TYPES = [
  { value: 'regex', label: 'Regex Pattern' },
  { value: 'minLength', label: 'Minimum Length' },
  { value: 'maxLength', label: 'Maximum Length' },
  { value: 'range', label: 'Number Range' },
  { value: 'custom', label: 'Custom Validation' },
];

const FIELD_ICON_OPTIONS: FieldIconKey[] = ['text', 'paragraph', 'email', 'phone', 'link', 'date', 'time', 'number', 'building', 'id', 'globe', 'briefcase', 'location', 'image'];

const LIBRARY_ICON_OPTIONS: LibraryIconKey[] = ['library', 'target', 'settings', 'beaker', 'palette', 'box', 'star', 'folder'];

export function FieldDesigner({ libraries, customFields, onLibrariesChange, onCustomFieldsChange, onBackToBuilder, currentProfile, profileConfig }: FieldDesignerProps) {
  const [activeTab, setActiveTab] = useState<'custom' | 'libraries'>('libraries');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  
  // Form state for custom fields
  const [fieldName, setFieldName] = useState('');
  const [baseType, setBaseType] = useState('text');
  const [description, setDescription] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState(0);

  // Form state for libraries
  const [libraryName, setLibraryName] = useState('');
  const [libraryDescription, setLibraryDescription] = useState('');

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      id: Date.now(),
      type: 'regex',
      pattern: '',
      errorMessage: ''
    };
    setValidationRules([...validationRules, newRule]);
  };

  const updateValidationRule = (id: number, field: keyof ValidationRule, value: string) => {
    setValidationRules(validationRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const deleteValidationRule = (id: number) => {
    setValidationRules(validationRules.filter(rule => rule.id !== id));
  };

  const handleCreateField = () => {
    if (!fieldName.trim()) return;
    
    const newField: CustomField = {
      id: Date.now(),
      name: fieldName,
      icon: 'text' as FieldIconKey,
      baseType,
      libraryId: selectedLibraryId,
      description,
      placeholder,
      validationRules
    };
    
    onCustomFieldsChange([...customFields, newField]);
    resetForm();
  };

  const resetForm = () => {
    setFieldName('');
    setBaseType('text');
    setDescription('');
    setPlaceholder('');
    setValidationRules([]);
    setShowCreateForm(false);
    setSelectedLibraryId(0);
  };

  const handleCreateLibrary = () => {
    if (!libraryName.trim()) return;
    
    const newLibrary: Library = {
      id: Date.now(),
      name: libraryName,
      description: libraryDescription,
      icon: 'library' as LibraryIconKey
    };
    
    onLibrariesChange([...libraries, newLibrary]);
    resetLibraryForm();
  };

  const resetLibraryForm = () => {
    setLibraryName('');
    setLibraryDescription('');
    setShowCreateLibrary(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <div>
              <h1 className="text-lg font-medium text-gray-900">Field Designer</h1>
              <p className="text-xs text-gray-500">Create custom field types and organize them into libraries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">{profileConfig.name}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: profileConfig.iconColor }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back to Template Builder Button */}
        <button
          onClick={onBackToBuilder}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Template Builder</span>
        </button>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium transition-colors relative ${
                activeTab === 'custom' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              Custom Fields
              {activeTab === 'custom' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.primary }} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('libraries')}
              className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium transition-colors relative ${
                activeTab === 'libraries' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              Libraries
              {activeTab === 'libraries' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.primary }} />
              )}
            </button>
          </div>
        </div>

        {/* Custom Fields Tab */}
        {activeTab === 'custom' && (
          <div>
            {/* Create New Field Button */}
            {!showCreateForm && (
              <button
                onClick={() => libraries.length > 0 && setShowCreateForm(true)}
                disabled={libraries.length === 0}
                className={`w-full mb-6 px-6 py-4 bg-white rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
                    libraries.length === 0 
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">
                  {libraries.length === 0 
                    ? 'Create a library first to add custom fields' 
                    : 'Create New Custom Field Type'}
                </span>
              </button>
            )}

            {/* Create Custom Field Form */}
            {showCreateForm && (
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">Create Custom Field Type</h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Field Type Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      placeholder="e.g., Phone Number, ZIP Code, URL..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm"
                      style={{ 
                        focusRingColor: COLORS.primary
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>

                  {/* Base Field Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Field Type</label>
                    <select
                      value={baseType}
                      onChange={(e) => setBaseType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm bg-white"
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      {BASE_FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assign to Libraries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign to Library <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      {libraries.length === 0 
                        ? 'Please create a library first in the Libraries tab' 
                        : 'Select which library this custom field belongs to'}
                    </p>
                    <select
                      value={selectedLibraryId}
                      onChange={(e) => setSelectedLibraryId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#111827'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                      disabled={libraries.length === 0}
                    >
                      <option value={0} style={{ backgroundColor: '#ffffff', color: '#111827' }}>-- Select a library --</option>
                      {libraries.map((lib) => (
                        <option key={lib.id} value={lib.id} style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                          {lib.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this field type is for..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm resize-none"
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>

                  {/* Default Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Placeholder <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={placeholder}
                      onChange={(e) => setPlaceholder(e.target.value)}
                      placeholder="e.g., Enter your phone number..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm"
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>

                  {/* Validation Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Validation Rules</label>
                      <button
                        onClick={addValidationRule}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all flex items-center gap-1.5"
                        style={{ backgroundColor: COLORS.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Rule
                      </button>
                    </div>

                    {validationRules.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">No validation rules yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Rule" to create validation rules</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {validationRules.map((rule) => (
                        <div key={rule.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <select
                              value={rule.type}
                              onChange={(e) => updateValidationRule(rule.id, 'type', e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg outline-none text-sm bg-white"
                              onFocus={(e) => {
                                e.target.style.borderColor = COLORS.primary;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                              }}
                            >
                              {VALIDATION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteValidationRule(rule.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {rule.type === 'regex' && (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Pattern</label>
                                <input
                                  type="text"
                                  value={rule.pattern}
                                  onChange={(e) => updateValidationRule(rule.id, 'pattern', e.target.value)}
                                  placeholder="e.g., ^[0-9]{5}$"
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none bg-white"
                                  onFocus={(e) => {
                                    e.target.style.borderColor = COLORS.primary;
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter a JavaScript regex pattern</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Error Message</label>
                                <input
                                  type="text"
                                  value={rule.errorMessage}
                                  onChange={(e) => updateValidationRule(rule.id, 'errorMessage', e.target.value)}
                                  placeholder="e.g., Please enter a valid ZIP code"
                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs outline-none bg-white"
                                  onFocus={(e) => {
                                    e.target.style.borderColor = COLORS.primary;
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateField}
                      disabled={!fieldName.trim() || selectedLibraryId === 0}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: COLORS.primary }}
                      onMouseEnter={(e) => (!fieldName.trim() || selectedLibraryId === 0) ? null : e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                      onMouseLeave={(e) => (!fieldName.trim() || selectedLibraryId === 0) ? null : e.currentTarget.style.backgroundColor = COLORS.primary}
                    >
                      Create Field Type
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Field Types ({customFields.length})</h3>
                {customFields.map((field) => (
                  <div key={field.id} className="bg-white rounded-lg border border-gray-300 p-4 hover:border-gray-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{FIELD_ICONS[field.icon]}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{field.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">Base: {BASE_FIELD_TYPES.find(t => t.value === field.baseType)?.label}</p>
                          {field.description && (
                            <p className="text-sm text-gray-600 mt-2">{field.description}</p>
                          )}
                          {field.validationRules.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {field.validationRules.length} validation rule{field.validationRules.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Libraries Tab */}
        {activeTab === 'libraries' && (
          <div>
            {/* Create New Library Button */}
            {!showCreateLibrary && (
              <button
                onClick={() => setShowCreateLibrary(true)}
                className="w-full mb-6 px-6 py-4 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Create New Library</span>
              </button>
            )}

            {/* Create Library Form */}
            {showCreateLibrary && (
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">Create Library</h2>
                  <button
                    onClick={resetLibraryForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Library Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Library Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={libraryName}
                      onChange={(e) => setLibraryName(e.target.value)}
                      placeholder="e.g., Contact Information, Product Details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm"
                      style={{ 
                        focusRingColor: COLORS.primary
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      value={libraryDescription}
                      onChange={(e) => setLibraryDescription(e.target.value)}
                      placeholder="Describe what this library is for..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm resize-none"
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={resetLibraryForm}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateLibrary}
                      disabled={!libraryName.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: COLORS.primary }}
                      onMouseEnter={(e) => !libraryName.trim() ? null : e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                      onMouseLeave={(e) => !libraryName.trim() ? null : e.currentTarget.style.backgroundColor = COLORS.primary}
                    >
                      Create Library
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Libraries */}
            {libraries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Libraries ({libraries.length})</h3>
                {libraries.map((lib) => (
                  <div key={lib.id} className="bg-white rounded-lg border border-gray-300 p-4 hover:border-gray-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{lib.name}</h4>
                        {lib.description && (
                          <p className="text-sm text-gray-600 mt-1">{lib.description}</p>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}