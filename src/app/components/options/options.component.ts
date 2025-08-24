import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  standalone: false,
})
export class OptionsComponent implements OnInit {
  @Input() initialCity: string = 'Toronto';
  @Input() initialApiKey: string = '';
  @Output() optionsSubmitted = new EventEmitter<{ city: string; apiKey: string }>();
  @Output() closeOptions = new EventEmitter<void>();

  optionsForm!: FormGroup;
  isHovered: boolean = false;
  isFocused: boolean = false;

  get showApiKey(): boolean {
    return this.isHovered || this.isFocused;
  }

  ngOnInit() {
    this.optionsForm = new FormGroup({
      city: new FormControl(this.initialCity, Validators.required),
      apiKey: new FormControl(this.initialApiKey, Validators.required),
    });
  }

  toggleApiKeyVisibility(isVisible: boolean, source: 'hover' | 'focus') {
    if (source === 'hover') {
      this.isHovered = isVisible;
    } else if (source === 'focus') {
      this.isFocused = isVisible;
    }
  }

  onSubmit() {
    if (this.optionsForm.valid) {
      this.optionsSubmitted.emit(this.optionsForm.value);
    }
  }

  onClose() {
    this.closeOptions.emit();
  }
}