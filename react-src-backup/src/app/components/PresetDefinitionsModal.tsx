import { X } from 'lucide-react';

export interface PresetDefinition {
  showRequired: boolean;
  showAllowMultiple: boolean;
  showHelpText: boolean;
  showDefaultValue: boolean;
  showFieldDesigner: boolean;
  showElements: boolean;
  hiddenFieldTypes: string[]; // Field types that should be unchecked
}

export interface PresetDefinitions {
  basic: PresetDefinition;
  semantic: PresetDefinition;
  modular: PresetDefinition;
}

interface PresetDefinitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDefinitions: PresetDefinitions;
  onPresetDefinitionsChange: (definitions: PresetDefinitions) => void;
  fieldTypes: Record<string, { icon: JSX.Element; label: string; preview: string }>;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function PresetDefinitionsModal({
  isOpen,
  onClose,
  presetDefinitions,
  onPresetDefinitionsChange,
  fieldTypes,
  COLORS
}: PresetDefinitionsModalProps) {
  if (!isOpen) return null;

  const updatePresetDefinition = (
    preset: 'basic' | 'semantic' | 'modular',
    key: keyof PresetDefinition,
    value: boolean | string[]
  ) => {
    onPresetDefinitionsChange({
      ...presetDefinitions,
      [preset]: {
        ...presetDefinitions[preset],
        [key]: value
      }
    });
  };

  const toggleFieldTypeInPreset = (preset: 'basic' | 'semantic' | 'modular', fieldType: string) => {
    const currentHidden = presetDefinitions[preset].hiddenFieldTypes;
    const newHidden = currentHidden.includes(fieldType)
      ? currentHidden.filter(ft => ft !== fieldType)
      : [...currentHidden, fieldType];
    
    updatePresetDefinition(preset, 'hiddenFieldTypes', newHidden);
  };

  const presets: Array<'basic' | 'semantic' | 'modular'> = ['basic', 'semantic', 'modular'];

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
        className="fixed z-50 bg-white rounded-lg shadow-2xl w-full max-h-[85vh] overflow-hidden animate-modal-fade-in"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '800px'
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Define Presets</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <div className="p-6 pb-24">
            <p className="text-sm text-gray-600 mb-6">
              Customize what each preset configuration includes. These settings will be applied when users select a preset in their preferences.
            </p>
            
            {/* Matrix Table */}
            <div className="space-y-6">
              {/* Field Configuration Options Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">Field Configuration Options</p>
                
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 pr-4"></th>
                      {presets.map(preset => (
                        <th key={preset} className="text-center pb-3 px-3">
                          <span className="text-sm font-semibold text-gray-900 capitalize">{preset}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Show "Required" checkbox</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showRequired}
                            onChange={(e) => updatePresetDefinition(preset, 'showRequired', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Show "Allow multiple" checkbox</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showAllowMultiple}
                            onChange={(e) => updatePresetDefinition(preset, 'showAllowMultiple', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Show "Help Text" field</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showHelpText}
                            onChange={(e) => updatePresetDefinition(preset, 'showHelpText', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Show "Default Value" field</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showDefaultValue}
                            onChange={(e) => updatePresetDefinition(preset, 'showDefaultValue', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Feature Visibility Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">Feature Visibility</p>
                
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 pr-4"></th>
                      {presets.map(preset => (
                        <th key={preset} className="text-center pb-3 px-3">
                          <span className="text-sm font-semibold text-gray-900 capitalize">{preset}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Show "Field Designer" button</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showFieldDesigner}
                            onChange={(e) => updatePresetDefinition(preset, 'showFieldDesigner', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-900">Enable Elements</span>
                      </td>
                      {presets.map(preset => (
                        <td key={preset} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={presetDefinitions[preset].showElements}
                            onChange={(e) => updatePresetDefinition(preset, 'showElements', e.target.checked)}
                            className="w-4 h-4 checkbox-white cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Available Field Types Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">Available Field Types</p>
                
                <div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left pb-3 pr-4"></th>
                        {presets.map(preset => (
                          <th key={preset} className="text-center pb-3 px-3">
                            <span className="text-sm font-semibold text-gray-900 capitalize">{preset}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(fieldTypes).map(([key, value], index) => (
                        <tr key={key} className={index > 0 ? "border-t border-gray-200" : ""}>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              {value.icon}
                              <span className="text-sm text-gray-900">{value.label}</span>
                            </div>
                          </td>
                          {presets.map(preset => (
                            <td key={preset} className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={!presetDefinitions[preset].hiddenFieldTypes.includes(key)}
                                onChange={() => toggleFieldTypeInPreset(preset, key)}
                                className="w-4 h-4 checkbox-white cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      `}</style>
    </>
  );
}