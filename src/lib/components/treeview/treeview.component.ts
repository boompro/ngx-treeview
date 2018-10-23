import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, TemplateRef } from '@angular/core';
import { isNil, includes } from 'lodash';
import { TreeviewI18n } from '../../classes/treeview-i18n';
import { TreeviewItem, TreeviewSelection } from '../../classes/treeview-item';
import { TreeviewConfig } from '../../classes/treeview-config';
import { TreeviewEventParser } from '../../classes/treeview-event-parser';
import { TreeviewHeaderTemplateContext } from '../../interfaces/treeview-header-template-context';
import { TreeviewItemTemplateContext } from '../../interfaces/treeview-item-template-context';
import { TreeviewHelper } from '../../classes/treeview-helper';

class FilterTreeviewItem extends TreeviewItem {
  private readonly refItem: TreeviewItem;
  constructor(item: TreeviewItem) {
    super({
      text: item.text,
      value: item.value,
      disabled: item.disabled,
      checked: item.checked,
      collapsed: item.collapsed,
      // children: item.children,  ???
      // isEdit: item.edit,        ???
      // isRoot: item.isRootItem   ???
    });
    this.refItem = item;
  }

  updateRefChecked() {
    this.children.forEach(child => {
      if (child instanceof FilterTreeviewItem) {
        child.updateRefChecked();
      }
    });

    let refChecked = this.checked;
    if (refChecked) {
      for (const refChild of this.refItem.children) {
        if (!refChild.checked) {
          refChecked = false;
          break;
        }
      }
    }
    this.refItem.checked = refChecked;
  }
}

@Component({
  selector: 'ngx-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.scss']
})
export class TreeviewComponent implements OnChanges {
  @Input() headerTemplate: TemplateRef<TreeviewHeaderTemplateContext>;
  @Input() itemTemplate: TemplateRef<TreeviewItemTemplateContext>;
  @Input() items: TreeviewItem[];
  @Input() config: TreeviewConfig;
  @Output() selectedChange = new EventEmitter<any[]>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() addNewItem = new EventEmitter<any>();
  @Output() editItemName = new EventEmitter<TreeviewItem>();
  @Output() selectItem = new EventEmitter<TreeviewItem>();
  @Output() deletedItem = new EventEmitter<TreeviewItem>();
  headerTemplateContext: TreeviewHeaderTemplateContext;
  allItem: TreeviewItem;
  filterText = '';
  filterItems: TreeviewItem[];
  selection: TreeviewSelection;

  private activeItem: TreeviewItem;

  constructor(
    public i18n: TreeviewI18n,
    private defaultConfig: TreeviewConfig,
    private eventParser: TreeviewEventParser
  ) {
    this.config = this.defaultConfig;
    // this.allItem = new TreeviewItem({ text: 'All', value: undefined });
    this.createHeaderTemplateContext();
  }

  get hasFilterItems(): boolean {
    return !isNil(this.filterItems) && this.filterItems.length > 0;
  }

  get maxHeight(): string {
    return `${this.config.maxHeight}`;
  }

  get maxWidth(): string {
    return `${this.config.maxWidth}`;
  }

  ngOnChanges(changes: SimpleChanges) {
    const itemsSimpleChange = changes['items'];
    if (!isNil(itemsSimpleChange)) {
      this.allItem = new TreeviewItem({ text: 'All', value: null, children: [] });
      this.activeItem = null;
      if (!isNil(this.items)) {
        this.updateFilterItems();
        this.updateCollapsedOfAll();
        this.raiseSelectedChange();
        this.allItem.children = this.items;
        this.items.forEach((item) => item.parent = this.allItem);
      }
    }
    this.createHeaderTemplateContext();
  }

  onAllCollapseExpand() {
    this.allItem.collapsed = !this.allItem.collapsed;
    this.filterItems.forEach(item => item.setCollapsedRecursive(this.allItem.collapsed));
  }

  onFilterTextChange(text: string) {
    this.filterText = text;
    this.filterChange.emit(text);
    this.updateFilterItems();
  }

  onAllCheckedChange() {
    const checked = this.allItem.checked;
    this.filterItems.forEach(item => {
      item.setCheckedRecursive(checked);
      if (item instanceof FilterTreeviewItem) {
        item.updateRefChecked();
      }
    });

    this.raiseSelectedChange();
  }

  onItemCheckedChange(item: TreeviewItem, checked: boolean) {
    if (item instanceof FilterTreeviewItem) {
      item.updateRefChecked();
    }

    this.updateCheckedOfAll();
    this.raiseSelectedChange();
  }

  raiseSelectedChange() {
    this.generateSelection();
    const values = this.eventParser.getSelectedChange(this);
    this.selectedChange.emit(values);
  }

  onSelectItem(item: TreeviewItem) {
    if (this.activeItem) {
      this.activeItem.active = false;
    }
    this.activeItem = item;
    this.activeItem.active = true;
    if (!item.children) {
      item.selected = true;
      this.selectItem.emit(item);
    }
  }

  endEdit(item: TreeviewItem) {
    item.created ? this.onEndAddItem(item) : this.onEndEdit(item);
  }

