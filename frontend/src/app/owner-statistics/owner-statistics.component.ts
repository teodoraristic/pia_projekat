import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { CabinService } from '../services/cabin.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-owner-statistics',
  standalone: true,
  imports: [],
  templateUrl: './owner-statistics.component.html',
  styleUrl: './owner-statistics.component.css'
})

export class OwnerStatisticsComponent implements OnInit, AfterViewInit {

  private reservationService = inject(ReservationService);
  private cabinService = inject(CabinService);
  isLoading: boolean = false;
  message: string = '';
  
  cabins: any[] = [];
  reservations: any[] = [];
  statistics: any = {};

  barChart: any;
  pieCharts: any[] = [];

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
  }

  loadStatistics(): void {
    this.isLoading = true;
    const userData = localStorage.getItem('loggedInUser');
    const currentUser = userData ? JSON.parse(userData) : null;
    
    if (!currentUser || !currentUser._id) {
      this.message = 'Korisnik nije pronađen';
      this.isLoading = false;
      return;
    }

    Promise.all([
      this.cabinService.getOwnerCabins(currentUser._id).toPromise(),
      this.reservationService.getOwnerReservations(currentUser._id).toPromise()
    ]).then(([cabins, reservations]) => {
      this.cabins = cabins || [];
      this.reservations = reservations || [];
      
      this.prepareStatistics();
      
      setTimeout(() => {
        this.createBarChart();
        this.createPieCharts();
        this.isLoading = false;
      }, 300);
      
    }).catch(error => {
      this.message = 'Greška pri učitavanju statistike: ' + error.message;
      this.isLoading = false;
      console.error('Greška:', error);
    });
  }


  prepareStatistics(): void {
    const monthlyData = this.prepareMonthlyData();
    
    const weekendData = this.prepareWeekendData();
    
    this.statistics = {
      monthlyData,
      weekendData
    };
  }

  prepareMonthlyData(): any {
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
  
  const monthlyStats: any = {};
  
  this.cabins.forEach(cabin => {
    monthlyStats[cabin._id] = {
      cabinName: cabin.name,
      data: new Array(12).fill(0)
    };
  });

  this.reservations.forEach(reservation => {
    console.log('Rezervacija cabinId struktura:', reservation.cabinId);
    
    if (reservation.status == 'completed' || reservation.status == 'confirmed') {
      const startDate = new Date(reservation.startDate);
      const year = startDate.getFullYear();
      
      if (year == currentYear) {
        const month = startDate.getMonth();
        
        const cabinId = reservation.cabinId._id; 
        
        console.log('Pokušavam dodati za cabinId:', cabinId);
        
        if (monthlyStats[cabinId]) {
          monthlyStats[cabinId].data[month]++;
          console.log(`USPEH: Dodato u cabin ${cabinId}, mesec ${month}`);
        } else {
          console.warn(`Cabin ${cabinId} nije pronađen u monthlyStats`);
          console.log('Dostupni cabinovi:', Object.keys(monthlyStats));
        }
      }
    }
  });

  return {
    labels: months,
    datasets: this.cabins.map(cabin => ({
      label: cabin.name,
      data: monthlyStats[cabin._id]?.data || new Array(12).fill(0),
      backgroundColor: this.getRandomColor()
    }))
  };
}

  prepareWeekendData(): any {
    const weekendStats: any = {};
    
    this.cabins.forEach(cabin => {
      weekendStats[cabin._id] = {
        cabinName: cabin.name,
        weekend: 0,
        weekday: 0
      };
    });

    this.reservations.forEach(reservation => {
      if (reservation.status == 'completed' || reservation.status == 'confirmed') {
        const startDate = new Date(reservation.startDate);
        const dayOfWeek = startDate.getDay();
        
        const cabinId = reservation.cabinId._id; 
        
        if (weekendStats[cabinId]) {
          if (dayOfWeek == 0 || dayOfWeek == 6) {
            weekendStats[cabinId].weekend++;
          } else {
            weekendStats[cabinId].weekday++;
          }
        }
      }
    });

    return weekendStats;
  }

  createBarChart(): void {
    if (!this.statistics.monthlyData?.datasets?.length) {
      console.warn('Nema podataka za bar chart');
      return;
    }
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    
    if (!ctx) {
      console.error('Canvas element sa ID "barChart" nije pronađen');
      return;
    }

    if (!ctx.getContext) {
      console.error('Canvas context nije dostupan');
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    try {
      const config: ChartConfiguration = {
        type: 'bar',
        data: this.statistics.monthlyData,
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Broj rezervacija po mesecima'
            },
            legend: {
              position: 'top',
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Meseci'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Broj rezervacija'
              },
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      };

      this.barChart = new Chart(ctx, config);
    } catch (error) {
      console.error('Greška pri kreiranju bar chart-a:', error);
    }
  }


  createPieCharts(): void {
    const container = document.getElementById('pieChartsContainer');
    if (!container) {
      console.error('Container za pie chart-ove nije pronađen');
      return;
    }

    container.innerHTML = '';
    this.pieCharts = [];

    Object.keys(this.statistics.weekendData).forEach(cabinId => {
      const data = this.statistics.weekendData[cabinId];
      const canvasId = `pieChart-${cabinId}`;
      
      const chartWrapper = document.createElement('div');
      chartWrapper.className = 'pie-chart-wrapper';
      
      const canvas = document.createElement('canvas');
      canvas.id = canvasId;
      canvas.width = 300;
      canvas.height = 300;
      chartWrapper.appendChild(canvas);

      const infoDiv = document.createElement('div');
      infoDiv.className = 'pie-chart-info';
      infoDiv.innerHTML = `
        <h4>${data.cabinName}</h4>
        <p>Vikend: ${data.weekend} rezervacija</p>
        <p>Radni dani: ${data.weekday} rezervacija</p>
        <p>Ukupno: ${data.weekend + data.weekday} rezervacija</p>
      `;
      chartWrapper.appendChild(infoDiv);

      container.appendChild(chartWrapper);

      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Vikend', 'Radni dani'],
              datasets: [{
                data: [data.weekend, data.weekday],
                backgroundColor: ['#FF6384', '#36A2EB']
              }]
            },
            options: {
              responsive: false,
              plugins: {
                title: {
                  display: true,
                  text: data.cabinName
                },
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
          this.pieCharts.push(pieChart);
        }
      } catch (error) {
        console.error(`Greška pri kreiranju pie chart-a za ${data.cabinName}:`, error);
      }
    });
  }

  getRandomColor(): string {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#7CFFB2', '#FF6384'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  refreshStatistics(): void {
    this.loadStatistics();
  }

  getCompletedReservations(): number {
  return this.reservations.filter(res => 
    res.status == 'completed' || res.status == 'confirmed'
  ).length;
  }

}