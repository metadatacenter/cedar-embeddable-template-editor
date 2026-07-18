export interface ValidationRule {
  id: number;
  type: string;
  pattern: string;
  errorMessage: string;
}

export interface CustomField {
  id: number;
  name: string;
  icon: string;
  baseType: string;
  libraryId: number;
  description: string;
  placeholder: string;
  validationRules: ValidationRule[];
}

export interface Library {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface ControlledTermConfig {
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
}


export interface Field {
  id: number;
  type: string;
  name: string;
  status: string; // 'required' | 'optional' | 'recommended'
  options: string[];
  defaultValue: string;
  allowMultiple: boolean;
  helpText?: string;
  customFieldId?: number;
  libraryId?: number;
  controlledTermConfig?: ControlledTermConfig;
}
