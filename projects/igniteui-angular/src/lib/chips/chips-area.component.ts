﻿import {
    Component,
    ContentChildren,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    IterableDiffer,
    IterableDiffers,
    NgModule,
    Output,
    Provider,
    QueryList,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    DoCheck,
    ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cloneArray } from '../core/utils';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import {
    IgxChipComponent,
    IChipSelectEventArgs,
    IChipKeyDownEventArgs,
    IChipEnterDragAreaEventArgs,
    IBaseChipEventArgs
} from './chip.component';
import { IgxDragDropModule } from '../directives/dragdrop/dragdrop.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxIconModule } from '../icon';
import { IgxConnectorDirective } from './connector.directive';

export interface IBaseChipsAreaEventArgs {
    owner: IgxChipsAreaComponent;
}

export interface IChipsAreaReorderEventArgs {
    chipsArray: IgxChipComponent[];
    isValid: boolean;
}

export interface IChipsAreaSelectEventArgs extends IBaseChipsAreaEventArgs {
    newSelection: IgxChipComponent[];
}

@Component({
    selector: 'igx-chips-area',
    templateUrl: 'chips-area.component.html',
})
export class IgxChipsAreaComponent implements DoCheck {

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    public cssClass = 'igx-chips-area';

    /**
     * An @Input property that sets the width of the `IgxChipsAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.width.px')
    @Input()
    public width: number;

    /**
     * An @Input property that sets the height of the `IgxChipsAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.height.px')
    @Input()
    public height: number;

    /**
     * Emits an event when `IgxChipComponent`s in the `IgxChipsAreaComponent` are reordered.
     * Returns an array of `IgxChipComponent`s.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="changedOrder($event)"></igx-chips-area>
     * ```
     * ```typescript
     * public changedOrder(event: IChipsAreaReorderEventArgs){
     *      let chips: IgxChipComponent[] = event.chipsArray;
     * }
     * ```
     */
    @Output()
    public onReorder = new EventEmitter<IChipsAreaReorderEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is selected.
     * Returns an array of selected `IgxChipComponent`s and the `IgxChipAreaComponent`.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onSelection)="selection($event)"></igx-chips-area>
     * ```
     * ```typescript
     * public selection(event: IChipsAreaSelectEventArgs){
     *      let selectedChips: IgxChipComponent[] = event.newSelection;
     * }
     */
    @Output()
    public onSelection = new EventEmitter<IChipsAreaSelectEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveStart)="moveStart($event)"></igx-chips-area>
     * ```
     * ```typescript
     * moveStart(event: IBaseChipsAreaEventArgs){
     *      let chipArea = event.owner;
     * }
     * ```
     */
    @Output()
    public onMoveStart = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Emits an event after an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onMoveEnd)="moveEnd($event)"></igx-chips-area>
     * ```
     * ```typescript
     * moveEnd(event: IBaseChipsAreaEventArgs){
     *      let chipArea = event.owner;
     * }
     * ```
     */
    @Output()
    public onMoveEnd = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Holds the `IgxChipComponent` in the `IgxChipsAreaComponent`.
     * ```typescript
     * ngAfterViewInit(){
     *    let chips = this.chipsArea.chipsList;
     * }
     * ```
     */
    @ContentChildren(IgxChipComponent)
    public chipsList: QueryList<IgxChipComponent>;

    private modifiedChipsArray: IgxChipComponent[];
    private _differ: IterableDiffer<IgxChipComponent> | null = null;
    private selectedChips: IgxChipComponent[] = [];

    constructor(public cdr: ChangeDetectorRef,
                private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

    /**
     * @hidden
     */
    public ngDoCheck(): void {
        if (this.chipsList) {
            const changes = this._differ.diff(this.chipsList.toArray());
            if (changes) {
                changes.forEachAddedItem((addedChip) => {
                    addedChip.item.onMoveStart.subscribe((args) => {
                        this.onChipMoveStart(args);
                    });
                    addedChip.item.onMoveEnd.subscribe((args) => {
                        this.onChipMoveEnd(args);
                    });
                    addedChip.item.onDragEnter.subscribe((args) => {
                        this.onChipDragEnter(args);
                    });
                    addedChip.item.onKeyDown.subscribe((args) => {
                        this.onChipKeyDown(args);
                    });
                    if (addedChip.item.selectable) {
                        addedChip.item.onSelection.subscribe((args) => {
                            this.onChipSelectionChange(args);
                        });
                    }
                });
                this.modifiedChipsArray = this.chipsList.toArray();
            }
        }
    }

    /**
     * @hidden
     */
    protected onChipKeyDown(event: IChipKeyDownEventArgs) {
        let orderChanged = false;
        const chipsArray = this.chipsList.toArray();
        const dragChipIndex = chipsArray.findIndex((el) => el === event.owner);
        if (event.shiftKey === true) {
            if (event.key === 'ArrowLeft' || event.key === 'Left') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex - 1, false);
                if (orderChanged) {
                    // The `modifiedChipsArray` is out of date in the setTimeout sometimes.
                    const chipArray = this.modifiedChipsArray;
                    setTimeout(() => {
                        chipArray[dragChipIndex - 1].chipArea.nativeElement.focus();
                    });
                }
            } else if (event.key === 'ArrowRight' || event.key === 'Right') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex + 1, true);
            }
        } else {
            if ((event.key === 'ArrowLeft' || event.key === 'Left') && dragChipIndex > 0) {
                chipsArray[dragChipIndex - 1].chipArea.nativeElement.focus();
            } else if ((event.key === 'ArrowRight' || event.key === 'Right') && dragChipIndex < chipsArray.length - 1) {
                chipsArray[dragChipIndex + 1].chipArea.nativeElement.focus();
            }
        }
    }

    /**
     * @hidden
     */
    protected onChipMoveStart(event: IBaseChipEventArgs) {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = true;
            chip.cdr.detectChanges();
        });
        this.onMoveStart.emit({
                owner: this
        });
    }

    /**
     * @hidden
     */
    protected onChipMoveEnd(event: IBaseChipEventArgs) {
        this.chipsList.forEach((chip) => {
            chip.areaMovingPerforming = false;
            chip.cdr.detectChanges();
        });
        this.onMoveEnd.emit({
            owner: this
        });
    }

    /**
     * @hidden
     */
    protected onChipDragEnter(event: IChipEnterDragAreaEventArgs) {
        const dropChipRect = event.targetChip.elementRef.nativeElement.getBoundingClientRect();
        const dropChipIndex = this.chipsList.toArray().findIndex((el) => el === event.targetChip);
        const dragChipIndex = this.chipsList.toArray().findIndex((el) => el === event.dragChip);
        if (dragChipIndex < dropChipIndex) {
            // from the left to right
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, true);
        } else {
            // from the right to left
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, false);
        }
    }

    /**
     * @hidden
     */
    protected positionChipAtIndex(chipIndex, targetIndex, shiftRestLeft) {
        if (chipIndex < 0 || this.chipsList.length <= chipIndex ||
            targetIndex < 0 || this.chipsList.length <= targetIndex) {
            return false;
        }

        const chipsArray = this.chipsList.toArray();
        const result: IgxChipComponent[] = [];
        for (let i = 0; i < chipsArray.length; i++) {
            if (shiftRestLeft) {
                if (chipIndex <= i && i < targetIndex) {
                    result.push(chipsArray[i + 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            } else {
                if (targetIndex < i && i <= chipIndex) {
                    result.push(chipsArray[i - 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            }
        }
        this.modifiedChipsArray = result;

        const eventData: IChipsAreaReorderEventArgs = {
            chipsArray: this.modifiedChipsArray,
            isValid: true
        };
        this.onReorder.emit(eventData);
        return true;
    }

    /**
     * @hidden
     */
    protected onChipSelectionChange(event: IChipSelectEventArgs) {
        if (event.selected) {
            this.selectedChips.push(event.owner);
        } else if (!event.selected) {
            this.selectedChips = this.selectedChips.filter((chip) => {
                return chip.id !== event.owner.id;
            });
        }
        this.onSelection.emit({
            owner: this,
            newSelection: this.selectedChips
        });
    }
}
