import { isBoolean, isNil, isString } from 'lodash';
import { TreeviewHelper } from './treeview-helper';
import { ThrowStmt } from '@angular/compiler';

export interface TreeviewSelection {
  checkedItems: TreeviewItem[];
  uncheckedItems: TreeviewItem[];
}

export interface TreeItem {
  text: string;
  value: any;
  parent?: TreeviewItem;
  disabled?: boolean;
  checked?: boolean;
  collapsed?: boolean;
  children?: TreeItem[];
  isEdit?: boolean;
  isRoot?: boolean;
}

const roots: any[] = [];

export class TreeviewItem {
  public parent: TreeviewItem = null;
  private internalDisabled = false;
  private internalChecked = true;
  private internalCollapsed = false;
  private internalEdit = false;
  private internalCreated = true;
  private isRoot = false;
  private internalChildren: TreeviewItem[];
  private internalSelected = false;
  private internalActive = false;
  editText: string;
  text: string;
  value: any;

  constructor(item: TreeItem, autoCorrectChecked = false) {
    if (isNil(item)) {
      throw new Error('Item must be defined');
    }
    if (isString(item.text)) {
      this.text = item.text;
    } else {
      throw new Error('A text of item must be string object');
    }
    this.value = item.value;
    if (isBoolean(item.checked)) {
      this.checked = item.checked;
    }
    if (isBoolean(item.collapsed)) {
      this.collapsed = item.collapsed;
    }
    if (isBoolean(item.isEdit)) {
      this.internalEdit = item.isEdit;
    }
    if (isBoolean(item.disabled)) {
      this.disabled = item.disabled;
    }
    if (!isNil(item.children) && item.children.length > 0) {
      this.children = item.children.map(child => {
        if (this.disabled === true) {
          child.disabled = true;
        }
        child.parent = this;
        return new TreeviewItem(child);
      });
    }
    if (isBoolean(item.isRoot)) {
      this.isRoot = item.isRoot;
    }

    if (autoCorrectChecked) {
      this.correctChecked();
    }
    if (item.parent) {
      this.parent = item.parent;
    } else {
      roots.push(this);
    }
  }

  get checked(): boolean {
    return this.internalChecked;
  }

  set checked(value: boolean) {
    if (!this.internalDisabled) {
      if (this.internalChecked !== value) {
        this.internalChecked = value;
      }
    }
  }

  get isRootItem(): Boolean {
    return this.isRoot;
  }

  get indeterminate(): boolean {
    return this.checked === undefined;
  }

  get edit(): boolean {
    return this.internalEdit;
  }

  set edit(value: boolean) {
    this.internalEdit = value;
  }

  set created(value: boolean) {
    if (!value) {
      this.internalCreated = false;
    }
  }

  get created(): boolean {
    return this.internalCreated;
  }

  setCheckedRecursive(value: boolean) {
    if (!this.internalDisabled) {
      this.internalChecked = value;
      if (!isNil(this.internalChildren)) {
        this.internalChildren.forEach(child => child.setCheckedRecursive(value));
      }
    }
  }

  get disabled(): boolean {
    return this.internalDisabled;
  }

  set disabled(value: boolean) {
    if (this.internalDisabled !== value) {
      this.internalDisabled = value;
      if (!isNil(this.internalChildren)) {
        this.internalChildren.forEach(child => child.disabled = value);
      }
    }
  }

  get collapsed(): boolean {
    return this.internalCollapsed;
  }

  set collapsed(value: boolean) {
    if (this.internalCollapsed !== value) {
      this.internalCollapsed = value;
    }
  }

  setCollapsedRecursive(value: boolean) {
    this.internalCollapsed = value;
    if (!isNil(this.internalChildren)) {
      this.internalChildren.forEach(child => child.setCollapsedRecursive(value));
    }
  }

  get children(): TreeviewItem[] {
    return this.internalChildren;
  }

  set children(value: TreeviewItem[]) {
    if (this.internalChildren !== value) {
      if (!isNil(value) && value.length === 0) {
        throw new Error('Children must be not an empty array');
      }
      this.internalChildren = value;
      if (!isNil(this.internalChildren)) {
        let checked = null;
        this.internalChildren.forEach(child => {
          if (checked === null) {
            checked = child.checked;
          } else {
            if (child.checked !== checked) {
              checked = undefined;
              return;
            }
          }
        });
        this.internalChecked = checked;
      }
    }
  }

  get selected(): boolean {
    return this.internalSelected;
  }

  set selected(value: boolean) {
    this.dropSelection();
    this.internalSelected = value;
  }

  get active(): boolean {
    return this.internalActive;
  }

  set active(val: boolean) {
    this.internalActive = val;
  }

  getSelection(): TreeviewSelection {
    let checkedItems: TreeviewItem[] = [];
    let uncheckedItems: TreeviewItem[] = [];
    if (isNil(this.internalChildren)) {
      if (this.internalChecked) {
        checkedItems.push(this);
      } else {
        uncheckedItems.push(this);
      }
    } else {
      const selection = TreeviewHelper.concatSelection(this.internalChildren, checkedItems, uncheckedItems);
      checkedItems = selection.checked;
      uncheckedItems = selection.unchecked;
    }

    return {
      checkedItems: checkedItems,
      uncheckedItems: uncheckedItems
    };
  }

  correctChecked() {
    this.internalChecked = this.getCorrectChecked();
  }

  addChildItem() {
    const newItem = new TreeviewItem({
      parent: this,
      checked: false,
      children: [],
      collapsed: false,
      disabled: false,
      text: '',
      value: '',
      isEdit: true
    }, false);
    if (this.internalChildren) {
      this.internalChildren.push(newItem);
    } else {
      this.internalChildren = [];
      this.internalChildren.push(newItem);
    }
  }

  getBrother(step: -1 | 1): TreeviewItem {

    if (this.parent) {
      return this._getNeighbour(step, this.parent.children);
    } else {
      return this._getNeighbour(step, roots);
    }
  }

  getParent(step: -1 | 1): TreeviewItem {
     if (step === 1) {
       return this.children && this.children[0];
    } else {
      return this.parent && this.parent;
     }
  }

  private _getNeighbour(step: -1 | 1, items: TreeviewItem[]): TreeviewItem {
    if (items) {
      const myIdx = items.findIndex((item) => item === this);
      return items.find((_item, idx) => idx - step === myIdx);
    } else {
      return null;
    }
  }

  private getCorrectChecked(): boolean {
    let checked: boolean = null;
    if (!isNil(this.internalChildren)) {
      for (const child of this.internalChildren) {
        child.internalChecked = child.getCorrectChecked();
        if (checked === null) {
          checked = child.internalChecked;
        } else if (checked !== child.internalChecked) {
          checked = undefined;
          break;
        }
      }
    } else {
      checked = this.checked;
    }

    return checked;
  }

  private dropSelection() {
    const rootNode: TreeviewItem = this;
    const subDrop = (item: TreeviewItem) => {
      item.internalSelected = false;
      if (item.internalChildren) {
        item.internalChildren.forEach((chld) => subDrop(chld));
      }

    };
    subDrop(rootNode);
    roots.forEach((root) => subDrop(root));
  }
}

