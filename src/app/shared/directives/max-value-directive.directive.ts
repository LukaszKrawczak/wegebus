import {Directive, Input} from '@angular/core';
import {FormControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({
  selector: '[maxValue][formControlName],[maxValue][formControl],[maxValue][ngModel]',
  providers: [{provide: NG_VALIDATORS, useExisting: MaxValueDirectiveDirective, multi: true}]
})
export class MaxValueDirectiveDirective implements Validator{

  @Input()
  maxValue: number;

  validate(c: FormControl): {[key: string]: any} {
    let v = c.value;
    return ( v > this.maxValue)? {"maxValue": true} : null;
  }

}
