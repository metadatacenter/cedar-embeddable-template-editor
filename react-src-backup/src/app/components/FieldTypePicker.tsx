import { Library, CustomField } from '../types';
import { useState, useRef, useEffect } from 'react';
import { FIELD_ICONS, LIBRARY_ICONS, FieldIconKey, LibraryIconKey } from '../FieldDesignerIcons';

interface FieldTypePickerProps {
  FIELD_TYPES: Record<string, { icon: JSX.Element; label: string; preview: string }>;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
  libraries: Library[];
  customFields: CustomField[];
  selectedLibraryId: number | null;
  onSelectLibrary: (id: number | null) => void;
  onAddStandardField: (type: string) => void;
  onAddCustomField: (customField: CustomField) => void;
  onClose: () => void;
}

export function FieldTypePicker({
  FIELD_TYPES,
  COLORS,
  libraries,
  customFields,
  selectedLibraryId,
  onSelectLibrary,
  onAddStandardField,
  onAddCustomField,
  onClose
}: FieldTypePickerProps) {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected library name
  const selectedLibrary = selectedLibraryId === null 
    ? { id: null, name: 'Standard', icon: '' }
    : libraries.find(lib => lib.id === selectedLibraryId) || { id: null, name: 'Standard', icon: '' };

  // Filter libraries based on search text
  const filteredLibraries = libraries.filter(lib => 
    lib.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get custom fields for selected library
  const libraryCustomFields = selectedLibraryId 
    ? customFields.filter(f => f.libraryId === selectedLibraryId)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLibrary = (id: number | null) => {
    onSelectLibrary(id);
    setShowDropdown(false);
    setSearchText('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: `2px solid ${COLORS.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-900">Choose field type</h3>
          
          {/* Library Dropdown with Autocomplete - Only show if libraries exist */}
          {libraries.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors flex items-center gap-2 min-w-[140px] justify-between"
              >
                <span className="text-gray-700">{selectedLibrary.name}</span>
                <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-300 shadow-lg z-20 min-w-[200px]">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search libraries..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-gray-400"
                      autoFocus
                    />
                  </div>

                  {/* Options */}
                  <div className="max-h-60 overflow-y-auto">
                    {/* Standard Option */}
                    <button
                      onClick={() => handleSelectLibrary(null)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        selectedLibraryId === null ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      Standard
                    </button>

                    {/* Filtered Library Options */}
                    {filteredLibraries.length > 0 ? (
                      filteredLibraries.map((lib) => (
                        <button
                          key={lib.id}
                          onClick={() => handleSelectLibrary(lib.id)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            selectedLibraryId === lib.id ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {lib.name}
                        </button>
                      ))
                    ) : searchText ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No libraries found
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Custom Fields Section - Only show when a library is selected */}
      {selectedLibraryId !== null && libraryCustomFields.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {libraryCustomFields.map((customField) => {
              const baseTypeIconKey = customField.baseType as FieldIconKey;
              
              return (
                <button 
                  key={customField.id}
                  onClick={() => onAddCustomField(customField)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 transition-all"
                  style={{
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  title={customField.description}
                >
                  {/* Show only base type icon */}
                  <div className="text-gray-600">
                    {FIELD_ICONS[baseTypeIconKey]}
                  </div>
                  <span className="text-xs text-gray-700 text-center break-words w-full">
                    {customField.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message when library is selected but no custom fields */}
      {selectedLibraryId !== null && libraryCustomFields.length === 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            No custom fields in this library yet. Create custom fields in the Field Designer and assign them to this library.
          </p>
        </div>
      )}

      {/* Standard Fields Section - Only show when "Standard" is selected */}
      {selectedLibraryId === null && (
        <div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(FIELD_TYPES).map(([key, value]) => (
              <button 
                key={key}
                onClick={() => onAddStandardField(key)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 transition-all"
                style={{
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                  e.currentTarget.style.borderColor = COLORS.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div className="text-gray-600">{value.icon}</div>
                <span className="text-xs text-gray-700">{value.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}