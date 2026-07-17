import { useState } from 'react';
import { BioPortalSearchModal } from './components/BioPortalSearchModal';

interface Field {
  id: number;
  type: string;
  name: string;
  status: string;
  options: string[];
  defaultValue: string;
  allowMultiple: boolean;
  helpText?: string;
  controlledTermConfig?: {
    sourceType: 'ontology-term' | 'ontology' | 'value-set' | 'ontology-branch';
    sourceId?: string;
    sourceName?: string;
    ontologyId?: string;
    ontologyName?: string;
    branchRootId?: string;
    branchRootName?: string;
    restrictedOntologies?: string[];
    searchDepth?: number;
  };
}

interface PreviewPanelProps {
  fields: Field[];
  templateName: string;
  templateDesc: string;
  onClose: () => void;
  apiKey: string;
  FIELD_TYPES: Record<string, { icon: JSX.Element; label: string; preview: string }>;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function PreviewPanel({ fields, templateName, templateDesc, onClose, apiKey, FIELD_TYPES, COLORS }: PreviewPanelProps) {
  const [showBioPortalModal, setShowBioPortalModal] = useState(false);
  const [selectedFieldForSearch, setSelectedFieldForSearch] = useState<Field | null>(null);
  const [selectedTerms, setSelectedTerms] = useState<Record<number, any>>({});

  const handleOpenBioPortal = (field: Field) => {
    setSelectedFieldForSearch(field);
    setShowBioPortalModal(true);
  };

  const handleSelectTerm = (term: any) => {
    if (selectedFieldForSearch) {
      setSelectedTerms({
        ...selectedTerms,
        [selectedFieldForSearch.id]: term
      });
    }
    setShowBioPortalModal(false);
    setSelectedFieldForSearch(null);
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-50 custom-scrollbar relative">
      {/* Preview Header with Close Button */}
      <div className="absolute top-8 right-8 flex items-center gap-3 z-10">
        <span className="text-sm font-medium text-gray-600">Preview</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Close preview"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Form Title and Description */}
        <div className="mb-8">
          <h1 className="text-lg font-medium text-gray-900 mb-2">{templateName}</h1>
          {templateDesc && <p className="text-gray-600">{templateDesc}</p>}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              {/* Field Label */}
              <label className="block">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{field.name}</span>
                    {field.status === 'required' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                        Required
                      </span>
                    )}
                    {field.status === 'recommended' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                        Recommended
                      </span>
                    )}
                  </div>
                  {field.helpText && (
                    <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                  )}
                </div>

                {/* Field Input Based on Type */}
                {field.type === 'text' && (
                  <input 
                    type="text" 
                    placeholder={field.defaultValue || FIELD_TYPES[field.type].preview}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'paragraph' && (
                  <textarea 
                    rows={4}
                    placeholder={field.defaultValue || FIELD_TYPES[field.type].preview}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'multipleChoice' && (
                  <div className="space-y-2">
                    {field.options.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input 
                          type="radio" 
                          name={`field-${field.id}`}
                          className="radio-white w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkboxes' && (
                  <div className="space-y-2">
                    {field.options.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input 
                          type="checkbox"
                          className="checkbox-white w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'date' && (
                  <input 
                    type="date"
                    defaultValue={field.defaultValue}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'time' && (
                  <input 
                    type="time"
                    defaultValue={field.defaultValue}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'email' && (
                  <input 
                    type="email"
                    placeholder={field.defaultValue || 'email@example.com'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'link' && (
                  <input 
                    type="url"
                    placeholder={field.defaultValue || 'https://example.com'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'phone' && (
                  <input 
                    type="tel"
                    placeholder={field.defaultValue || '+1 (555) 000-0000'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'number' && (
                  <input 
                    type="number"
                    placeholder={field.defaultValue || '0'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'image' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}

                {field.type === 'orcid' && (
                  <input 
                    type="text"
                    placeholder={field.defaultValue || '0000-0000-0000-0000'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all font-mono"
                    style={{ 
                      '--tw-ring-color': COLORS.primary,
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}

                {field.type === 'controlledTerms' && (
                  <div>
                    <button
                      onClick={() => handleOpenBioPortal(field)}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors text-left flex items-center gap-2 group"
                    >
                      {selectedTerms[field.id] ? (
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedTerms[field.id].prefLabel}
                          </div>
                          {selectedTerms[field.id].ontologyAcronym && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {selectedTerms[field.id].ontologyAcronym}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm">Search BioPortal...</span>
                        </div>
                      )}
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {selectedTerms[field.id]?.definition?.[0] && (
                      <p className="text-xs text-gray-600 mt-2 pl-3 border-l-2 border-teal-500">
                        {selectedTerms[field.id].definition[0]}
                      </p>
                    )}
                  </div>
                )}

                {field.allowMultiple && (
                  <p className="text-xs text-gray-500 mt-2 italic">Multiple values allowed</p>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* BioPortal Search Modal */}
      {showBioPortalModal && selectedFieldForSearch && (
        <BioPortalSearchModal
          isOpen={showBioPortalModal}
          onClose={() => {
            setShowBioPortalModal(false);
            setSelectedFieldForSearch(null);
          }}
          onSelect={handleSelectTerm}
          fieldName={selectedFieldForSearch.name}
          config={selectedFieldForSearch.controlledTermConfig}
          apiKey={apiKey}
          COLORS={COLORS}
        />
      )}
    </div>
  );
}