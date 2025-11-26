// src/app/components/stat-card/stat-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() isPercentage: boolean = false;

  get displayValue(): string {
    if (this.isPercentage) {
      return `${this.value}%`;
    }
    return this.value?.toString() || '0';
  }

  getIconClass(): string {
    switch (this.icon) {
      case '🖥️': return 'pi pi-desktop';
      case '📋': return 'pi pi-file';
      case '⏳': return 'pi pi-clock';
      case '✅': return 'pi pi-check-circle';
      case '👥': return 'pi pi-users';
      case '👨‍💼': return 'pi pi-user-plus';
      case '🎯': return 'pi pi-target';
      case '💻': return 'pi pi-laptop';
      case '⚡': return 'pi pi-bolt';
      case '📈': return 'pi pi-chart-line';
      case '📊': return 'pi pi-chart-bar';
      default: return 'pi pi-info-circle';
    }
  }
}