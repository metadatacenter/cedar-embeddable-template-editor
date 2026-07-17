import { useState, useRef, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableField } from './components/DraggableField';
import { DraggableSidebarItem } from './components/DraggableSidebarItem';
import { FieldTypePicker } from './components/FieldTypePicker';
import { FieldLibrarySidebar } from './components/FieldLibrarySidebar';
import { PreviewPanel } from './PreviewPanel';
import { FieldDesigner } from './FieldDesigner';
import { PreferencesModal, UserPreferences } from './components/PreferencesModal';
import { PresetDefinitionsModal, PresetDefinitions } from './components/PresetDefinitionsModal';
import { ControlledTermConfig } from './components/ControlledTermConfig';
import { ApiKeyModal } from './components/ApiKeyModal';
import { List, Eye } from 'react-feather';
import { Library, CustomField } from './types';
import { FIELD_ICONS, LIBRARY_ICONS, FieldIconKey, LibraryIconKey } from './FieldDesignerIcons';

// Cedar green color palette
const COLORS = {
  primary: '#2D6F5F',      // Cedar green
  primaryHover: '#245A4D',
  primaryLight: '#E8F3F0',
  border: '#3B7A5D'
};

// Field interface
interface Field {
  id: number;
  type: string;
  name: string;
  status: string;
  options: string[];
  defaultValue: string;
  allowMultiple: boolean;
  helpText?: string;       // Help text for the field
  customFieldId?: number;  // ID of the custom field this came from (if any)
  libraryId?: number;      // ID of the library this custom field belongs to
  controlledTermConfig?: {
    sourceType: 'ontology-term' | 'ontology' | 'value-set' | 'ontology-branch';
    sourceId?: string;
    sourceName?: string;
    ontologyId?: string;
    ontologyName?: string;
    branchRootId?: string;
    branchRootName?: string;
    allowMultipleOntologies?: boolean;
    searchDepth?: number;
  };
}

// Field type definitions with icons
const FIELD_TYPES: Record<string, { icon: JSX.Element; label: string; preview: string }> = {
  text: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8M12 8v8" />
      </svg>
    ),
    label: 'Text',
    preview: 'Short answer text'
  },
  paragraph: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Paragraph',
    preview: 'Long answer text'
  },
  multipleChoice: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
    label: 'Multiple Choice',
    preview: 'Radio buttons'
  },
  checkboxes: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
      </svg>
    ),
    label: 'Checkboxes',
    preview: 'Multiple selection'
  },
  date: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Date',
    preview: 'Date picker'
  },
  time: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Time',
    preview: 'Time picker'
  },
  email: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    preview: 'Email address'
  },
  link: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    label: 'Link',
    preview: 'URL'
  },
  phone: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    preview: 'Phone number'
  },
  number: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    label: 'Number',
    preview: 'Numeric value'
  },
  image: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Image',
    preview: 'File upload'
  },
  orcid: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    label: 'ORCID',
    preview: 'Research identifier'
  },
  controlledTerms: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    label: 'Controlled Terms',
    preview: 'Controlled vocabulary'
  }
};

