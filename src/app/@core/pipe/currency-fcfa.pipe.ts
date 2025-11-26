import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'currencyFcfa'
})
export class CurrencyFcfa implements PipeTransform {
  transform(value: number | string, decimals: number = 2): string {
    if (value == null) return '';

    let amount = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(amount)) return '';

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount) + ' XOF';
  }
}
