import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { SyntheseFinanciere, SyntheseFinanciereService } from '../../@core/service/synthese-financiere.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-syntheses-financieres',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  templateUrl: './syntheses-financieres.component.html',
  styleUrl: './syntheses-financieres.component.scss'
})
export class SynthesesFinancieresComponent implements OnInit {

  synthese!: SyntheseFinanciere;
  lineData: any;
  lineOptions: any;

  constructor(private service: SyntheseFinanciereService) {}

  ngOnInit(): void {
    this.loadSynthese();
    this.loadChartData();
  }

  loadSynthese(): void {
    this.service.getSynthese().subscribe((data) => {
      this.synthese = data;
    });
  }

  loadChartData(): void {
    const mois = [
      { nom: 'Janvier', debut: '2025-01-01', fin: '2025-01-31' },
      { nom: 'Février', debut: '2025-02-01', fin: '2025-02-28' },
      { nom: 'Mars', debut: '2025-03-01', fin: '2025-03-31' },
      { nom: 'Avril', debut: '2025-04-01', fin: '2025-04-30' },
      { nom: 'Mai', debut: '2025-05-01', fin: '2025-05-31' },
      { nom: 'Juin', debut: '2025-06-01', fin: '2025-06-30' },
      { nom: 'Juillet', debut: '2025-07-01', fin: '2025-07-31' },
      { nom: 'Août', debut: '2025-08-01', fin: '2025-08-31' },
      { nom: 'Septembre', debut: '2025-09-01', fin: '2025-09-30' },
      { nom: 'Octobre', debut: '2025-10-01', fin: '2025-10-31' },
      { nom: 'Novembre', debut: '2025-11-01', fin: '2025-11-30' },
      { nom: 'Décembre', debut: '2025-12-01', fin: '2025-12-31' }
    ];

    // Créer un tableau de requêtes pour chaque mois
    const requetes = mois.map(m => 
      this.service.getSynthese(m.debut, m.fin)
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(requetes).subscribe((resultats: SyntheseFinanciere[]) => {
      const nomsMois = mois.map(m => m.nom);
      const ventes = resultats.map(r => r.totalVentes);
      const charges = resultats.map(r => r.totalCharges);
      const benefices = resultats.map(r => r.beneficeNet);

      this.prepareChart(nomsMois, ventes, charges, benefices);
    });
  }
  exportExcel() {
}

prepareChart(mois: string[], ventes: number[], charges: number[], benefices: number[]) {
  this.lineData = {
    labels: mois,
    datasets: [
      {
        type: 'bar',
        label: 'Ventes',
        data: ventes,
        backgroundColor: '#3b82f6', // bleu
      },
      {
        type: 'bar',
        label: 'Charges',
        data: charges,
        backgroundColor: '#ef4444', // rouge
      },
      {
        type: 'bar',
        label: 'Bénéfice',
        data: benefices,
        backgroundColor: '#22c55e', // vert
      }
    ]
  };

  this.lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            // context.raw fonctionne mieux pour bar charts avec datasets multiples
            const value = context.raw;
            return context.dataset.label + ': ' + value.toLocaleString() + ' FCFA';
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        ticks: {
          color: '#6b7280',
          font: { size: 14, weight: '500' }
        },
        grid: { color: '#e5e7eb', drawBorder: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          font: { size: 14, weight: '500' },
          callback: function(value: any) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M FCFA';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k FCFA';
            return value + ' FCFA';
          }
        },
        grid: { color: '#e5e7eb', drawBorder: false }
      }
    }
  };
}



}