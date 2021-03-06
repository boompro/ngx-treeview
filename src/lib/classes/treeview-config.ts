import { Injectable } from '@angular/core';

@Injectable()
export class TreeviewConfig {
    hasEdit = true;
    hasDelete = true;
    hasAdd = true;
    hasCheckbox = false;
    hasAllCheckBox = true;
    hasFilter = false;
    hasCollapseExpand = false;
    decoupleChildFromParent = false;
    maxHeight = 500;
    maxWidth = 240;

    get hasDivider(): boolean {
        return this.hasFilter || this.hasAllCheckBox || this.hasCollapseExpand;
    }

    public static create(fields?: {
        hasAdd?: boolean
        hasCheckbox?: boolean,
        hasAllCheckBox?: boolean,
        hasFilter?: boolean,
        hasCollapseExpand?: boolean,
        decoupleChildFromParent?: boolean
        maxHeight?: number,
        maxWidth?: number
    }): TreeviewConfig {
        const config = new TreeviewConfig();
        Object.assign(config, fields);
        return config;
    }
}
