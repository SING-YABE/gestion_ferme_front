import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'formatFileSize'
})
export class FormatFileSizePipe implements PipeTransform {
  transform(bytes: number, decimal: number = 2): string {
    if (!bytes || bytes <= 0) return '0 Ko';

    const megabytes = bytes / (1024 * 1024);

    if (megabytes >= 1) {
      return `${megabytes.toFixed(decimal)} Mo`;
    } else {
      const kilobits = (bytes * 8) / 1024;
      return `${kilobits.toFixed(decimal)} Kb`;
    }
  }
}
