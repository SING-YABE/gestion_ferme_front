import { Component, OnInit } from '@angular/core';
import { HomeService, PourcentageTypeCharge, StatsReproductions } from '../../@core/service/home-service.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,ChartModule, HttpClientModule, FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})


export class HomeComponent implements OnInit {

  stats: StatsReproductions | null = null;
  charges: PourcentageTypeCharge[] = []
  alertesMiseBas: any[] = [];
venteChartData: any;
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
anneesDisponibles: number[] = [];
anneeSelectionnee: number | null = null;

  chartData: any;

  constructor(private homeService: HomeService) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadCharges();
    this.loadAlertes();
    this.loadEvolutionVentes();
  }

  loadStats() {
    this.homeService.getStatsReproductions().subscribe(res => this.stats = res);
  }
  loadAlertes() {
    this.homeService.getAlertes().subscribe(res => this.alertesMiseBas = res);
  }
  loadCharges() {
    this.homeService.getPourcentageParType().subscribe(res => {
      this.charges = res;

      this.chartData = {
        labels: res.map(c => `${c.typeDepense} (${c.montant})`),
        datasets: [
          {
            data: res.map(c => c.montant),
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#FF7043'],
          }
        ]
      };
    });
  }


loadEvolutionVentes() {
  this.homeService.getEvolutionVentes().subscribe(data => {

    const grouped: any = {};

    data.forEach(item => {
      if (!grouped[item.annee]) grouped[item.annee] = Array(12).fill(0);
      grouped[item.annee][item.mois - 1] = item.totalVentes;
    });

    this.anneesDisponibles = Object.keys(grouped).map(a => Number(a));

    // Sélection automatique si aucune année choisie
    if (!this.anneeSelectionnee && this.anneesDisponibles.length > 0) {
      this.anneeSelectionnee = this.anneesDisponibles[0];
    }

    this.updateVentesChart(grouped);
  });
}
updateVentesChart(grouped: any) {
  if (!this.anneeSelectionnee) return;

  const data = grouped[this.anneeSelectionnee];

  this.venteChartData = {
    labels: this.months,
    datasets: [
      {
        label: this.anneeSelectionnee.toString(),
        data,
        fill: false,
        borderColor: this.getRandomColor(),
        tension: 0.4
      }
    ]
  };
}


getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
}