  onEndEdit(item: TreeviewItem) {
    item.edit = false;
    if (item.text !== item.editText) {
      item.text = item.editText;
      this.editItemName.emit(item);
    }
    item.editText = null;
  }

  onEndAddItem(item: TreeviewItem) {
    item.created = false;
    item.edit = false;
    item.text = item.editText;
    item.editText = null;
    this.addNewItem.emit({
      added: item,
      parent: item.parent
    });
  }

  enterNameItem(e: KeyboardEvent, item: TreeviewItem) {
    if (e.keyCode === 13) {
      this.endEdit(item);
    }
  }

  cancelEdit(item: TreeviewItem) {
    item.created ? this.deleteItem(item) : this.onCancelEdit(item);
  }

  onCancelEdit(item: TreeviewItem) {
    item.editText = null;
    item.edit = false;
  }

  onAddNewItem(item: TreeviewItem) {
    item.collapsed = false;
    item.addChildItem();
  }

  deleteItem(item: TreeviewItem) {
    this.deletedItem.emit(item);
  }

  editItem(item: TreeviewItem) {
    item.edit = true;
    item.editText = item.text;
  }

  onKeyUp() {
    this.fixActive();
    this.activeItem.active = false;
    if (this.activeItem.parent) {
      const bro = this.activeItem.getBrother(-1);
      if (bro) {
        this.activeItem = bro;
      }
    } else {
      let idx = this.items.findIndex((item) => item.value === this.activeItem.value) - 1;
      if (idx < 0) {
        idx = 0;
      }
      this.activeItem = this.items[idx];
    }
    this.activeItem.active = true;
  }

  onKeyDn() {
    this.fixActive();
    this.activeItem.active = false;
    const bro = this.activeItem.getBrother(1);
    if (bro) {
      this.activeItem = bro;
    }
    this.activeItem.active = true;
  }

  onKeySelect() {
    const bro = this.activeItem;
    if (bro.active) {
      this.onSelectItem(bro);
    }
  }

  onKeyLeft() {
    this.fixActive();
    this.activeItem.active = false;
    const bro = this.activeItem.getParent(-1);
    if (bro) {
      this.activeItem = bro;
    }
    this.activeItem.active = true;
  }

  onKeyRight() {
    this.fixActive();
    this.activeItem.active = false;
    const bro = this.activeItem.getParent(1);
    if (bro) {
      this.activeItem = bro;
    }
    this.activeItem.active = true;
  }

  private fixActive() {
    if (!this.activeItem) {
      this.activeItem = this.items[0];
    }
  }

  private createHeaderTemplateContext() {
    this.headerTemplateContext = {
      config: this.config,
      item: this.allItem,
      onCheckedChange: () => this.onAllCheckedChange(),
      onCollapseExpand: () => this.onAllCollapseExpand(),
      onFilterTextChange: (text) => this.onFilterTextChange(text)
    };
  }

  private generateSelection() {
    let checkedItems: TreeviewItem[] = [];
    let uncheckedItems: TreeviewItem[] = [];
    if (!isNil(this.items)) {
      const selection = TreeviewHelper.concatSelection(this.items, checkedItems, uncheckedItems);
      checkedItems = selection.checked;
      uncheckedItems = selection.unchecked;
    }

    this.selection = {
      checkedItems: checkedItems,
      uncheckedItems: uncheckedItems
    };
  }

  private updateFilterItems() {
    if (this.filterText !== '') {
      const filterItems: TreeviewItem[] = [];
      const filterText = this.filterText.toLowerCase();
      this.items.forEach(item => {
        const newItem = this.filterItem(item, filterText);
        if (!isNil(newItem)) {
          filterItems.push(newItem);
        }
      });
      this.filterItems = filterItems;
    } else {
      this.filterItems = this.items;
    }

    this.updateCheckedOfAll();
  }

  private filterItem(item: TreeviewItem, filterText: string): TreeviewItem {
    const isMatch = includes(item.text.toLowerCase(), filterText);
    if (isMatch) {
      return item;
    } else {
      if (!isNil(item.children)) {
        const children: TreeviewItem[] = [];
        item.children.forEach(child => {
          const newChild = this.filterItem(child, filterText);
          if (!isNil(newChild)) {
            children.push(newChild);
          }
        });
        if (children.length > 0) {
          const newItem = new FilterTreeviewItem(item);
          newItem.collapsed = false;
          newItem.children = children;
          return newItem;
        }
      }
    }

    return undefined;
  }

  private updateCheckedOfAll() {
    let itemChecked: boolean = null;
    for (const filterItem of this.filterItems) {
      if (itemChecked === null) {
        itemChecked = filterItem.checked;
      } else if (itemChecked !== filterItem.checked) {
        itemChecked = undefined;
        break;
      }
    }

    if (itemChecked === null) {
      itemChecked = false;
    }

    this.allItem.checked = itemChecked;
  }

  private updateCollapsedOfAll() {
    let hasItemExpanded = false;
    for (const filterItem of this.filterItems) {
      if (!filterItem.collapsed) {
        hasItemExpanded = true;
        break;
      }
    }

    this.allItem.collapsed = !hasItemExpanded;
  }
}
