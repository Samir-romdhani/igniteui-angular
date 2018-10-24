import { Component, ViewChild } from '@angular/core';
import { IgxTreeGridComponent } from '../tree-grid/tree-grid.component';
import { SampleTestData } from './sample-test-data.spec';
import { Calendar } from '../calendar/calendar';

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [sortable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [sortable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [sortable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSortingComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expandedLevels="2" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [filterable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [filterable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [filterable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [filterable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridFilteringComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridSimpleComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" foreignKey="ParentID" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'ParentID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'JobTitle'" dataType="string"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridPrimaryForeignKeyComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeePrimaryForeignKeyTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expandedLevels="0" width="900px" height="600px"
        [paging]="true" [perPage]="10">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridExpandingComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" primaryKey="ID" childDataKey="Employees" expandedLevels="2" width="900px" height="500px"
        [paging]="true" [perPage]="10">
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCellSelectionComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}

// Test Component with 'string' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridStringTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

// Test Component with 'date' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridDateTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeSmallTreeData();
}

// Test Component with 'boolean' dataType tree-column
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" width="900px" height="600px">
        <igx-column [field]="'OnPTO'" dataType="boolean"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date"></igx-column>
        <igx-column [field]="'Name'" dataType="string"></igx-column>
        <igx-column [field]="'ID'" dataType="number"></igx-column>
        <igx-column [field]="'Age'" dataType="number"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridBooleanTreeColumnComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeAllTypesTreeData();
}

// Test Component for CRUD tests
@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expandedLevels="2" width="900px" height="600px">
        <igx-column [field]="'ID'" dataType="number" [editable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [editable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [editable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [editable]="true"></igx-column>
        <igx-column [field]="'OnPTO'" dataType="boolean" [editable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridCrudComponent {
    @ViewChild(IgxTreeGridComponent) public treeGrid: IgxTreeGridComponent;
    public data = SampleTestData.employeeTreeData();
}
