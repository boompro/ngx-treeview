import { Component, EventEmitter, Input, Output, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { TreeviewI18n } from './treeview-i18n';
import { TreeviewItem } from './treeview-item';
import { TreeviewConfig } from './treeview-config';
import { TreeviewComponent } from './treeview.component';
import { DropdownDirective } from './dropdown.directive';
import { TreeviewHeaderTemplateContext } from './treeview-header-template-context';
import { TreeviewItemTemplateContext } from './treeview-item-template-context';

@Component({
    selector: 'ngx-dropdown-treeview',
    templateUrl: './dropdown-treeview.component.html',
    styleUrls: ['./dropdown-treeview.component.scss']
})
export class DropdownTreeviewComponent {
    @Input() buttonClass = 'btn-outline-secondary';
    @Input() headerTemplate: TemplateRef<TreeviewHeaderTemplateContext>;
    @Input() itemTemplate: TemplateRef<TreeviewItemTemplateContext>;
    @Input() items: TreeviewItem[];
    @Input() config: TreeviewConfig;
    @Output() selectedChange = new EventEmitter<any[]>(true);
    @Output() filterChange = new EventEmitter<string>();
    @Output() selectItem = new EventEmitter<TreeviewItem>();
    @Output() itemWasAdded = new EventEmitter<any>();
    @ViewChild(TreeviewComponent) treeviewComponent: TreeviewComponent;
    @ViewChild(DropdownDirective) dropdownDirective: DropdownDirective;
    private _currentSelected: TreeviewItem;

    constructor(
        public i18n: TreeviewI18n,
        private defaultConfig: TreeviewConfig
    ) {
        this.config = this.defaultConfig;
    }

    getText(): string {
      if (!this.config.hasCheckbox) {
         if (this._currentSelected) {
          return this._currentSelected.text;
         } else {
           return 'Element not select';
         }
      } else {
        return this.i18n.getText(this.treeviewComponent.selection);
      }
    }

    onSelectedChange(values: any[]) {
        this.selectedChange.emit(values);
    }

    onFilterChange(text: string) {
      this.filterChange.emit(text);
    }

    onAddItem(e) {
      this.itemWasAdded.emit(e);
    }

    onSelectItem(item: TreeviewItem) {
      if (!this.config.hasCheckbox) {
        this._currentSelected = item;
      }
      this.selectItem.emit(item);
    }

    addNewRootItem() {
      const item = new TreeviewItem({
        isEdit: true,
        text: '',
        value: ''
      });
      this.items.push(item);
      this.onAddItem({
        parent: null,
        added: item
      });
    }
}
