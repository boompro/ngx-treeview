import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { isNil } from 'lodash';
import { TreeviewItem } from '../../classes/treeview-item';
import { TreeviewConfig } from '../../classes/treeview-config';
import { TreeviewItemTemplateContext } from '../../interfaces/treeview-item-template-context';

@Component({
    selector: 'ngx-treeview-item',
    templateUrl: './treeview-item.component.html',
    styleUrls: ['./treeview-item.component.scss']
})
export class TreeviewItemComponent {
    @Input() config: TreeviewConfig;
    @Input() template: TemplateRef<TreeviewItemTemplateContext>;
    @Input() item: TreeviewItem;
    @Output() checkedChange = new EventEmitter<boolean>();
    @Output() addItem = new EventEmitter<any>();
    @Output() selectItem = new EventEmitter<any>();

    constructor(
        private defaultConfig: TreeviewConfig
    ) {
        this.config = this.defaultConfig;
    }

    onCollapseExpand = () => {
        this.item.collapsed = !this.item.collapsed;
    }

    onCheckedChange = () => {
        const checked = this.item.checked;
        if (!isNil(this.item.children) && !this.config.decoupleChildFromParent) {
            this.item.children.forEach(child => child.setCheckedRecursive(checked));
        }
        this.checkedChange.emit(checked);
    }

    onChildCheckedChange(child: TreeviewItem, checked: boolean) {
        if (!this.config.decoupleChildFromParent) {
            let itemChecked: boolean = null;
            for (const childItem of this.item.children) {
                if (itemChecked === null) {
                    itemChecked = childItem.checked;
                } else if (itemChecked !== childItem.checked) {
                    itemChecked = undefined;
                    break;
                }
            }

            if (itemChecked === null) {
                itemChecked = false;
            }

            if (this.item.checked !== itemChecked) {
                this.item.checked = itemChecked;
            }

        }

        this.checkedChange.emit(checked);
    }

    onAddItem(e) {
      console.log(e);
      this.addItem.emit(e);
    }

    onSelectItem(item: TreeviewItem) {
      console.log(item.value);
      this.selectItem.emit(item);
    }
}
