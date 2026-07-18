import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService, FIELD_TYPES } from '../../core/services/template.service';
import { Field } from '../../core/models/types';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BioPortalSearchModalComponent, BioPortalResult } from '../modals/bioportal-search/bioportal-search.component';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BioPortalSearchModalComponent],
  template: `
    <div class="h-full overflow-y-auto p-8 bg-gray-50 custom-scrollbar relative">
      <!-- Preview Header with Close Button -->
      <div class="absolute top-8 right-8 flex items-center gap-3 z-10">
        <span class="text-sm font-medium text-gray-600">Preview</span>
        <button
          (click)="service.showPreview.set(false)"
          class="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
          title="Close preview"
        >
          <app-icon key="settings" className="w-4 h-4 text-gray-600 rotate-45"></app-icon>
        </button>
      </div>
      
      <div class="max-w-2xl mx-auto">
        <!-- Form Title and Description -->
        <div class="mb-8">
          <h1 class="text-lg font-medium text-gray-900 mb-2">{{ service.templateName() }}</h1>
          <p *ngIf="service.templateDesc()" class="text-gray-600">{{ service.templateDesc() }}</p>
        </div>

        <!-- Form Fields -->
        <div class="space-y-6">
          <div *ngFor="let field of service.fields()" class="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <!-- Field Label -->
            <label class="block">
              <div class="mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900">{{ field.name }}</span>
                  <span 
                    *ngIf="field.status === 'required'" 
                    class="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800"
                  >
                    Required
                  </span>
                  <span 
                    *ngIf="field.status === 'recommended'" 
                    class="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800"
                  >
                    Recommended
                  </span>
                </div>
                <p *ngIf="field.helpText" class="text-xs text-gray-500 mt-1">{{ field.helpText }}</p>
              </div>

              <!-- Field Input Based on Type -->
              <!-- Text -->
              <ng-container *ngIf="field.type === 'text'">
                <input 
                  type="text" 
                  [placeholder]="field.defaultValue || getFieldPreviewLabel(field.type)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Paragraph -->
              <ng-container *ngIf="field.type === 'paragraph'">
                <textarea 
                  rows="4"
                  [placeholder]="field.defaultValue || getFieldPreviewLabel(field.type)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all resize-none"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                ></textarea>
              </ng-container>

              <!-- Multiple Choice -->
              <ng-container *ngIf="field.type === 'multipleChoice'">
                <div class="space-y-2">
                  <label *ngFor="let option of field.options; let idx = index" class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                      type="radio" 
                      [name]="'field-' + field.id"
                      class="radio-white w-4 h-4"
                    />
                    <span class="text-sm text-gray-700">{{ option }}</span>
                  </label>
                </div>
              </ng-container>

              <!-- Checkboxes -->
              <ng-container *ngIf="field.type === 'checkboxes'">
                <div class="space-y-2">
                  <label *ngFor="let option of field.options; let idx = index" class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                      type="checkbox"
                      class="checkbox-white w-4 h-4 rounded"
                    />
                    <span class="text-sm text-gray-700">{{ option }}</span>
                  </label>
                </div>
              </ng-container>

              <!-- Date -->
              <ng-container *ngIf="field.type === 'date'">
                <input 
                  type="date"
                  [value]="field.defaultValue"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Time -->
              <ng-container *ngIf="field.type === 'time'">
                <input 
                  type="time"
                  [value]="field.defaultValue"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Email -->
              <ng-container *ngIf="field.type === 'email'">
                <input 
                  type="email"
                  [placeholder]="field.defaultValue || 'email@example.com'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Link -->
              <ng-container *ngIf="field.type === 'link'">
                <input 
                  type="url"
                  [placeholder]="field.defaultValue || 'https://example.com'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Phone -->
              <ng-container *ngIf="field.type === 'phone'">
                <input 
                  type="tel"
                  [placeholder]="field.defaultValue || '+1 (555) 000-0000'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Number -->
              <ng-container *ngIf="field.type === 'number'">
                <input 
                  type="number"
                  [placeholder]="field.defaultValue || '0'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Image -->
              <ng-container *ngIf="field.type === 'image'">
                <div class="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <app-icon key="beaker" className="w-12 h-12 mx-auto mb-3 text-gray-400"></app-icon>
                  <p class="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              </ng-container>

              <!-- ORCID -->
              <ng-container *ngIf="field.type === 'orcid'">
                <input 
                  type="text"
                  [placeholder]="field.defaultValue || '0000-0000-0000-0000'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all font-mono"
                  [style.--tw-ring-color]="service.COLORS.primary"
                  (focus)="onInputFocus($any($event.target))"
                  (blur)="onInputBlur($any($event.target))"
                />
              </ng-container>

              <!-- Controlled Terms -->
              <ng-container *ngIf="field.type === 'controlledTerms'">
                <div>
                  <button
                    type="button"
                    (click)="handleOpenBioPortal(field)"
                    class="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors text-left flex items-center gap-2 group cursor-pointer"
                  >
                    <div *ngIf="selectedTerms()[field.id]; else noTerm" class="flex-1">
                      <div class="text-sm font-medium text-gray-900">
                        {{ selectedTerms()[field.id].prefLabel }}
                      </div>
                      <div *ngIf="selectedTerms()[field.id].ontologyAcronym" class="text-xs text-gray-500 mt-0.5">
                        {{ selectedTerms()[field.id].ontologyAcronym }}
                      </div>
                    </div>
                    <ng-template #noTerm>
                      <div class="flex items-center gap-2 flex-1 text-gray-500">
                        <app-icon key="settings" className="w-5 h-5"></app-icon>
                        <span class="text-sm font-normal">Search BioPortal...</span>
                      </div>
                    </ng-template>
                    <span class="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">▶</span>
                  </button>
                </div>
              </ng-container>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- BioPortal Search Modal Wrapper -->
    <app-bioportal-search-modal
      [isOpen]="showBioPortalModal()"
      [fieldName]="selectedFieldForSearch()?.name || ''"
      [config]="selectedFieldForSearch()?.controlledTermConfig"
      (close)="showBioPortalModal.set(false); selectedFieldForSearch.set(null)"
      (select)="handleSelectTerm($event)"
    ></app-bioportal-search-modal>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #fafafa;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #d1d5db;
    }
  `]
})
export class PreviewPanelComponent {
  readonly service = inject(TemplateService);

  readonly selectedTerms = signal<Record<number, any>>({});
  readonly showBioPortalModal = signal(false);
  readonly selectedFieldForSearch = signal<Field | null>(null);

  getFieldPreviewLabel(type: string): string {
    return FIELD_TYPES[type]?.preview || '';
  }

  onInputFocus(el: HTMLElement) {
    el.style.borderColor = this.service.COLORS.primary;
  }

  onInputBlur(el: HTMLElement) {
    el.style.borderColor = '#d1d5db';
  }

  handleOpenBioPortal(field: Field) {
    this.selectedFieldForSearch.set(field);
    this.showBioPortalModal.set(true);
  }

  handleSelectTerm(term: BioPortalResult) {
    const activeField = this.selectedFieldForSearch();
    if (activeField) {
      this.selectedTerms.update(prev => ({
        ...prev,
        [activeField.id]: term
      }));
    }
    this.showBioPortalModal.set(false);
    this.selectedFieldForSearch.set(null);
  }
}
