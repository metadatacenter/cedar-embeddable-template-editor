// SHIM: This file belongs in @metadatacenter/cedar-model once the cedar-ts repo
// ships a JSON-LD serializer. Remove this entire cedar-shim/ folder and update
// the single import in index.ts to point to the npm package instead.
//
// Types reflect the CEDAR 1.6.0 JSON-LD production format used by CEDAR Workbench.

export interface CedarFieldContext {
  'schema:name': string;
  'schema:description': string;
  'pav:createdOn': string;
  'pav:createdBy': string;
  'pav:lastUpdatedOn': string;
  'oslc:modifiedBy': string;
  'skos:prefLabel': string;
  'skos:altLabel': string;
  'pav:version': string;
  'bibo:status': string;
  '@type': string;
  'schema:identifier': string;
}

export interface CedarFieldValueConstraints {
  requiredValue: boolean;
  multipleChoice?: boolean;
  minLength?: number;
  maxLength?: number;
  numberType?: 'xsd:decimal' | 'xsd:integer' | 'xsd:float' | 'xsd:double';
  minValue?: number;
  maxValue?: number;
  decimalPlace?: number;
  unitOfMeasure?: string;
  temporalType?: 'xsd:date' | 'xsd:time' | 'xsd:dateTime';
  defaultValue?: string;
  literals?: Array<{ label: string; selectedByDefault?: boolean }>;
  ontologies?: Array<{ uri: string; acronym: string; name: string }>;
  valueSets?: Array<{ uri: string; name: string; vsCollection: string }>;
  classes?: Array<{ uri: string; prefLabel: string; type: string; label: string; source: string }>;
  branches?: Array<{ source: string; acronym: string; ontologyName: string; uri: string; maxDepth: number }>;
}

export interface CedarFieldUi {
  inputType: string;
  hidden?: boolean;
  temporalGranularity?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'decimalSecond';
  timezoneEnabled?: boolean;
  inputTimeFormat?: '12h' | '24h';
}

export interface CedarField {
  '@context': Partial<CedarFieldContext>;
  '@type': 'https://schema.metadatacenter.org/core/TemplateField';
  '@id'?: string;
  'schema:identifier'?: string;
  'schema:name': string;
  'schema:description': string;
  'skos:prefLabel'?: string;
  'pav:createdOn'?: string | null;
  'pav:createdBy'?: string | null;
  'pav:lastUpdatedOn'?: string | null;
  'oslc:modifiedBy'?: string | null;
  'schema:schemaVersion': '1.6.0';
  'pav:version': string;
  'bibo:status': 'bibo:draft';
  _ui: CedarFieldUi;
  _valueConstraints: CedarFieldValueConstraints;
  title: string;
  description: string;
  type: 'object';
  properties: {
    '@type'?: { oneOf: [{ type: 'string'; format: 'uri' }, { type: 'array'; items: { type: 'string'; format: 'uri' }; uniqueItems: boolean }] };
    '@value'?: { type: Array<'string' | 'null'> };
    '@id'?: { type: 'string'; format: 'uri' };
    'rdfs:label'?: { type: Array<'string' | 'null'> };
  };
  required?: string[];
  additionalProperties?: boolean;
}

export interface CedarTemplateUi {
  order: string[];
  propertyLabels: Record<string, string>;
  propertyDescriptions: Record<string, string>;
  header?: string;
  footer?: string;
}

export interface CedarTemplateProperties {
  '@context': {
    type: 'object';
    properties: Record<string, { enum: string[] }>;
    required: string[];
    additionalProperties: boolean;
  };
  '@id': { type: 'string'; format: 'uri' };
  [fieldKey: string]: CedarField | object;
}

export interface CedarTemplate {
  '@context': Record<string, string | object>;
  '@type': 'https://schema.metadatacenter.org/core/Template';
  '@id': string;
  'schema:identifier': string;
  'schema:name': string;
  'schema:description': string;
  'pav:createdOn': string | null;
  'pav:createdBy': string | null;
  'pav:lastUpdatedOn': string | null;
  'oslc:modifiedBy': string | null;
  'schema:schemaVersion': '1.6.0';
  'pav:version': string;
  'bibo:status': 'bibo:draft';
  _ui: CedarTemplateUi;
  _valueConstraints: Record<string, never>;
  properties: CedarTemplateProperties;
  required: string[];
  title: string;
  description: string;
  type: 'object';
  additionalProperties?: boolean;
}
