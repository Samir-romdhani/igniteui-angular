import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridSimpleComponent } from '../test-utils/tree-grid-components.spec';
import { TreeGridFunctions,
         TREE_ROW_SELECTION_CSS_CLASS,
         TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS } from '../test-utils/tree-grid-functions.spec';
import { IgxNumberFilteringOperand } from '../data-operations/filtering-condition';

describe('IgxTreeGrid - Selection', () => {
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent
            ],
            imports: [IgxTreeGridModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
        fix.detectChanges();

        treeGrid = fix.componentInstance.treeGrid;
        treeGrid.rowSelectable = true;
        treeGrid.primaryKey = 'ID';
        fix.detectChanges();
    });

    it('should have checkbox on each row if rowSelectable is true', () => {
        const rows = TreeGridFunctions.getAllRows(fix);

        expect(rows.length).toBe(10);
        rows.forEach((row) => {
            const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
            expect(checkBoxElement).not.toBeNull();
        });

        treeGrid.rowSelectable = false;

        expect(rows.length).toBe(10);
        rows.forEach((row) => {
            const checkBoxElement = row.nativeElement.querySelector(TREE_ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
            expect(checkBoxElement).toBeNull();
        });
    });

    describe('API Row Selection', () => {
        it('should be able to select/deselect all rows', () => {
            treeGrid.selectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            treeGrid.deselectAllRows();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [], true);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('should be able to select row of any level', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID], true);
            fix.detectChanges();

            // Verify selection.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.selectRows([treeGrid.getRowByIndex(2).rowID], false);
            fix.detectChanges();

            // Verify new selection by keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            treeGrid.selectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(6).rowID, treeGrid.getRowByIndex(8).rowID], true);
            fix.detectChanges();

            // Verify new selection by NOT keeping the old one.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(6).rowID, treeGrid.getRowByIndex(8).rowID,
            treeGrid.getRowByIndex(9).rowID], true);
            fix.detectChanges();

            treeGrid.deselectRows([treeGrid.getRowByIndex(1).rowID, treeGrid.getRowByIndex(3).rowID]);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });

        it('should persist the selection after sorting', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(4).rowID], true);
            fix.detectChanges();

            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(5).rowID,
            treeGrid.getRowByIndex(8).rowID], true);
            fix.detectChanges();

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            tick(100);

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            tick(100);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should persist the selection after expand/collapse', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(5).rowID], true);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            treeGrid.toggleRowExpansion(treeGrid.getRowByIndex(0).rowID);
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            treeGrid.toggleRowExpansion(treeGrid.getRowByIndex(0).rowID);
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', () => {
            treeGrid.selectRows([treeGrid.getRowByIndex(0).rowID, treeGrid.getRowByIndex(3).rowID,
            treeGrid.getRowByIndex(5).rowID], true);
            fix.detectChanges();

            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        });
    });

    describe('UI Row Selection', () => {
        it('should be able to select/deselect all rows', () => {
            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [], true);
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, false);
        });

        it('should be able to select row of any level', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], true);

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 2);
            fix.detectChanges();

            // Select new rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            fix.detectChanges();

            // Verify new selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3, 6, 8], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should be able to deselect row of any level', () => {
            // Select rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 6);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 9);
            fix.detectChanges();

            // Deselect rows
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 1);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            fix.detectChanges();

            // Verify modified selection
            TreeGridFunctions.verifyDataRowsSelection(fix, [1, 3], false);
            TreeGridFunctions.verifyDataRowsSelection(fix, [6, 8, 9], true);
        });

        it('should persist the selection after sorting', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 4);

            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc });
            fix.detectChanges();

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [2, 7], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearSort();
            fix.detectChanges();

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 4], true);
        });

        it('should persist the selection after filtering', fakeAsync(() => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 8);

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            tick(100);

            // Verification indices are different since the sorting changes rows' positions.
            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 2, 4], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);

            treeGrid.clearFilter();
            tick(100);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 5, 8], true);
        }));

        it('should update header checkbox when reselecting all filtered-in rows', fakeAsync(() => {
            treeGrid.filter('Age', 30, IgxNumberFilteringOperand.instance().condition('lessThan'));
            tick(100);

            TreeGridFunctions.clickHeaderRowSelectionCheckbox(fix);
            fix.detectChanges();

            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Unselect row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null); // Verify header checkbox is indeterminate
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0); // Reselect same row
            fix.detectChanges();
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, true); // Verify header checkbox is selected
        }));

        it('should persist the selection after expand/collapse', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            expect(getVisibleSelectedRows(fix).length).toBe(3);

            // Collapse row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            expect(getVisibleSelectedRows(fix).length).toBe(1);

            // Expand same row and verify visible selected rows
            TreeGridFunctions.clickRowIndicator(fix, 0);
            expect(getVisibleSelectedRows(fix).length).toBe(3);

            TreeGridFunctions.verifyDataRowsSelection(fix, [0, 3, 5], true);
            TreeGridFunctions.verifyHeaderCheckboxSelection(fix, null);
        });

        it('should persist selection after paging', () => {
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 0);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 3);
            TreeGridFunctions.clickRowSelectionCheckbox(fix, 5);
            fix.detectChanges();

            treeGrid.paging = true;
            treeGrid.perPage = 4;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, true);

            treeGrid.page = 1;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, true);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 2, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 3, false);

            treeGrid.page = 2;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 0, false);
            TreeGridFunctions.verifyTreeRowSelectionByIndex(fix, 1, false);
        });
    });
});

function getVisibleSelectedRows(fix) {
    return TreeGridFunctions.getAllRows(fix).filter(
        (row) => row.nativeElement.classList.contains(TREE_ROW_SELECTION_CSS_CLASS));
}
