import { Injectable, signal, effect } from '@angular/core';
import { Field, Library, CustomField, ControlledTermConfig } from '../types';

export interface UserPreferences {
  showRequired: boolean;
  showAllowMultiple: boolean;
  showHelpText: boolean;
  showDefaultValue: boolean;
  showFieldDesigner: boolean;
  showElements: boolean;
  fieldSelectionStyle: 'modal' | 'sidebar';
  visibleFieldTypes: Record<string, boolean>;
}

export interface PresetDefinition {
  showRequired: boolean;
  showAllowMultiple: boolean;
  showHelpText: boolean;
  showDefaultValue: boolean;
  showFieldDesigner: boolean;
  showElements: boolean;
  hiddenFieldTypes: string[];
}

export interface PresetDefinitions {
  basic: PresetDefinition;
  semantic: PresetDefinition;
  modular: PresetDefinition;
}

export const FIELD_TYPES: Record<string, { label: string; preview: string }> = {
  text: { label: 'Text', preview: 'Short answer text' },
  paragraph: { label: 'Paragraph', preview: 'Long answer text' },
  multipleChoice: { label: 'Multiple Choice', preview: 'Radio buttons' },
  checkboxes: { label: 'Checkboxes', preview: 'Multiple selection' },
  date: { label: 'Date', preview: 'Date picker' },
  time: { label: 'Time', preview: 'Time picker' },
  email: { label: 'Email', preview: 'Email address' },
  link: { label: 'Link', preview: 'URL' },
  phone: { label: 'Phone', preview: 'Phone number' },
  number: { label: 'Number', preview: 'Numeric value' },
  image: { label: 'Image', preview: 'File upload' },
  orcid: { label: 'ORCID', preview: 'Research identifier' },
  controlledTerms: { label: 'Controlled Terms', preview: 'Controlled vocabulary' }
};

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  // Cedar green color palette
  readonly COLORS = {
    primary: '#2D6F5F',      // Cedar green
    primaryHover: '#245A4D',
    primaryLight: '#E8F3F0',
    border: '#3B7A5D'
  };

  // State Signals
  readonly templateName = signal<string>('Untitled Template');
  readonly templateDesc = signal<string>('');
  readonly bioportalApiKey = signal<string>(localStorage.getItem('bioportalApiKey') || '');
  
  readonly fields = signal<Field[]>([
    { id: 1, type: 'text', name: 'Title', status: 'required', options: [], defaultValue: '', allowMultiple: false },
    { id: 2, type: 'multipleChoice', name: 'Category', status: 'optional', options: ['Option 1', 'Option 2'], defaultValue: '', allowMultiple: false },
    { id: 3, type: 'date', name: 'Publication Date', status: 'optional', options: [], defaultValue: '', allowMultiple: false }
  ]);

  readonly libraries = signal<Library[]>([]);
  readonly customFields = signal<CustomField[]>([]);
  readonly selectedLibraryId = signal<number | null>(null);
  readonly sidebarCollapsed = signal<boolean>(false);

  // Modal & Navigation States
  readonly showPicker = signal<number | null>(null);
  readonly showPreview = signal<boolean>(false);
  readonly showFieldDesigner = signal<boolean>(false);
  readonly selectedField = signal<number | null>(null);
  readonly fieldTypeDropdown = signal<number | null>(null);
  readonly fieldTypeDropdownLibrary = signal<number | null>(null);
  
  readonly showPreferencesModal = signal<boolean>(false);
  readonly showPresetDefinitionsModal = signal<boolean>(false);
  readonly showUserMenu = signal<boolean>(false);
  readonly showApiKeyModal = signal<boolean>(false);

  // Preset Definitions
  readonly presetDefinitions = signal<PresetDefinitions>({
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

  // User Preferences
  readonly preferences = signal<UserPreferences>({
    showRequired: true,
    showAllowMultiple: true,
    showHelpText: false,
    showDefaultValue: false,
    showFieldDesigner: false,
    showElements: false,
    fieldSelectionStyle: 'modal',
    visibleFieldTypes: Object.keys(FIELD_TYPES).reduce((acc, key) => {
      acc[key] = key !== 'controlledTerms';
      return acc;
    }, {} as Record<string, boolean>)
  });

  constructor() {
    // Save API key to localStorage when it changes
    effect(() => {
      const key = this.bioportalApiKey();
      if (key) {
        localStorage.setItem('bioportalApiKey', key);
      } else {
        localStorage.removeItem('bioportalApiKey');
      }
    });

    // Sync all field types into preferences to ensure nothing is missing
    const currentFieldTypes = Object.keys(FIELD_TYPES);
    this.preferences.update(prev => {
      const updatedVisibleFieldTypes = { ...prev.visibleFieldTypes };
      let hasChanges = false;
      
      currentFieldTypes.forEach(key => {
        if (!(key in updatedVisibleFieldTypes)) {
          updatedVisibleFieldTypes[key] = true;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        return {
          ...prev,
          visibleFieldTypes: updatedVisibleFieldTypes
        };
      }
      return prev;
    });
  }

  // Field manipulation methods
  addField(type: string, position: number) {
    const newField: Field = {
      id: Date.now(),
      type,
      name: FIELD_TYPES[type].label,
      status: 'optional',
      options: type === 'multipleChoice' || type === 'checkboxes' ? ['Option 1'] : [],
      defaultValue: '',
      allowMultiple: false
    };

    this.fields.update(prev => {
      const updated = [...prev];
      updated.splice(position, 0, newField);
      return updated;
    });

    this.showPicker.set(null);
    this.selectedField.set(newField.id);

    // Scroll to the new field (handled by components subscribing or looking at this state)
    setTimeout(() => {
      const el = document.getElementById(`field-card-${newField.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  addCustomFieldToTemplate(customField: CustomField, position: number) {
    const newField: Field = {
      id: Date.now(),
      type: customField.baseType,
      name: customField.name,
      status: 'optional',
      options: customField.baseType === 'multipleChoice' || customField.baseType === 'checkboxes' ? ['Option 1'] : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: customField.id,
      libraryId: customField.libraryId
    };

    this.fields.update(prev => {
      const updated = [...prev];
      updated.splice(position, 0, newField);
      return updated;
    });

    this.showPicker.set(null);
    this.selectedField.set(newField.id);

    setTimeout(() => {
      const el = document.getElementById(`field-card-${newField.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  deleteField(id: number) {
    this.fields.update(prev => prev.filter(f => f.id !== id));
    if (this.selectedField() === id) {
      this.selectedField.set(null);
    }
  }

  updateFieldName(id: number, name: string) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }

  updateFieldType(id: number, type: string) {
    this.fields.update(prev => prev.map(f => f.id === id ? {
      ...f,
      type,
      options: type === 'multipleChoice' || type === 'checkboxes' ? (f.options.length > 0 ? f.options : ['Option 1']) : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: undefined,
      libraryId: undefined
    } : f));
  }

  convertFieldToCustomField(fieldId: number, customField: CustomField) {
    this.fields.update(prev => prev.map(f => f.id === fieldId ? {
      ...f,
      type: customField.baseType,
      name: customField.name,
      options: customField.baseType === 'multipleChoice' || customField.baseType === 'checkboxes' ? (f.options.length > 0 ? f.options : ['Option 1']) : [],
      defaultValue: '',
      allowMultiple: false,
      customFieldId: customField.id,
      libraryId: customField.libraryId
    } : f));
  }

  updateFieldStatus(id: number, status: string) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  }

  updateOption(fieldId: number, optionIndex: number, value: string) {
    this.fields.update(prev => prev.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...f.options];
        newOptions[optionIndex] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  }

  addOption(fieldId: number) {
    this.fields.update(prev => prev.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      }
      return f;
    }));
  }

  deleteOption(fieldId: number, optionIndex: number) {
    this.fields.update(prev => prev.map(f => {
      if (f.id === fieldId) {
        const newOptions = f.options.filter((_, index) => index !== optionIndex);
        return { ...f, options: newOptions.length > 0 ? newOptions : ['Option 1'] };
      }
      return f;
    }));
  }

  updateDefaultValue(id: number, value: string) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, defaultValue: value } : f));
  }

  toggleAllowMultiple(id: number) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, allowMultiple: !f.allowMultiple } : f));
  }

  updateHelpText(id: number, helpText: string) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, helpText } : f));
  }

  updateControlledTermConfig(id: number, config: ControlledTermConfig) {
    this.fields.update(prev => prev.map(f => f.id === id ? { ...f, controlledTermConfig: config } : f));
  }

  moveField(dragIndex: number, hoverIndex: number) {
    this.fields.update(prev => {
      const updated = [...prev];
      const dragField = updated[dragIndex];
      updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, dragField);
      return updated;
    });
  }

  // Preferences manipulation methods
  updatePreference(key: keyof UserPreferences, value: any) {
    this.preferences.update(prev => ({
      ...prev,
      [key]: value
    }));
  }

  updateFieldTypeVisibility(fieldType: string, visible: boolean) {
    this.preferences.update(prev => ({
      ...prev,
      visibleFieldTypes: {
        ...prev.visibleFieldTypes,
        [fieldType]: visible
      }
    }));
  }

  toggleAllFieldTypes(visible: boolean) {
    const updatedVisibility: Record<string, boolean> = {};
    Object.keys(FIELD_TYPES).forEach(key => {
      updatedVisibility[key] = visible;
    });
    this.preferences.update(prev => ({
      ...prev,
      visibleFieldTypes: updatedVisibility
    }));
  }

  applyPreset(preset: 'basic' | 'semantic' | 'modular') {
    const definition = this.presetDefinitions()[preset];
    const visibleFieldTypes = Object.keys(FIELD_TYPES).reduce((acc, key) => {
      acc[key] = !definition.hiddenFieldTypes.includes(key);
      return acc;
    }, {} as Record<string, boolean>);

    this.preferences.update(prev => ({
      ...prev,
      showRequired: definition.showRequired,
      showAllowMultiple: definition.showAllowMultiple,
      showHelpText: definition.showHelpText,
      showDefaultValue: definition.showDefaultValue,
      showFieldDesigner: definition.showFieldDesigner,
      showElements: definition.showElements,
      visibleFieldTypes
    }));
  }

  // Checks which preset matches current preferences configuration
  getActivePreset(): 'basic' | 'semantic' | 'modular' | null {
    const current = this.preferences();
    const definitions = this.presetDefinitions();
    
    for (const preset of ['basic', 'semantic', 'modular'] as const) {
      const def = definitions[preset];
      const matchConfig = 
        current.showRequired === def.showRequired &&
        current.showAllowMultiple === def.showAllowMultiple &&
        current.showHelpText === def.showHelpText &&
        current.showDefaultValue === def.showDefaultValue &&
        current.showFieldDesigner === def.showFieldDesigner &&
        current.showElements === def.showElements;

      if (!matchConfig) continue;

      // Check hidden field types
      const hiddenMatches = Object.keys(FIELD_TYPES).every(key => {
        const isHiddenInPref = !current.visibleFieldTypes[key];
        const isHiddenInDef = def.hiddenFieldTypes.includes(key);
        return isHiddenInPref === isHiddenInDef;
      });

      if (hiddenMatches) {
        return preset;
      }
    }
    return null;
  }
}
