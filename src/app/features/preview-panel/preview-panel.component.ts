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
  templateUrl: './preview-panel.component.html',
  styleUrls: ['./preview-panel.component.scss']
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