export default function App() {
  // User Preferences - Default to Basic preset
  const [preferences, setPreferences] = useState<UserPreferences>({
    showRequired: true,
    showAllowMultiple: true,
    showHelpText: false,
    showDefaultValue: false,
    showFieldDesigner: false,
    showElements: false,
    fieldSelectionStyle: 'modal',
    visibleFieldTypes: Object.keys(FIELD_TYPES).reduce((acc, key) => {
      // Set controlledTerms to false for basic preset, all others to true
      acc[key] = key !== 'controlledTerms';
      return acc;
    }, {} as Record<string, boolean>)
  });
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPresetDefinitionsModal, setShowPresetDefinitionsModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bioportalApiKey, setBioportalApiKey] = useState(() => {
    // Load API key from localStorage on mount
    return localStorage.getItem('bioportalApiKey') || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Preset Definitions - Define what each preset means
  const [presetDefinitions, setPresetDefinitions] = useState<PresetDefinitions>({
    basic: {
      showRequired: true,
      showAllowMultiple: true,
      showHelpText: false,
      showDefaultValue: false,
      showFieldDesigner: false,
      showElements: false,
      hiddenFieldTypes: ['controlledTerms']
    },
    semantic: {
      showRequired: true,
      showAllowMultiple: true,
      showHelpText: true,
      showDefaultValue: true,
      showFieldDesigner: true,
      showElements: false,
      hiddenFieldTypes: []
    },
    modular: {
      showRequired: true,
      showAllowMultiple: true,
      showHelpText: true,
      showDefaultValue: true,
      showFieldDesigner: true,
      showElements: true,
      hiddenFieldTypes: []
    }
  });

  const [fields, setFields] = useState<Field[]>([
    { id: 1, type: 'text', name: 'Title', status: 'required', options: [], defaultValue: '', allowMultiple: false },
    { id: 2, type: 'multipleChoice', name: 'Category', status: 'optional', options: ['Option 1', 'Option 2'], defaultValue: '', allowMultiple: false },
    { id: 3, type: 'date', name: 'Publication Date', status: 'optional', options: [], defaultValue: '', allowMultiple: false }
  ]);
  
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [templateDesc, setTemplateDesc] = useState('');
  const [showFieldsOverview, setShowFieldsOverview] = useState(true);
  const [shouldShowOverview, setShouldShowOverview] = useState(false);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [fieldTypeDropdown, setFieldTypeDropdown] = useState<number | null>(null);
  const [fieldTypeDropdownLibrary, setFieldTypeDropdownLibrary] = useState<number | null>(null); // Track selected library in field type dropdown
  const [showPreview, setShowPreview] = useState(false);
  const [showFieldDesigner, setShowFieldDesigner] = useState(false);
  const fieldRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Libraries and Custom Fields state
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (bioportalApiKey) {
      localStorage.setItem('bioportalApiKey', bioportalApiKey);
    } else {
      localStorage.removeItem('bioportalApiKey');
    }
  }, [bioportalApiKey]);

  // Check if fields overflow viewport to determine if sidebar should be available
  useEffect(() => {
    const checkOverflow = () => {
      if (mainContentRef.current && fields.length > 0 && preferences.fieldSelectionStyle !== 'sidebar') {
        const contentHeight = mainContentRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;
        // Show overview if content is taller than viewport (any scrolling needed)
        setShouldShowOverview(contentHeight > viewportHeight);
      } else {
        setShouldShowOverview(false);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [fields, preferences.fieldSelectionStyle]);

  // Scroll picker into view when it opens
  useEffect(() => {
    if (showPicker !== null) {
      setTimeout(() => {
        const pickerElement = document.querySelector('.field-picker-active');
        if (pickerElement) {
          pickerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [showPicker]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fieldTypeDropdown !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest('.field-type-dropdown-container')) {
          setFieldTypeDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fieldTypeDropdown]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync all field types into preferences on mount to ensure nothing is missing
  useEffect(() => {
    setPreferences(prev => {
      const currentFieldTypes = Object.keys(FIELD_TYPES);
      const updatedVisibleFieldTypes = { ...prev.visibleFieldTypes };
      let hasChanges = false;
      
      // Add any missing field types
      currentFieldTypes.forEach(key => {
        if (!(key in updatedVisibleFieldTypes)) {
          updatedVisibleFieldTypes[key] = true;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        console.log('Syncing field types to preferences');
        return {
          ...prev,
          visibleFieldTypes: updatedVisibleFieldTypes
        };
      }
      
      return prev;
    });
  }, []);

  const scrollToField = (fieldId: number) => {
    setSelectedField(fieldId);
    fieldRefs.current[fieldId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-clear selection after 3 seconds
    setTimeout(() => {
      setSelectedField(null);
    }, 3000);
  };

  const addField = (type: string, position: number) => {
    const newField: Field = {
      id: Date.now(),
      type,
      name: FIELD_TYPES[type].label,
      status: 'optional',
      options: type === 'multipleChoice' || type === 'checkboxes' ? ['Option 1'] : [],
      defaultValue: '',
      allowMultiple: false
    };
    
    const newFields = [...fields];
    newFields.splice(position, 0, newField);
    setFields(newFields);
    setShowPicker(null);
    setSelectedField(newField.id);
    
    // Auto-scroll to new field
    setTimeout(() => {
      fieldRefs.current[newField.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const addCustomFieldToTemplate = (customField: CustomField, position: number) => {
    // Create a new field based on custom field configuration
    const newField: Field = {
      id: Date.now(),
      type: customField.baseType,  // Use the base type from custom field
      name: customField.name,      // Use custom field's name
      status: 'optional',
      options: customField.baseType === 'multipleChoice' || customField.baseType === 'checkboxes' ? ['Option 1'] : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: customField.id,  // Track which custom field this came from
      libraryId: customField.libraryId  // Track which library it belongs to
    };
    
    const newFields = [...fields];
    newFields.splice(position, 0, newField);
    setFields(newFields);
    setShowPicker(null);
    setSelectedField(newField.id);
    
    // Auto-scroll to new field
    setTimeout(() => {
      fieldRefs.current[newField.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const deleteField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateFieldName = (id: number, name: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, name } : f));
  };

  const updateFieldType = (id: number, type: string) => {
    setFields(fields.map(f => f.id === id ? { 
      ...f, 
      type,
      options: type === 'multipleChoice' || type === 'checkboxes' ? (f.options.length > 0 ? f.options : ['Option 1']) : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: undefined,  // Clear custom field ID when changing to standard type
      libraryId: undefined       // Clear library ID when changing to standard type
    } : f));
  };

  const convertFieldToCustomField = (fieldId: number, customField: CustomField) => {
    setFields(fields.map(f => f.id === fieldId ? {
      ...f,
      type: customField.baseType,
      name: customField.name,
      options: customField.baseType === 'multipleChoice' || customField.baseType === 'checkboxes' ? (f.options.length > 0 ? f.options : ['Option 1']) : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: customField.id,
      libraryId: customField.libraryId
    } : f));
  };

  const toggleRequired = (id: number) => {
    setFields(fields.map(f => f.id === id ? { ...f, status: f.status === 'required' ? 'optional' : 'required' } : f));
  };

  const toggleRecommended = (id: number) => {
    setFields(fields.map(f => f.id === id ? { ...f, recommended: !f.recommended } : f));
  };

  const updateFieldStatus = (id: number, status: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, status } : f));
  };

  const updateOption = (fieldId: number, optionIndex: number, value: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...f.options];
        newOptions[optionIndex] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const addOption = (fieldId: number) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      }
      return f;
    }));
  };

  const deleteOption = (fieldId: number, optionIndex: number) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOptions = f.options.filter((_, index) => index !== optionIndex);
        // Keep at least one option
        return { ...f, options: newOptions.length > 0 ? newOptions : ['Option 1'] };
      }
      return f;
    }));
  };



  const updateDefaultValue = (id: number, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, defaultValue: value } : f));
  };

  const toggleAllowMultiple = (id: number) => {
    setFields(fields.map(f => f.id === id ? { ...f, allowMultiple: !f.allowMultiple } : f));
  };

  const updateHelpText = (id: number, helpText: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, helpText } : f));
  };

  const updateControlledTermConfig = (id: number, config: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, controlledTermConfig: config } : f));
  };

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    const newFields = [...fields];
    const dragField = newFields[dragIndex];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFields(newFields);
  }, [fields]);

  // Filter field types based on preferences
  const getVisibleFieldTypes = () => {
    return Object.entries(FIELD_TYPES).reduce((acc, [key, value]) => {
      if (preferences.visibleFieldTypes[key] !== false) {
        acc[key] = value;
      }
      return acc;
    }, {} as typeof FIELD_TYPES);
  };

  // Helper function to render field icon (with library badge for custom fields)
  const renderFieldIcon = (field: Field) => {
    // If it's a custom field (has libraryId), show library badge + base type icon
    if (field.libraryId && field.customFieldId) {
      const library = libraries.find(lib => lib.id === field.libraryId);
      const libraryIconKey = library?.icon as LibraryIconKey || 'library';
      
      return (
        <>
          {/* Base type icon */}
          {FIELD_TYPES[field.type].icon}
          {/* Library icon badge - right next to it */}
          <span className="ml-1 inline-flex items-center justify-center" style={{ color: '#6b7280', fontSize: '12px' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </span>
        </>
      );
    }
    
    // Regular field - just show the standard icon
    return FIELD_TYPES[field.type].icon;
  };

  // If showing Field Designer, render it instead of the Template Builder
  if (showFieldDesigner) {
    return (
      <FieldDesigner 
        libraries={libraries}
        customFields={customFields}
        onLibrariesChange={setLibraries}
        onCustomFieldsChange={setCustomFields}
        onBackToBuilder={() => setShowFieldDesigner(false)}
        currentProfile={'basic'}
        profileConfig={{ name: 'Template Builder', iconColor: COLORS.primary, showFieldDesigner: true }}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 relative flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-lg font-medium text-gray-900">Template Builder</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Field Designer Button - Show based on preferences */}
              {preferences.showFieldDesigner && (
                <button
                  onClick={() => setShowFieldDesigner(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-white border-transparent"
                  style={{ backgroundColor: COLORS.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                  <span className="text-sm font-medium">Field Designer</span>
                </button>
              )}
              {/* Preview Toggle */}
              {!showPreview && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">Preview</span>
                </button>
              )}
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="User Menu"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" 
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-300 shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowPreferencesModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Preferences</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPresetDefinitionsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span className="font-medium">Define Presets</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowApiKeyModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="font-medium">BioPortal API Key</span>
                      {bioportalApiKey && (
                        <svg className="w-3.5 h-3.5 ml-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Field Library Sidebar - Only shown when preference is 'sidebar' */}
          {preferences.fieldSelectionStyle === 'sidebar' && (
            <div className="flex-shrink-0">
              <FieldLibrarySidebar
                libraries={libraries}
                customFields={customFields}
                fields={fields}
                fieldTypes={FIELD_TYPES}
                visibleFieldTypes={preferences.visibleFieldTypes}
                onAddField={(type) => addField(type, fields.length)}
                onAddCustomField={(customField) => addCustomFieldToTemplate(customField, fields.length)}
                onFieldClick={(fieldId) => setSelectedField(fieldId)}
                selectedField={selectedField}
                onCollapsedChange={setSidebarCollapsed}
                moveField={moveField}
                COLORS={COLORS}
              />
            </div>
          )}
          
          {/* Editor Side */}
          <div 
            className={`transition-all duration-300 ${showPreview ? 'w-[calc(65%-1px)] border-r border-gray-300' : 'w-full'} overflow-y-auto relative`}
          >
            
            {/* Grid Layout: Invisible Spacer | Main Content */}
            <div className="grid h-full" style={{
              gridTemplateColumns: shouldShowOverview 
                ? (showFieldsOverview 
                    ? (showPreview ? '180px 1fr' : '256px 1fr')
                    : '80px 1fr')
                : '1fr'
            }}>

            {/* Invisible Spacer Column - reserves space for the fixed sidebar or button */}
            {shouldShowOverview && (
              <div className="invisible" aria-hidden="true"></div>
            )}

            {/* Fields Overview Sidebar - Fixed Position */}
            {shouldShowOverview && showFieldsOverview && (
              <div className={`fixed top-24 bg-white rounded-lg border border-gray-300 shadow-lg z-20 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col`} style={{
                left: '1.5rem',
                width: showPreview ? '180px' : '16rem'
              }}>
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">Fields ({fields.length})</h3>
                  </div>
                  <button 
                    onClick={() => setShowFieldsOverview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto flex-1">
                  {fields.map((field, index) => (
                    <DraggableSidebarItem
                      key={field.id}
                      field={field}
                      index={index}
                      moveField={moveField}
                      selectedField={selectedField}
                      onFieldClick={scrollToField}
                      fieldIcon={FIELD_TYPES[field.type].icon}
                      fieldTypeLabel={FIELD_TYPES[field.type].label}
                      libraries={libraries}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Column */}
            <div className="relative">
              
              {/* Toggle Fields Overview Button - Only show when overview is available */}
              {shouldShowOverview && !showFieldsOverview && (
                <button
                  onClick={() => setShowFieldsOverview(true)}
                  className="fixed left-6 top-24 px-3 py-2 bg-white rounded-lg border border-gray-300 shadow-lg hover:shadow-xl transition-all z-20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Fields ({fields.length})</span>
                </button>
              )}

              <main ref={mainContentRef} className="py-2 px-8 max-w-4xl mx-auto" style={{
                width: '100%'
              }}>
                {/* Template Header Card - Compact */}
                <div className="bg-white rounded-lg border border-gray-300 mb-2 overflow-hidden">
                  <div className="px-3 py-2 relative">
                    {/* Decorative top border gradient */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
                      }}
                    />
                    
                    {/* Subtle background pattern */}
                    <div className="flex items-start gap-4">
                      {/* Icon decoration */}
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mt-1"
                        style={{ backgroundColor: COLORS.primaryLight }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          className="text-lg font-medium text-gray-900 border-none outline-none w-full bg-transparent mb-2"
                          style={{ 
                            borderBottom: '2px solid transparent',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderBottomColor = COLORS.primary}
                          onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                          placeholder="Template title"
                        />
                        <input 
                          type="text" 
                          value={templateDesc}
                          onChange={(e) => setTemplateDesc(e.target.value)}
                          className="text-sm text-gray-600 border-none outline-none w-full bg-transparent"
                          placeholder="Add description..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Cards with Insert Zones */}
                <div className="space-y-0">
                  {/* Render Fields */}
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative">
                      {/* Insert Zone Before Field - Only show when using modal style */}
                      {preferences.fieldSelectionStyle === 'modal' && (
                        <>
                          <div 
                            className="insert-zone flex justify-center items-center absolute w-full opacity-0 hover:opacity-100 transition-opacity z-10"
                            onClick={() => setShowPicker(index)}
                            style={{ height: '30px', top: '-17.5px' }}
                          >
                            <button 
                              className="text-xs text-white rounded-full px-3 py-1 transition-all shadow-md"
                              style={{ 
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary
                              }}
                            >
                              + Add field
                            </button>
                          </div>

                          {/* Field Type Picker */}
                          {showPicker === index && (
                            <div className="mb-2 animate-fade-in field-picker-active">
                              <FieldTypePicker
                                FIELD_TYPES={getVisibleFieldTypes()}
                                COLORS={COLORS}
                                libraries={libraries}
                                customFields={customFields}
                                selectedLibraryId={selectedLibraryId}
                                onSelectLibrary={setSelectedLibraryId}
                                onAddStandardField={(type) => addField(type, index)}
                                onAddCustomField={(customField) => addCustomFieldToTemplate(customField, index)}
                                onClose={() => setShowPicker(null)}
                              />
                            </div>
                          )}
                        </>
                      )}

                    <DraggableField
                      key={field.id}
                      field={field}
                      index={index}
                      moveField={moveField}
                    >
                      {(dragRef) => (
                      <div ref={(el) => fieldRefs.current[field.id] = el}>
                        {/* Field Card */}
                        <div 
                          className="bg-white rounded-lg border border-gray-300 transition-all mb-[5px] relative group"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                        >
                          {/* Active/Selected Indicator */}
                          {selectedField === field.id && (
                            <div 
                              className="absolute -left-1 top-1 bottom-1 w-1 rounded animate-fade-in"
                              style={{ backgroundColor: COLORS.primary }}
                            />
                          )}
                          <div className="px-5 py-3 relative" onClick={() => setSelectedField(field.id)}>
                            {/* Drag Handle - Centered above field name */}
                            {selectedField === field.id && (
                              <div className="flex justify-center items-center absolute left-0 right-0" style={{ top: '1px', height: '16px' }}>
                                <div
                                  ref={dragRef}
                                  className="cursor-move text-gray-500 hover:text-gray-700 transition-all"
                                  style={{ cursor: 'grab' }}
                                  title="Drag to reorder"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="7" cy="8" r="1.5" />
                                    <circle cx="12" cy="8" r="1.5" />
                                    <circle cx="17" cy="8" r="1.5" />
                                    <circle cx="7" cy="16" r="1.5" />
                                    <circle cx="12" cy="16" r="1.5" />
                                    <circle cx="17" cy="16" r="1.5" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            
                            {/* Header Row - Icon, Name, Type Badge */}
                            <div className="flex items-center gap-3 mb-3 px-1">
                              {/* Left: Icon + Dropdown */}
                              <div className="relative flex-shrink-0">
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFieldTypeDropdown(fieldTypeDropdown === field.id ? null : field.id);
                                      setSelectedField(field.id);
                                    }}
                                    className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -ml-2 transition-colors flex flex-col items-start gap-0.5 group/dropdown-btn"
                                    style={{ color: COLORS.primary }}
                                    title="Change field type"
                                  >
                                    <div className="flex items-center gap-1">
                                      {renderFieldIcon(field)}
                                      <svg 
                                        className={`w-3 h-3 text-gray-400 group-hover/dropdown-btn:text-gray-600 transition-all ${
                                          fieldTypeDropdown === field.id ? 'rotate-180' : ''
                                        }`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                    <div className="text-[10px] text-gray-500 leading-tight">
                                      {field.customFieldId 
                                        ? customFields.find(cf => cf.id === field.customFieldId)?.name || FIELD_TYPES[field.type]?.label
                                        : FIELD_TYPES[field.type]?.label
                                      }
                                    </div>
                                  </button>
                                  
                                  {/* Field Type Dropdown */}
                                  {fieldTypeDropdown === field.id && (
                                    <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 w-64 animate-fade-in field-type-dropdown-container">
                                      <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar"
                                        style={{
                                          scrollbarWidth: 'thin',
                                          scrollbarColor: `${COLORS.primary} ${COLORS.primaryLight}`
                                        }}
                                      >
                                        {/* Standard Fields Section */}
                                        <div className="mb-2">
                                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                                            Standard Fields
                                          </div>
                                          {Object.entries(getVisibleFieldTypes()).map(([key, value]) => (
                                            <button
                                              key={key}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateFieldType(field.id, key);
                                                setFieldTypeDropdown(null);
                                                setFieldTypeDropdownLibrary(null);
                                              }}
                                              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors text-left ${
                                                field.type === key && !field.customFieldId ? 'bg-gray-50' : ''
                                              }`}
                                            >
                                              <div className="text-gray-600 flex-shrink-0">
                                                {value.icon}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{value.label}</div>
                                                <div className="text-xs text-gray-500 truncate">{value.preview}</div>
                                              </div>
                                              {field.type === key && !field.customFieldId && (
                                                <svg className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                            </button>
                                          ))}
                                        </div>

                                        {/* Custom Fields Section - Only show if there are libraries */}
                                        {libraries.length > 0 && (
                                          <div className="border-t border-gray-200 pt-2">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                                              Custom Fields
                                            </div>
                                            
                                            {/* Show library selector if no library is selected */}
                                            {fieldTypeDropdownLibrary === null ? (
                                              libraries.map((library) => {
                                                const libraryCustomFields = customFields.filter(cf => cf.libraryId === library.id);
                                                if (libraryCustomFields.length === 0) return null;
                                                
                                                return (
                                                  <button
                                                    key={library.id}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setFieldTypeDropdownLibrary(library.id);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors text-left"
                                                  >
                                                    <div className="flex-shrink-0">
                                                      <svg className="w-5 h-5" style={{ color: library.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                      </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="text-sm font-medium text-gray-900">{library.name}</div>
                                                      <div className="text-xs text-gray-500">{libraryCustomFields.length} field{libraryCustomFields.length !== 1 ? 's' : ''}</div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                  </button>
                                                );
                                              })
                                            ) : (
                                              /* Show custom fields from selected library */
                                              <>
                                                {/* Back button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFieldTypeDropdownLibrary(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-left mb-1"
                                                >
                                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                  </svg>
                                                  <span className="text-sm text-gray-600">Back to libraries</span>
                                                </button>
                                                
                                                {/* Custom fields list */}
                                                {customFields
                                                  .filter(cf => cf.libraryId === fieldTypeDropdownLibrary)
                                                  .map((customField) => (
                                                    <button
                                                      key={customField.id}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        convertFieldToCustomField(field.id, customField);
                                                        setFieldTypeDropdown(null);
                                                        setFieldTypeDropdownLibrary(null);
                                                      }}
                                                      className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors text-left ${
                                                        field.customFieldId === customField.id ? 'bg-gray-50' : ''
                                                      }`}
                                                    >
                                                      <div className="text-gray-600 flex-shrink-0">
                                                        {FIELD_TYPES[customField.baseType].icon}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900">{customField.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{customField.description || FIELD_TYPES[customField.baseType].preview}</div>
                                                      </div>
                                                      {field.customFieldId === customField.id && (
                                                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                      )}
                                                    </button>
                                                  ))}
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                              {/* Center: Field Name Input */}
                              <input 
                                type="text" 
                                value={field.name}
                                onChange={(e) => updateFieldName(field.id, e.target.value)}
                                className="text-sm font-medium text-gray-900 border-none outline-none pb-1 flex-1 min-w-0 py-1 transition-all bg-gray-100"
                                style={{ 
                                  borderBottom: selectedField === field.id ? `2px solid ${COLORS.primary}` : '2px solid #d1d5db',
                                }}
                                onFocus={(e) => {
                                  setSelectedField(field.id);
                                  e.target.select();
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedField !== field.id) {
                                    e.currentTarget.style.borderBottomColor = '#9ca3af';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedField !== field.id) {
                                    e.currentTarget.style.borderBottomColor = '#d1d5db';
                                  }
                                }}
                                placeholder="Enter field name"
                              />
                            </div>
                            
                            {/* Field Preview */}
                            {(field.type === 'multipleChoice' || field.type === 'checkboxes') ? (
                              <div className="space-y-1 mb-3 px-1" onClick={() => setSelectedField(field.id)}>
                                {field.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-3 group/option px-1 py-1">
                                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {field.type === 'checkboxes' ? (
                                        <>
                                          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                                        </>
                                      ) : (
                                        <>
                                          <circle cx="12" cy="12" r="9" strokeWidth={2} />
                                          <circle cx="12" cy="12" r="4" fill="currentColor" />
                                        </>
                                      )}
                                    </svg>
                                    <input 
                                      type="text" 
                                      value={option}
                                      onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                      onFocus={(e) => {
                                        setSelectedField(field.id);
                                        e.target.select();
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderBottomColor = '#9ca3af';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderBottomColor = '#d1d5db';
                                      }}
                                      className="text-sm text-gray-700 border-none outline-none bg-gray-100 flex-1 min-w-0 placeholder-gray-400 py-1 transition-all"
                                      style={{ 
                                        borderBottom: '2px solid #d1d5db',
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    {field.options.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteOption(field.id, optionIndex);
                                        }}
                                        className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover/option:opacity-100 flex-shrink-0 cursor-pointer"
                                        title="Delete option"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addOption(field.id);
                                    setSelectedField(field.id);
                                  }}
                                  className="flex items-center gap-2 ml-6 text-xs text-gray-500 transition-colors cursor-pointer"
                                  style={{ color: 'inherit' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add option
                                </button>
                              </div>
                            ) : field.type === 'controlledTerms' ? (
                              <ControlledTermConfig
                                field={field}
                                onUpdate={updateControlledTermConfig}
                                COLORS={COLORS}
                              />
                            ) : (
                              <div onClick={() => setSelectedField(field.id)} className="mb-3 px-1">
                                <input 
                                  type="text" 
                                  disabled
                                  placeholder={FIELD_TYPES[field.type].preview}
                                  className="text-sm text-gray-600 w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                  style={{ 
                                    pointerEvents: 'none',
                                    borderColor: '#D1D5DB'
                                  }}
                                />
                              </div>
                            )}

                            {/* Help Text and Default Value Fields */}
                            {(preferences.showHelpText || preferences.showDefaultValue) && (
                              <div className="space-y-2 mb-3 px-1" onClick={() => setSelectedField(field.id)}>
                                {/* Help Text */}
                                {preferences.showHelpText && (
                                  <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Help Text</label>
                                    <input 
                                      type="text" 
                                      value={field.helpText || ''}
                                      onChange={(e) => updateHelpText(field.id, e.target.value)}
                                      onFocus={() => setSelectedField(field.id)}
                                      placeholder="Add helpful description for this field..."
                                      className="text-sm text-gray-700 w-full bg-white border border-gray-300 rounded-md px-2 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                      style={{
                                        focusRingColor: COLORS.primary
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {/* Default Value */}
                                {preferences.showDefaultValue && (
                                  <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Default Value</label>
                                    <input 
                                      type="text" 
                                      value={field.defaultValue || ''}
                                      onChange={(e) => updateDefaultValue(field.id, e.target.value)}
                                      onFocus={() => setSelectedField(field.id)}
                                      placeholder="Set a default value..."
                                      className="text-sm text-gray-700 w-full bg-white border border-gray-300 rounded-md px-2 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                      style={{
                                        focusRingColor: COLORS.primary
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Field Controls - More Spread Out */}
                            <div className="flex items-center justify-end gap-6 pt-1" onClick={() => setSelectedField(field.id)}>
                              {/* Required Checkbox */}
                              {preferences.showRequired && (
                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={field.status === 'required'}
                                    onChange={() => toggleRequired(field.id)}
                                    className="w-3.5 h-3.5 checkbox-white"
                                  />
                                  <span className="text-xs text-gray-700 group-hover:text-gray-900">Required</span>
                                </label>
                              )}
                              
                              {/* Allow Multiple Checkbox */}
                              {preferences.showAllowMultiple && (
                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={field.allowMultiple}
                                    onChange={() => toggleAllowMultiple(field.id)}
                                    className="w-3.5 h-3.5 checkbox-white"
                                  />
                                  <span className="text-xs text-gray-700 group-hover:text-gray-900">Allow multiple</span>
                                </label>
                              )}

                              {/* Delete button */}
                              <button 
                                onClick={() => deleteField(field.id)}
                                className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                title="Delete field"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                      )}
                    </DraggableField>
                    </div>
                  ))}
                </div>

                {/* Permanent Add Field Button at the End - Only show when using modal style */}
                {preferences.fieldSelectionStyle === 'modal' && (
                  <>
                    <div className="mt-6 flex justify-center">
                      <button 
                        onClick={() => setShowPicker(fields.length)}
                        className="text-white rounded-full p-3 shadow-lg hover:scale-105 transition-all flex items-center gap-3 px-6"
                        style={{ backgroundColor: COLORS.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium">Add Field</span>
                      </button>
                    </div>

                    {/* Field Type Picker for end button */}
                    {showPicker === fields.length && (
                      <div className="mt-3 animate-fade-in field-picker-active">
                        <FieldTypePicker
                          FIELD_TYPES={getVisibleFieldTypes()}
                          COLORS={COLORS}
                          libraries={libraries}
                          customFields={customFields}
                          selectedLibraryId={selectedLibraryId}
                          onSelectLibrary={setSelectedLibraryId}
                          onAddStandardField={(type) => addField(type, fields.length)}
                          onAddCustomField={(customField) => addCustomFieldToTemplate(customField, fields.length)}
                          onClose={() => setShowPicker(null)}
                        />
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>  {/* Close Main Content Column */}
            </div>  {/* Close Grid Layout */}
          </div>  {/* Close Editor Side div */}

          {/* Preview Side Panel */}
          {showPreview && (
            <div className="w-[35%] bg-white border-l border-gray-300">
              <PreviewPanel 
                fields={fields}
                templateName={templateName}
                templateDesc={templateDesc}
                onClose={() => setShowPreview(false)}
                apiKey={bioportalApiKey}
                FIELD_TYPES={FIELD_TYPES}
                COLORS={COLORS}
              />
            </div>
          )}
        </div>

        {/* Fixed Bottom Right Action Button - Only Save */}
        <div className="fixed bottom-6 right-6 z-30">
          {/* Save Button */}
          <div className="relative group">
            <button 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: COLORS.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              Save Template
            </div>
          </div>
        </div>

        <style>{`
          .insert-zone {
            cursor: pointer;
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          
          /* Custom scrollbar for dropdown */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${COLORS.primaryLight};
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${COLORS.primary};
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${COLORS.primaryHover};
          }
        `}</style>

        {/* Preferences Modal */}
        <PreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          presetDefinitions={presetDefinitions}
          fieldTypes={FIELD_TYPES}
          COLORS={COLORS}
        />

        {/* Preset Definitions Modal */}
        <PresetDefinitionsModal
          isOpen={showPresetDefinitionsModal}
          onClose={() => setShowPresetDefinitionsModal(false)}
          presetDefinitions={presetDefinitions}
          onPresetDefinitionsChange={setPresetDefinitions}
          fieldTypes={FIELD_TYPES}
          COLORS={COLORS}
        />

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          apiKey={bioportalApiKey}
          onApiKeyChange={setBioportalApiKey}
          COLORS={COLORS}
        />
      </div>
    </DndProvider>
  );
}