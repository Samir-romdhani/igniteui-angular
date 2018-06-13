import {
    animate,
    AnimationBuilder,
    AnimationFactory,
    AnimationPlayer,
    style
} from '@angular/animations';
import {
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Inject
} from '@angular/core';
import { IgxNavigationService, IToggleView } from '../../core/navigation';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment } from '../../services/overlay/utilities';
import { IPositionStrategy } from '../../services/overlay/position/IPositionStrategy';
import { GlobalPositionStrategy } from '../../services/overlay/position/global-position-strategy';

@Directive({
    exportAs: 'overlay',
    selector: '[igxOverlay]'
})
export class IgxOverlayDirective implements IToggleView, OnInit, OnDestroy {

    @Output()
    public onOpened = new EventEmitter();

    @Output()
    public onOpening = new EventEmitter();

    @Output()
    public onClosed = new EventEmitter();

    @Output()
    public onClosing = new EventEmitter();

    @Input()
    public collapsed = true;

    @Input()
    public id: string;

    public get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding('class.igx-toggle--hidden')
    public get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding('class.igx-toggle')
    public get defaultClass() {
        return !this.collapsed;
    }

    constructor(
        private elementRef: ElementRef,
        private builder: AnimationBuilder,
        private cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) private overlayService: IgxOverlayService,
        @Optional() private navigationService: IgxNavigationService) { }

    public open(fireEvents?: boolean, positionStrategy?: IPositionStrategy) {
        if (!this.collapsed) { return; }

        const player = this.animationActivation();
        player.onStart(() => {
            positionStrategy = this.getPositionStrategy(positionStrategy);
            const id = this.overlayService.show(this.elementRef, this.id, positionStrategy);
            if (!this.id) {
                this.id = id;
            }
        });
        player.onDone(() => {
            player.destroy();
            if (fireEvents) {
                this.onOpened.emit();
            }
        });

        if (fireEvents) {
            this.onOpening.emit();
        }

        this.collapsed = false;
        player.play();
    }

    public close(fireEvents?: boolean) {
        if (this.collapsed) { return; }

        this.overlayService.hide(this.id);

        const player = this.animationActivation();
        player.onDone(() => {
            this.collapsed = true;
            // When using directive into component with OnPush it is necessary to
            // trigger change detection again when close animation ends
            // due to late updated @collapsed property.
            this.cdr.markForCheck();
            player.destroy();
            if (fireEvents) {
                this.onClosed.emit();
            }
        });

        if (fireEvents) {
            this.onClosing.emit();
        }

        player.play();
    }

    public toggle(fireEvents?: boolean, positionStrategy?: IPositionStrategy) {
        this.collapsed ? this.open(fireEvents, positionStrategy) : this.close(fireEvents);
    }

    public ngOnInit() {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
    }

    private animationActivation() {
        let animation: AnimationFactory;

        this.collapsed ?
            animation = this.openingAnimation() :
            animation = this.closingAnimation();

        return animation.create(this.elementRef.nativeElement);
    }

    private openingAnimation() {
        return this.builder.build([
            style({ transform: 'scaleY(0) translateY(-48px)', transformOrigin: '100% 0%', opacity: 0 }),
            animate('200ms ease-out', style({ transform: 'scaleY(1) translateY(0)', opacity: 1 }))
        ]);
    }

    private closingAnimation() {
        return this.builder.build([
            style({ transform: 'translateY(0)', opacity: 1 }),
            animate('120ms ease-in', style({ transform: 'translateY(-12px)', opacity: 0 }))
        ]);
    }

    private getPositionStrategy(positionStrategy?: IPositionStrategy): IPositionStrategy {
        positionStrategy = positionStrategy ? positionStrategy : new GlobalPositionStrategy();
        if (positionStrategy._options && positionStrategy._options.element) {
            const elementRect = positionStrategy._options.element.getBoundingClientRect();
            const x = elementRect.right + elementRect.width * positionStrategy._options.horizontalStartPoint;
            const y = elementRect.bottom + elementRect.height * positionStrategy._options.verticalStartPoint;
            positionStrategy._options.point = new Point(x, y);
        }

        positionStrategy._options = positionStrategy._options ? positionStrategy._options : new PositionSettings();
        return positionStrategy;
    }
}

@Directive({
    exportAs: 'toggle-action',
    selector: '[igxToggleAction]'
})
export class IgxToggleActionDirective implements OnDestroy, OnInit {
    @Input()
    public closeOnOutsideClick = true;

    @Input('igxToggleAction')
    set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    get target(): any {
        if (typeof this._target === 'string') {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    private _handler;
    private _target: IToggleView | string;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    public ngOnDestroy() {
        document.removeEventListener('click', this._handler, true);
    }

    public ngOnInit() {
        if (this.closeOnOutsideClick) {
            this._handler = (evt) => {
                if (this.target.element.contains(evt.target) || this.element.nativeElement.contains(evt.target)) {
                    return;
                }

                this.target.close(true);
                document.removeEventListener('click', this._handler, true);
            };

            document.addEventListener('click', this._handler, true);
        }
    }

    @HostListener('click')
    public onClick() {
        this.target.toggle(true);

        if (this._handler) {
            document.addEventListener('click', this._handler, true);
        }
    }
}
@NgModule({
    declarations: [IgxOverlayDirective, IgxToggleActionDirective],
    exports: [IgxOverlayDirective, IgxToggleActionDirective],
    providers: [IgxNavigationService]
})
export class IgxToggleModule { }
