import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IGridBaseComponent } from '../grid-common/common/grid-interfaces';
import { GridBaseAPIService } from '../grid-common/api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { ISortingExpression } from '../../public_api';
import { ITreeGridRecord } from './tree-grid.interfaces';

/**
 *@hidden
 */
@Pipe({
    name: 'treeGridHierarchizing',
    pure: true
})
export class IgxTreeGridHierarchizingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: any[], primaryKey: string, foreignKey: string, childDataKey: string,
        id: string, pipeTrigger: number): ITreeGridRecord[] {
        const grid = this.gridAPI.get(id);
        let hirerchicalRecords: ITreeGridRecord[] = [];
        const treeGridRecordsMap = new Map<any, ITreeGridRecord>();

        if (primaryKey && foreignKey) {
            hirerchicalRecords = this.hierarchizeFlatData(collection, primaryKey, foreignKey, treeGridRecordsMap);
            grid.flatData = grid.data;
        } else if (childDataKey) {
            const flatData: any[] = [];
            hirerchicalRecords = this.hierarchizeRecursive(collection, primaryKey, childDataKey, undefined,
                flatData, 0, treeGridRecordsMap);
            grid.flatData = flatData;
        }

        grid.treeGridRecordsMap = treeGridRecordsMap;
        grid.treeGridRecords = hirerchicalRecords;
        return hirerchicalRecords;
    }

    private getRowID(primaryKey: any, rowData: any) {
        return primaryKey ? rowData[primaryKey] : rowData;
    }

    private hierarchizeFlatData(collection: any[], primaryKey: string, foreignKey: string, map: Map<any, ITreeGridRecord>):
        ITreeGridRecord[] {
        const result: ITreeGridRecord[] = [];
        const missingParentRecords: ITreeGridRecord[] = [];
        collection.forEach(row => {
            const record: ITreeGridRecord = {
                rowID: this.getRowID(primaryKey, row),
                data: row,
                children: []
            };
            const parent = map.get(row[foreignKey]);
            if (parent) {
                record.parent = parent;
                parent.children.push(record);
            } else {
                missingParentRecords.push(record);
            }

            map.set(row[primaryKey], record);
        });

        missingParentRecords.forEach(record => {
            const parent = map.get(record.data[foreignKey]);
            if (parent) {
                record.parent = parent;
                parent.children.push(record);
            } else {
                result.push(record);
            }
        });

        this.setIndentationLevels(result, 0);

        return result;
    }

    private setIndentationLevels(collection: ITreeGridRecord[], indentationLevel: number) {
        for (let i = 0; i < collection.length; i++) {
            const record = collection[i];
            record.indentationLevel = indentationLevel;
            if (record.children && record.children.length > 0) {
                this.setIndentationLevels(record.children, indentationLevel + 1);
            }
        }
    }

    private hierarchizeRecursive(collection: any[], primaryKey: string, childDataKey: string,
        parent: ITreeGridRecord, flatData: any[], indentationLevel: number, map: Map<any, ITreeGridRecord>): ITreeGridRecord[] {
        const result: ITreeGridRecord[] = [];

        for (let i = 0; i < collection.length; i++) {
            const item = collection[i];
            const record: ITreeGridRecord = {
                rowID: this.getRowID(primaryKey, item),
                data: item,
                parent: parent,
                indentationLevel: indentationLevel
            };
            flatData.push(item);
            map.set(record.rowID, record);
            record.children = item[childDataKey] ?
                this.hierarchizeRecursive(item[childDataKey], primaryKey, childDataKey, record, flatData, indentationLevel + 1, map) :
                undefined;
            result.push(record);
        }

        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'treeGridFlattening',
    pure: true
})
export class IgxTreeGridFlatteningPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: ITreeGridRecord[], id: string,
        expandedLevels: number, expandedStates: Map<any, boolean>, pipeTrigger: number): any[] {

        const grid: IgxTreeGridComponent = this.gridAPI.get(id);
        const data: ITreeGridRecord[] = [];

        grid.processedTreeGridRecords = collection;
        grid.processedTreeGridRecordsMap = new Map<any, ITreeGridRecord>();

        this.getFlatDataRecusrive(collection, data, expandedLevels, expandedStates, id, true);

        return data;
    }

    private getFlatDataRecusrive(collection: ITreeGridRecord[], data: ITreeGridRecord[] = [],
        expandedLevels: number, expandedStates: Map<any, boolean>, gridID: string,
        parentExpanded: boolean) {
        if (!collection || !collection.length) {
            return;
        }

        for (let i = 0; i < collection.length; i++) {
            const hierarchicalRecord = collection[i];

            if (parentExpanded) {
                data.push(hierarchicalRecord);
            }

            const grid: IgxTreeGridComponent = this.gridAPI.get(gridID);

            hierarchicalRecord.expanded = this.gridAPI.get_row_expansion_state(gridID,
                hierarchicalRecord.rowID, hierarchicalRecord.indentationLevel);

            grid.processedTreeGridRecordsMap.set(hierarchicalRecord.rowID, hierarchicalRecord);

            this.getFlatDataRecusrive(hierarchicalRecord.children, data, expandedLevels,
                expandedStates, gridID, parentExpanded && hierarchicalRecord.expanded);
        }
    }
}

@Pipe({
    name: 'treeGridSorting',
    pure: true
})
export class IgxTreeGridSortingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(
        hierarchicalData: ITreeGridRecord[],
        expressions: ISortingExpression | ISortingExpression[],
        id: string,
        pipeTrigger: number): ITreeGridRecord[] {
            const state = { expressions: [] };
            const grid = this.gridAPI.get(id);
            state.expressions = grid.sortingExpressions;

            let result: ITreeGridRecord[];
            if (!state.expressions.length) {
                result = hierarchicalData;
            } else {
                result = DataUtil.hierarchicalSort(hierarchicalData, state, undefined);
            }

            return result;
    }
}

@Pipe({
    name: 'treeGridPaging',
    pure: true
})
export class IgxTreeGridPagingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: ITreeGridRecord[], page = 0, perPage = 15, id: string, pipeTrigger: number): ITreeGridRecord[] {
        if (!this.gridAPI.get(id).paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result: ITreeGridRecord[] = DataUtil.page(cloneArray(collection), state);

        this.gridAPI.get(id).pagingState = state;
        return result;
    }
}
