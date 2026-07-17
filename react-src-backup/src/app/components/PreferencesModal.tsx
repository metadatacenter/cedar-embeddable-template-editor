import { X } from 'lucide-react';
import { PresetDefinitions } from './PresetDefinitionsModal';

export interface UserPreferences {
  showRequired: boolean;
  showAllowMultiple: boolean;
  showHelpText: boolean;
  showDefaultValue: boolean;
  showFieldDesigner: boolean;
  showElements: boolean;
  fieldSelectionStyle: 'modal' | 'sidebar';
  visibleFieldTypes: Record<string, boolean>;
}

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  presetDefinitions: PresetDefinitions;
  fieldTypes: Record<string, { icon: JSX.Element; label: string; preview: string }>;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function PreferencesModal({ 
  isOpen, 
  onClose, 
  preferences, 
  onPreferencesChange,
  presetDefinitions,
  fieldTypes,
  COLORS
}: PreferencesModalProps) {
  if (!isOpen) return null;

  const updatePreference = (key: keyof UserPreferences, value: boolean) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const updateFieldTypeVisibility = (fieldType: string, visible: boolean) => {
    onPreferencesChange({
      ...preferences,
      visibleFieldTypes: {
        ...preferences.visibleFieldTypes,
        [fieldType]: visible
      }
    });
  };

  const toggleAllFieldTypes = (visible: boolean) => {
    const updatedVisibility: Record<string, boolean> = {};
    Object.keys(fieldTypes).forEach(key => {
      updatedVisibility[key] = visible;
    });
    onPreferencesChange({
      ...preferences,
      visibleFieldTypes: updatedVisibility
    });
  };

  const applyPreset = (preset: 'basic' | 'semantic' | 'modular') => {
    const definition = presetDefinitions[preset];
    
    // Build visible field types based on preset definition
    const visibleFieldTypes = Object.keys(fieldTypes).reduce((acc, key) => {
      acc[key] = !definition.hiddenFieldTypes.includes(key);
      return acc;
    }, {} as Record<string, boolean>);

    onPreferencesChange({
      showRequired: definition.showRequired,
      showAllowMultiple: definition.showAllowMultiple,
      showHelpText: definition.showHelpText,
      showDefaultValue: definition.showDefaultValue,
      showFieldDesigner: definition.showFieldDesigner,
      showElements: definition.showElements,
      fieldSelectionStyle: preferences.fieldSelectionStyle, // Preserve current selection style
      visibleFieldTypes
    });
  };

  // Detect which preset is currently active
  const getActivePreset = (): 'basic' | 'semantic' | 'modular' | null => {
    const presets: Array<'basic' | 'semantic' | 'modular'> = ['basic', 'semantic', 'modular'];
    
    for (const preset of presets) {
      const definition = presetDefinitions[preset];
      
      // Check if all configuration options match
      if (preferences.showRequired === definition.showRequired &&
          preferences.showAllowMultiple === definition.showAllowMultiple &&
          preferences.showHelpText === definition.showHelpText &&
          preferences.showDefaultValue === definition.showDefaultValue &&
          preferences.showFieldDesigner === definition.showFieldDesigner &&
          preferences.showElements === definition.showElements) {
        
        // Check if field types match
        const fieldTypesMatch = Object.keys(fieldTypes).every(key => {
          const shouldBeVisible = !definition.hiddenFieldTypes.includes(key);
          return preferences.visibleFieldTypes[key] === shouldBeVisible;
        });
        
        if (fieldTypesMatch) {
          return preset;
        }
      }
    }

    return null;
  };

  const activePreset = getActivePreset();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 animate-backdrop-fade-in"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-modal-fade-in"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <svg className="w-5 h-5" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          <div className="p-6 space-y-6">
            {/* Preset Configurations */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Preset Configurations
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => applyPreset('basic')}
                  className="px-3 py-2 text-sm font-medium rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activePreset === 'basic' ? COLORS.primary : '#f3f4f6',
                    color: activePreset === 'basic' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (activePreset !== 'basic') {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activePreset === 'basic' ? COLORS.primary : '#f3f4f6';
                  }}
                >
                  Basic
                </button>
                <button
                  onClick={() => applyPreset('semantic')}
                  className="px-3 py-2 text-sm font-medium rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activePreset === 'semantic' ? COLORS.primary : '#f3f4f6',
                    color: activePreset === 'semantic' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (activePreset !== 'semantic') {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activePreset === 'semantic' ? COLORS.primary : '#f3f4f6';
                  }}
                >
                  Semantic
                </button>
                <button
                  onClick={() => applyPreset('modular')}
                  className="px-3 py-2 text-sm font-medium rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activePreset === 'modular' ? COLORS.primary : '#f3f4f6',
                    color: activePreset === 'modular' ? 'white' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (activePreset !== 'modular') {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activePreset === 'modular' ? COLORS.primary : '#f3f4f6';
                  }}
                >
                  Modular
                </button>
              </div>
            </div>
            {/* Field Configuration Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Field Configuration Options
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showRequired}
                    onChange={(e) => updatePreference('showRequired', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Show "Required" checkbox</span>
                    <p className="text-xs text-gray-500">Display required/optional toggle for fields</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showAllowMultiple}
                    onChange={(e) => updatePreference('showAllowMultiple', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Show "Allow multiple" checkbox</span>
                    <p className="text-xs text-gray-500">Display multiple values toggle for fields</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showHelpText}
                    onChange={(e) => updatePreference('showHelpText', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Show "Help Text" field</span>
                    <p className="text-xs text-gray-500">Display help text input for fields</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showDefaultValue}
                    onChange={(e) => updatePreference('showDefaultValue', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Show "Default Value" field</span>
                    <p className="text-xs text-gray-500">Display default value input for fields</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Feature Visibility */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Feature Visibility
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showFieldDesigner}
                    onChange={(e) => updatePreference('showFieldDesigner', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Show "Field Designer" button</span>
                    <p className="text-xs text-gray-500">Display the Field Designer feature in the top menu</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.showElements}
                    onChange={(e) => updatePreference('showElements', e.target.checked)}
                    className="w-4 h-4 checkbox-white"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Enable Elements</span>
                    <p className="text-xs text-gray-500">Enable elements functionality in the template builder</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Field Selection Style */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Field Selection Style
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3">
                  Choose how you want to add fields to your template
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group p-2 rounded bg-white hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="fieldSelectionStyle"
                      checked={preferences.fieldSelectionStyle === 'modal'}
                      onChange={() => onPreferencesChange({ ...preferences, fieldSelectionStyle: 'modal' })}
                      className="w-4 h-4 radio-white"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Popup Modal</span>
                      <p className="text-xs text-gray-500">Show field types in a centered popup dialog (default)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group p-2 rounded bg-white hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="fieldSelectionStyle"
                      checked={preferences.fieldSelectionStyle === 'sidebar'}
                      onChange={() => onPreferencesChange({ ...preferences, fieldSelectionStyle: 'sidebar' })}
                      className="w-4 h-4 radio-white"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Library Sidebar</span>
                      <p className="text-xs text-gray-500">Show expandable library list on the left side of the page</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Visible Field Types */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Visible Field Types
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllFieldTypes(true)}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ 
                      color: COLORS.primary,
                      backgroundColor: COLORS.primaryLight
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary + '20'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryLight}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => toggleAllFieldTypes(false)}
                    className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3">
                  Control which field types appear in the "Add Field" section and dropdown menus
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 pb-8">
                  {Object.entries(fieldTypes).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.visibleFieldTypes[key] ?? true}
                        onChange={(e) => updateFieldTypeVisibility(key, e.target.checked)}
                        className="w-4 h-4 checkbox-white"
                      />
                      <div className="flex items-center gap-2 text-gray-600">
                        {value.icon}
                        <span className="text-sm text-gray-900 group-hover:text-gray-700">{value.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow hover:shadow-md"
            style={{ backgroundColor: COLORS.primary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes backdrop-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .animate-backdrop-fade-in {
          animation: backdrop-fade-in 0.15s ease-out;
        }

        .animate-modal-fade-in {
          animation: modal-fade-in 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fafafa;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        .radio-white {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          background-color: white;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }

        .radio-white:hover {
          border-color: #9ca3af;
        }

        .radio-white:checked {
          border-color: #d1d5db;
          background-color: white;
        }

        .radio-white:checked::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background-color: currentColor;
        }
      `}</style>
    </>
  );
}