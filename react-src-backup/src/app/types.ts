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
