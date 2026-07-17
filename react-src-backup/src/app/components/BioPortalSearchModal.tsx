import { useState, useEffect, useCallback } from 'react';
import { X, Search, Settings, Plus, Loader2, AlertCircle, Info } from 'lucide-react';

interface BioPortalResult {
  '@id': string;
  prefLabel: string;
  definition?: string[];
  '@type'?: string;
  links?: {
    ontology?: string;
  };
  ontologyAcronym?: string;
  ontologyName?: string;
}

interface BioPortalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (term: BioPortalResult) => void;
  fieldName: string;
  config?: {
    sourceType: 'ontology-term' | 'ontology' | 'value-set' | 'ontology-branch';
    restrictedOntologies?: string[];
    ontologyName?: string;
    sourceId?: string;
    branchRootName?: string;
  };
  apiKey: string;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function BioPortalSearchModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  fieldName,
  config,
  apiKey,
  COLORS 
}: BioPortalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'term' | 'ontology' | 'value-set'>(
    config?.sourceType === 'ontology' ? 'ontology' :
    config?.sourceType === 'value-set' ? 'value-set' : 'term'
  );
  const [results, setResults] = useState<BioPortalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOntologies, setSelectedOntologies] = useState<string[]>(config?.restrictedOntologies || []);
  const [ontologyInput, setOntologyInput] = useState('');

  useEffect(() => {
    if (config?.sourceType === 'ontology') {
      setSearchMode('ontology');
    } else if (config?.sourceType === 'value-set') {
      setSearchMode('value-set');
    } else {
      setSearchMode('term');
    }
  }, [config?.sourceType]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (!apiKey) {
      setError('Please configure your BioPortal API key in the user menu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scope = searchMode === 'value-set' ? 'value_sets' : 'classes,values';
      let url = `https://terminology.metadatacenter.org/bioportal/search?q=${encodeURIComponent(searchQuery)}&scope=${scope}&page=1&page_size=50`;
      
      // Add ontology restrictions if in term search mode
      if (searchMode === 'term' && selectedOntologies.length > 0) {
        url += `&ontologies=${selectedOntologies.join(',')}`;
      }

      console.log('Searching BioPortal:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `apikey token=${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your BioPortal API key in settings.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Please verify your API key has the correct permissions.');
        }
        const errorText = await response.text();
        throw new Error(`Search failed (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      // BioPortal returns results in a "collection" array
      const resultsArray = data.collection || [];
      setResults(resultsArray);

      if (resultsArray.length === 0) {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // More detailed error messages
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // FALLBACK: Use mock data for demo purposes due to CORS restrictions
        const mockResults = getMockResults(searchQuery);
        if (mockResults.length > 0) {
          setResults(mockResults);
          setError('Note: Showing demo results. Live BioPortal search blocked by CORS restrictions in published environments. The search will work when using a proper backend proxy.');
        } else {
          setError('Network error: Unable to connect to BioPortal. This may be due to CORS restrictions when running in published environments. Try testing locally or use a backend proxy.');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search BioPortal');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchMode, selectedOntologies, apiKey]);

  // Mock results for demo purposes
  const getMockResults = (query: string): BioPortalResult[] => {
    const lowerQuery = query.toLowerCase();
    
    // Mock results for common medical terms
    const mockData: Record<string, BioPortalResult[]> = {
      'cardiac': [
        {
          '@id': 'http://purl.bioontology.org/ontology/SNOMEDCT/410429000',
          prefLabel: 'Cardiac arrest',
          definition: ['Sudden cessation of cardiac output and effective circulation'],
          '@type': 'Class',
          ontologyAcronym: 'SNOMEDCT',
          ontologyName: 'SNOMED CT'
        },
        {
          '@id': 'http://purl.bioontology.org/ontology/SNOMEDCT/80891009',
          prefLabel: 'Heart disease',
          definition: ['Pathological process involving the heart'],
          '@type': 'Class',
          ontologyAcronym: 'SNOMEDCT',
          ontologyName: 'SNOMED CT'
        }
      ],
      'diabetes': [
        {
          '@id': 'http://purl.bioontology.org/ontology/SNOMEDCT/73211009',
          prefLabel: 'Diabetes mellitus',
          definition: ['A metabolic disorder characterized by abnormally high blood sugar levels'],
          '@type': 'Class',
          ontologyAcronym: 'SNOMEDCT',
          ontologyName: 'SNOMED CT'
        }
      ],
      'cancer': [
        {
          '@id': 'http://purl.obolibrary.org/obo/DOID_162',
          prefLabel: 'Cancer',
          definition: ['A disease of cellular proliferation that is malignant'],
          '@type': 'Class',
          ontologyAcronym: 'DOID',
          ontologyName: 'Human Disease Ontology'
        }
      ]
    };

    // Find matching results
    for (const [key, results] of Object.entries(mockData)) {
      if (lowerQuery.includes(key)) {
        return results;
      }
    }

    // Return generic result for any search
    return [
      {
        '@id': `http://example.org/term/${encodeURIComponent(query)}`,
        prefLabel: query.charAt(0).toUpperCase() + query.slice(1),
        definition: [`Demo result for: ${query}`],
        '@type': 'Class',
        ontologyAcronym: 'DEMO',
        ontologyName: 'Demo Ontology'
      }
    ];
  };

  // Auto-search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || !apiKey) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMode, selectedOntologies, apiKey, performSearch]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const addOntology = () => {
    if (ontologyInput.trim() && !selectedOntologies.includes(ontologyInput.trim().toUpperCase())) {
      setSelectedOntologies([...selectedOntologies, ontologyInput.trim().toUpperCase()]);
      setOntologyInput('');
    }
  };

  const removeOntology = (ontology: string) => {
    setSelectedOntologies(selectedOntologies.filter(o => o !== ontology));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input value:', value, 'Length:', value.length);
    setSearchQuery(value);
  };

  console.log('Modal rendering, searchQuery:', searchQuery);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">BioPortal Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Find terms in BioPortal or{' '}
            <span className="text-teal-600 font-medium cursor-pointer hover:underline">
              Create New Terms
            </span>{' '}
            to constrain the values of the '{fieldName}' field
          </p>
          {/* DEBUG INFO */}
          <div className="mt-2 text-xs bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
            <strong>Debug:</strong> Query length: {searchQuery.length} | Value: "{searchQuery}" | API Key: {apiKey ? 'Set' : 'NOT SET'} | Loading: {loading ? 'YES' : 'NO'}
          </div>
        </div>

        {/* Search Form */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search in BioPortal (e.g., cardiac arrest)"
                autoFocus
                className="w-full px-4 py-2.5 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="Advanced options"
                >
                  <Settings className="w-4 h-4 text-teal-600" />
                </button>
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Search Options */}
            {showAdvanced && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="text-xs font-medium text-teal-700 mb-3">Advanced Search Options</div>
                
                <div className="space-y-2.5 text-xs">
                  <div className="text-gray-600 font-medium mb-2">I want to...</div>
                  
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={searchMode === 'term'}
                      onChange={() => setSearchMode('term')}
                      className="mt-0.5"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <span className="text-gray-700 leading-tight">
                      Search for a term in BioPortal (e.g. 'microarray analysis')
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={searchMode === 'ontology'}
                      onChange={() => setSearchMode('ontology')}
                      className="mt-0.5"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <span className="text-gray-700 leading-tight">
                      Search for an ontology in BioPortal (e.g. OBI) and explore it
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchMode"
                      checked={searchMode === 'value-set'}
                      onChange={() => setSearchMode('value-set')}
                      className="mt-0.5"
                      style={{ accentColor: COLORS.primary }}
                    />
                    <span className="text-gray-700 leading-tight">
                      Search for a value set in BioPortal (e.g. 'Delivery Procedures') and explore it
                    </span>
                  </label>

                  {/* Narrow Search for Terms */}
                  {searchMode === 'term' && (
                    <div className="pt-2.5 mt-2.5 border-t border-gray-200">
                      <div className="text-gray-600 font-medium mb-2">
                        Narrow your search to specific ontologies
                      </div>
                      
                      {/* Selected Ontologies */}
                      {selectedOntologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {selectedOntologies.map(ont => (
                            <span
                              key={ont}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs"
                            >
                              {ont}
                              <button
                                type="button"
                                onClick={() => removeOntology(ont)}
                                className="hover:text-teal-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add Ontology Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ontologyInput}
                          onChange={(e) => setOntologyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOntology();
                            }
                          }}
                          placeholder="Add ontology (e.g., NCIT, DOID)"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={addOntology}
                          className="px-3 py-1.5 text-white rounded text-xs flex items-center gap-1"
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* No API Key Warning */}
          {!apiKey && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <div className="font-medium mb-1">API Key Required</div>
                  <p>Please configure your BioPortal API key in the user menu to enable search.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <div className="font-medium">Error</div>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: COLORS.primary }} />
                <p className="text-sm text-gray-600">Searching BioPortal...</p>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-3">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              
              {/* Results Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Term</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Definition</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Source</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {result.prefLabel || 'Unnamed'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          <div className="line-clamp-2 text-xs">
                            {result.definition?.[0] || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {result['@type'] || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                          {result.ontologyAcronym || result.ontologyName || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[120px]" title={result['@id']}>
                          {result['@id']?.split('/').pop() || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onSelect(result)}
                            className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term or check your spelling</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Enter a search term to find results in BioPortal</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}