import { useState } from 'react';
import { ChevronDown, Info, Search, Library, List, GitBranch, Database, Eye } from 'lucide-react';

interface ControlledTermConfigProps {
  field: {
    id: number;
    name: string;
    type: string;
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
      restrictedOntologies?: string[];
    };
  };
  onUpdate: (fieldId: number, config: any) => void;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function ControlledTermConfig({ field, onUpdate, COLORS }: ControlledTermConfigProps) {
  const config = field.controlledTermConfig || {
    sourceType: 'ontology-term',
    sourceId: '',
    sourceName: '',
    ontologyId: '',
    ontologyName: '',
    allowMultipleOntologies: false,
    searchDepth: 1,
    restrictedOntologies: []
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sourceTypes = [
    {
      id: 'ontology-term' as const,
      label: 'Search for a Term',
      description: 'Users search BioPortal for specific terms',
      icon: <Database className="w-4 h-4" />,
      color: '#0D9488',
      example: 'e.g., "cardiac arrest", "melanoma"',
      searchLabel: 'Search for a term in BioPortal (e.g. \'microarray analysis\')'
    },
    {
      id: 'ontology' as const,
      label: 'Search for an Ontology',
      description: 'Users select entire ontologies to explore',
      icon: <Library className="w-4 h-4" />,
      color: '#7C3AED',
      example: 'e.g., NCIT, SNOMED CT, Disease Ontology',
      searchLabel: 'Search for an ontology in BioPortal (e.g. OBI) and explore it'
    },
    {
      id: 'value-set' as const,
      label: 'Search for a Value Set',
      description: 'Users select from predefined collections',
      icon: <List className="w-4 h-4" />,
      color: '#DC2626',
      example: 'e.g., \'Delivery Procedures\'',
      searchLabel: 'Search for a value set in BioPortal (e.g. \'Delivery Procedures\') and explore it'
    },
    {
      id: 'ontology-branch' as const,
      label: 'Ontology Branch',
      description: 'Restrict to subtree of an ontology',
      icon: <GitBranch className="w-4 h-4" />,
      color: '#059669',
      example: 'e.g., All types of "Carcinoma"',
      searchLabel: 'Search within a specific branch of an ontology'
    }
  ];

  const currentSourceType = sourceTypes.find(t => t.id === config.sourceType) || sourceTypes[0];

  const updateConfig = (updates: Partial<typeof config>) => {
    onUpdate(field.id, {
      ...config,
      ...updates
    });
  };

  return (
    <div className="space-y-3 px-1 mb-3">
      {/* Title with Preview Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
          BioPortal Configuration
        </label>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 space-y-3">
          <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            User Experience Preview
          </div>
          
          {/* Mock Search Interface */}
          <div className="bg-white rounded-md border border-gray-300 p-3 space-y-2.5">
            <div className="text-xs text-gray-600">
              Find terms in BioPortal or{' '}
              <span className="text-teal-600 font-medium cursor-pointer hover:underline">
                Create New Terms
              </span>{' '}
              to constrain the values of the '{field.name}' field
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search in BioPortal"
                disabled
                className="w-full text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1.5 pr-16 text-gray-500"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <Search className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Advanced Search Options */}
            <div className="border border-gray-200 rounded p-2.5 bg-gray-50">
              <div className="text-xs font-medium text-teal-700 mb-2">Advanced Search Options</div>
              <div className="space-y-2 text-xs">
                <div className="text-gray-600 font-medium mb-1.5">I want to...</div>
                
                {sourceTypes.slice(0, 3).map((type) => (
                  <label 
                    key={type.id}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <div className="mt-0.5">
                      <div 
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          config.sourceType === type.id 
                            ? 'border-teal-600' 
                            : 'border-gray-300'
                        }`}
                      >
                        {config.sourceType === type.id && (
                          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 leading-tight">
                      {type.searchLabel}
                    </span>
                  </label>
                ))}

                {/* Narrow Search Section */}
                {config.sourceType === 'ontology-term' && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="text-gray-600 font-medium mb-1.5">
                      Narrow your search to specific ontologies
                    </div>
                    <div className="bg-white border border-gray-300 rounded px-2 py-1.5 text-gray-400 text-xs">
                      {config.restrictedOntologies && config.restrictedOntologies.length > 0
                        ? config.restrictedOntologies.join(', ')
                        : 'Add ontologies'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sample Results Preview */}
            <div className="text-xs text-center text-gray-500 italic py-2">
              Search results will appear as a table with Term, Definition, Type, Source, and ID
            </div>
          </div>
        </div>
      )}

      {/* Source Type Selector */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-1.5">
          <span>Search Mode</span>
          <div className="relative group/info">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/info:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50">
              <div className="font-semibold mb-1.5">Select how users find terms</div>
              <div className="space-y-1.5 text-gray-300">
                <div><strong>Term:</strong> Free search across ontologies</div>
                <div><strong>Ontology:</strong> Browse specific vocabulary</div>
                <div><strong>Value Set:</strong> Choose from collection</div>
                <div><strong>Branch:</strong> Limit to subtree</div>
              </div>
              <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {sourceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateConfig({ sourceType: type.id })}
              className={`relative p-3 rounded-lg border-2 transition-all text-left group hover:shadow-md ${
                config.sourceType === type.id
                  ? 'border-current shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: config.sourceType === type.id ? type.color : undefined,
                backgroundColor: config.sourceType === type.id 
                  ? `${type.color}08` 
                  : 'white'
              }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <div 
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: type.color }}
                >
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">
                    {type.description}
                  </div>
                </div>
                {config.sourceType === type.id && (
                  <svg 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: type.color }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-gray-500 italic truncate">
                {type.example}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration based on source type */}
      <div className="space-y-3">
        {/* Ontology Term Configuration */}
        {config.sourceType === 'ontology-term' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Restrict to Specific Ontologies (Optional)
              </label>
              <input
                type="text"
                value={config.restrictedOntologies?.join(', ') || ''}
                onChange={(e) => updateConfig({ 
                  restrictedOntologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., NCIT, DOID, CL (comma-separated)"
                className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{
                  focusRing: `2px solid ${COLORS.primary}33`
                }}
              />
              <p className="text-xs text-gray-500 mt-1 italic">
                Leave empty to allow searching across all BioPortal ontologies
              </p>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-teal-800">
                  <div className="font-medium mb-1">User Experience:</div>
                  Users will see a search box and can search for any term. Results will show Term, Definition, Type, Source, and ID in a table format.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ontology Configuration */}
        {config.sourceType === 'ontology' && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Default Ontology (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.ontologyName || ''}
                onChange={(e) => updateConfig({ ontologyName: e.target.value, sourceName: e.target.value })}
                placeholder="e.g., NCIT, SNOMED CT, GO"
                className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-9 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2.5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-purple-800">
                  <div className="font-medium mb-1">User Experience:</div>
                  Users will search for and select entire ontologies to explore their complete term hierarchy.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Value Set Configuration */}
        {config.sourceType === 'value-set' && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Value Set Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.sourceId || ''}
                onChange={(e) => updateConfig({ sourceId: e.target.value })}
                placeholder="e.g., Delivery Procedures"
                className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-9 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2.5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-800">
                  <div className="font-medium mb-1">User Experience:</div>
                  Users will search for predefined value sets and explore the curated collection of terms within them.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ontology Branch Configuration */}
        {config.sourceType === 'ontology-branch' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Ontology
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.ontologyName || ''}
                  onChange={(e) => updateConfig({ ontologyName: e.target.value })}
                  placeholder="e.g., DOID, NCIT"
                  className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-9 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Root Term (Branch Starting Point)
              </label>
              <input
                type="text"
                value={config.branchRootName || ''}
                onChange={(e) => updateConfig({ branchRootName: e.target.value })}
                placeholder="e.g., Carcinoma, Immune System Disease"
                className="text-sm w-full bg-white border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <span>Hierarchy Depth</span>
                <div className="relative group/info">
                  <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/info:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-50">
                    How many levels deep to include in the hierarchy
                    <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                  </div>
                </div>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.searchDepth || 1}
                  onChange={(e) => updateConfig({ searchDepth: parseInt(e.target.value) })}
                  className="flex-1"
                  style={{
                    accentColor: COLORS.primary
                  }}
                />
                <div className="text-sm font-semibold text-gray-700 w-8 text-right">
                  {config.searchDepth || 1}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Direct children</span>
                <span>All descendants</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-800">
                  <div className="font-medium mb-1">User Experience:</div>
                  Users can only select terms from the specified branch (root term and its descendants up to {config.searchDepth || 1} level{(config.searchDepth || 1) > 1 ? 's' : ''} deep).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>Advanced Options</span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-2.5 pl-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded checkbox-white"
                style={{
                  accentColor: COLORS.primary
                }}
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">
                Include deprecated terms in search results
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded checkbox-white"
                style={{
                  accentColor: COLORS.primary
                }}
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">
                Allow users to create new terms if not found
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded checkbox-white"
                style={{
                  accentColor: COLORS.primary
                }}
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">
                Display term IDs in search results
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded checkbox-white"
                style={{
                  accentColor: COLORS.primary
                }}
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">
                Show term definitions in results
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      <div 
        className="rounded-lg p-3 border-l-4"
        style={{
          backgroundColor: `${currentSourceType.color}08`,
          borderLeftColor: currentSourceType.color
        }}
      >
        <div className="flex items-start gap-2.5">
          <div 
            className="flex-shrink-0 mt-0.5"
            style={{ color: currentSourceType.color }}
          >
            {currentSourceType.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 mb-0.5">
              Current: {currentSourceType.label}
            </div>
            <div className="text-xs text-gray-600">
              {config.sourceType === 'ontology-term' && (
                config.restrictedOntologies && config.restrictedOntologies.length > 0
                  ? `Restricted to: ${config.restrictedOntologies.join(', ')}`
                  : 'Open search across all ontologies'
              )}
              {config.sourceType === 'ontology' && (
                config.ontologyName || 'No default ontology set'
              )}
              {config.sourceType === 'value-set' && (
                config.sourceId || 'No value set configured'
              )}
              {config.sourceType === 'ontology-branch' && (
                config.branchRootName && config.ontologyName
                  ? `${config.branchRootName} from ${config.ontologyName}`
                  : 'Configure ontology and root term'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
