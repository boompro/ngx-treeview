import { Injectable } from '@angular/core';
import { TreeviewItem, TreeviewSelection, TreeviewI18n } from '../lib';
import { I18n } from './i18n';

@Injectable()
export class DefaultTreeviewI18n extends TreeviewI18n {
    constructor(
        protected i18n: I18n
    ) {
        super();
    }

    getText(selection: TreeviewSelection): string {
        if (selection.uncheckedItems.length === 0) {
            return this.i18n.language === 'en' ? 'Все' : 'Tất cả';
        }

        switch (selection.checkedItems.length) {
            case 0:
                return this.i18n.language === 'en' ? 'Select options' : 'Chọn mục';
            case 1:
                return selection.checkedItems[0].text;
            default:
                return this.i18n.language === 'en'
                    ? `${selection.checkedItems.length} options selected`
                    : `${selection.checkedItems.length} mục đã được chọn`;
        }
    }

    getAllCheckboxText(): string {
        if (this.i18n.language === 'en') {
            return 'Все';
        } else {
            return 'Tất cả';
        }
    }

    getFilterPlaceholder(): string {
        if (this.i18n.language === 'en') {
            return 'Фильтр';
        } else {
            return 'Lọc';
        }
    }

    getFilterNoItemsFoundText(): string {
        if (this.i18n.language === 'en') {
            return 'Объекты не найдены';
        } else {
            return 'Không có mục nào được tìm thấy';
        }
    }

    getTooltipCollapseExpandText(isCollapse: boolean): string {
        return isCollapse
            ? this.i18n.language === 'en' ? 'Развернуть' : 'Mở rộng'
            : this.i18n.language === 'en' ? 'Свернуть' : 'Thu lại';
    }
}
