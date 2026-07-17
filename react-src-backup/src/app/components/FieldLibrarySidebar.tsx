import { ChevronDown, ChevronRight, ChevronLeft, GripHorizontal, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { DraggableFieldListItem } from './DraggableFieldListItem';

interface Library {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface CustomField {
  id: number;
  name: string;
  icon: string;
  baseType: string;
  libraryId: number;
  description: string;
  placeholder: string;
  validationRules: any[];
}

interface Field {
  id: number;
  type: string;
  name: string;
  status: string;
  options: string[];
  defaultValue: string;
  allowMultiple: boolean;
  helpText?: string;
  customFieldId?: number;
  libraryId?: number;
}

interface FieldType {
  icon: JSX.Element;
  label: string;
  preview: string;
}

interface FieldLibrarySidebarProps {
  libraries: Library[];
  customFields: CustomField[];
  fields: Field[];
  fieldTypes: Record<string, FieldType>;
  visibleFieldTypes: Record<string, boolean>;
  onAddField: (type: string) => void;
  onAddCustomField: (customField: CustomField) => void;
  onFieldClick?: (fieldId: number) => void;
  selectedField: number | null;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function FieldLibrarySidebar({
  libraries,
  customFields,
  fields,
  fieldTypes,
  visibleFieldTypes,
  onAddField,
  onAddCustomField,
  onFieldClick,
  selectedField,
  onCollapsedChange,
  moveField,
  COLORS
}: FieldLibrarySidebarProps) {
  const [expandedLibraries, setExpandedLibraries] = useState<Set<number>>(new Set());
  const [expandedBuiltIn, setExpandedBuiltIn] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fieldListHeight, setFieldListHeight] = useState(33.33); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleLibrary = (libraryId: number) => {
    setExpandedLibraries(prev => {
      const next = new Set(prev);
      if (next.has(libraryId)) {
        next.delete(libraryId);
      } else {
        next.add(libraryId);
      }
      return next;
    });
  };

  const getVisibleFieldTypes = () => {
    return Object.entries(fieldTypes).filter(([key]) => visibleFieldTypes[key] !== false);
  };

  const getFieldsForLibrary = (libraryId: number) => {
    return customFields.filter(cf => cf.libraryId === libraryId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      // Constrain between 10% and 70%
      setFieldListHeight(Math.min(Math.max(newHeight, 10), 70));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getFieldIcon = (field: Field) => {
    if (field.customFieldId) {
      const customField = customFields.find(cf => cf.id === field.customFieldId);
      if (customField) {
        return fieldTypes[customField.baseType]?.icon || fieldTypes[field.type]?.icon;
      }
    }
    return fieldTypes[field.type]?.icon;
  };

  return (
    <div 
      ref={containerRef}
      className="border-r border-gray-200 bg-white flex flex-col transition-all duration-300 fixed left-0 z-30"
      style={{ 
        width: isCollapsed ? '48px' : '288px',
        top: '57px',
        height: 'calc(100vh - 57px)',
        maxHeight: 'calc(100vh - 57px)'
      }}
    >
      {!isCollapsed ? (
        <>
          {/* Field List Section */}
          <div 
            className="flex flex-col border-b border-gray-300"
            style={{ height: `${fieldListHeight}%` }}
          >
            {/* Field List Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900">Fields ({fields.length})</h3>
              </div>
              <button
                onClick={() => {
                  setIsCollapsed(true);
                  onCollapsedChange?.(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Field List - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {fields.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No fields yet
                </div>
              ) : (
                fields.map((field, index) => (
                  <DraggableFieldListItem
                    key={field.id}
                    field={field}
                    index={index}
                    moveField={moveField}
                    onFieldClick={onFieldClick}
                    selectedField={selectedField}
                    getFieldIcon={getFieldIcon}
                    COLORS={COLORS}
                  />
                ))
              )}
            </div>
          </div>

          {/* Draggable Divider */}
          <div
            onMouseDown={handleMouseDown}
            className="h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center border-y border-gray-200 transition-colors"
            style={{ 
              backgroundColor: isDragging ? '#d1d5db' : undefined,
              userSelect: 'none'
            }}
          >
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>

          {/* Add Fields Section */}
          <div 
            className="flex flex-col"
            style={{ height: `${100 - fieldListHeight}%` }}
          >
            {/* Add Fields Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Libraries & Fields
              </h3>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Built-in Field Types */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setExpandedBuiltIn(!expandedBuiltIn)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Built-in Fields</span>
                  {expandedBuiltIn ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {expandedBuiltIn && (
                  <div className="pb-2">
                    {getVisibleFieldTypes().map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => onAddField(key)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors group"
                        style={{
                          borderLeft: '3px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftColor = COLORS.primary;
                          e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftColor = 'transparent';
                          e.currentTarget.style.backgroundColor = '';
                        }}
                      >
                        <span className="text-gray-600">{value.icon}</span>
                        <span className="text-sm text-gray-900 flex-1">{value.label}</span>
                        <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Library Fields */}
              {libraries.map(library => {
                const libraryFields = getFieldsForLibrary(library.id);
                return (
                  <div key={library.id} className="border-b border-gray-200">
                    <button
                      onClick={() => toggleLibrary(library.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{library.name}</span>
                      {expandedLibraries.has(library.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedLibraries.has(library.id) && (
                      <div className="pb-2">
                        {libraryFields.length === 0 ? (
                          <div className="px-4 py-2 text-xs text-gray-500 italic">
                            No fields in this library
                          </div>
                        ) : (
                          libraryFields.map(field => {
                            const fieldTypeInfo = fieldTypes[field.baseType];
                            return (
                              <button
                                key={field.id}
                                onClick={() => onAddCustomField(field)}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors group"
                                style={{
                                  borderLeft: '3px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderLeftColor = COLORS.primary;
                                  e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderLeftColor = 'transparent';
                                  e.currentTarget.style.backgroundColor = '';
                                }}
                              >
                                <span className="text-gray-600">
                                  {fieldTypeInfo?.icon || <span>•</span>}
                                </span>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="text-sm text-gray-900">{field.name}</div>
                                  {field.description && (
                                    <div className="text-xs text-gray-500 truncate">{field.description}</div>
                                  )}
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Collapsed View */
        <div className="flex flex-col h-full">
          {/* Expand Button */}
          <div className="p-3 border-b border-gray-200 flex justify-center">
            <button
              onClick={() => {
                setIsCollapsed(false);
                onCollapsedChange?.(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Collapsed Icons */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {/* Field count indicator */}
            <div className="flex justify-center py-2 border-b border-gray-200">
              <div className="relative">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {fields.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center" 
                    style={{ backgroundColor: COLORS.primary, fontSize: '8px', color: 'white' }}>
                    {fields.length}
                  </div>
                )}
              </div>
            </div>

            {/* Built-in indicator */}
            <div className="flex justify-center py-2 border-b border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            
            {/* Library indicators */}
            {libraries.map((library, index) => (
              <div key={library.id} className={`flex justify-center py-2 ${index < libraries.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
