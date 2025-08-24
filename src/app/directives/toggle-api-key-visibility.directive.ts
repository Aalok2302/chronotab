import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appToggleApiKeyVisibility]'
})
export class ToggleApiKeyVisibilityDirective {
  private _isPasswordVisible: boolean = false;
  private _originalType: string = 'password';

  constructor(private el: ElementRef) {
    this._originalType = this.el.nativeElement.type;
  }

  private _isHovered: boolean = false;
  private _isFocused: boolean = false;

  @HostListener('mouseenter') onMouseEnter() {
    this._isHovered = true;
    this.updateInputType();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this._isHovered = false;
    this.updateInputType();
  }

  @HostListener('focus') onFocus() {
    this._isFocused = true;
    this.updateInputType();
  }

  @HostListener('blur') onBlur() {
    this._isFocused = false;
    this.updateInputType();
  }

  private updateInputType() {
    if (this._isHovered || this._isFocused) {
      this.el.nativeElement.type = 'text';
    } else {
      this.el.nativeElement.type = this._originalType;
    }
  }
}