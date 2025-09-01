import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Options, OptionsService } from '../../../services/options.service';

@Component({
  selector: 'weather-options',
  templateUrl: './weather-options.component.html',
  standalone: false,
})
export class WeatherOptionsComponent implements OnInit {
  @Output() closeOptions = new EventEmitter<void>();

  optionsForm!: FormGroup;

  constructor(private optionsService:OptionsService){}

  ngOnInit() {
    const {apiKey, city} = this.optionsService.getWeatherOptions();
    this.optionsForm = new FormGroup({
      city: new FormControl(city ? city : '', Validators.required),
      apiKey: new FormControl(apiKey ? apiKey : '', Validators.required),
    });
  }

  onSubmit() {
    if (this.optionsForm.valid) {
      const options:Options['weather'] = {
        apiKey: this.optionsForm.value['apiKey'],
        city: this.optionsForm.value['city']
      }
      this.optionsService.setWeatherOptions(options);
    }
  }

  onClose() {
    this.closeOptions.emit();
  }
}