import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxGroupAreaDropDirective,
    IgxGroupByRowTemplateDirective
} from './grid.directives';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { DeprecateMethod } from '../../core/deprecateDecorators';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { GridHammerConfig } from '../grid.common';

/**
 * @hidden
 */
@NgModule({
  declarations: [
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGroupAreaDropDirective,
    IgxGridPreGroupingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe
  ],
  exports: [
    IgxGridComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGroupAreaDropDirective,
    IgxGridCommonModule,
    IgxGridPreGroupingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPagingPipe,
    IgxGridSortingPipe,
    IgxGridFilteringPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridCommonModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: GridHammerConfig
  }]
})
export class IgxGridModule {
  @DeprecateMethod('IgxGridModule.forRoot method is deprecated. Use IgxGridModule instead.')
  public static forRoot() {
    return {
        ngModule: IgxGridModule
    };
  }
}
