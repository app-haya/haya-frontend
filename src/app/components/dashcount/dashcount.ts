import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DealService } from '../../services/deal.service';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashcount',
  standalone: true,
  imports: [CommonModule, TranslateModule, BaseChartDirective],
  templateUrl: './dashcount.html',
  styleUrl: './dashcount.css',
})
export class Dashcount implements OnInit {
  counts: any = {};
  loading: boolean = true;
  totalDealOrders: number = 0;

  // 📈 Revenue Area Chart Header Data
  revenueHeader = {
    total: '12,450.00 ر.س',
    paid: '45',
    unpaid: '12'
  };

  // 📊 Statistics Bar Chart Header Data
  statsHeader = {
    totalBookings: '156',
    completed: '132',
    confirmed: '20',
    pending: '4'
  };

  // --- Area Chart (Users & Merchants) ---
  public lineChartData: ChartData<'line'> = {
    labels: ['أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'],
    datasets: [
      {
        data: [],
        label: 'Users',
        fill: 'origin',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        data: [],
        label: 'Merchants',
        fill: 'origin',
        borderColor: '#00cfd5',
        backgroundColor: 'rgba(0, 207, 213, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00cfd5',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b949e', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8b949e', font: { size: 10 } }
      }
    }
  };

  // --- Bar Chart (Deals) ---
  public barChartData: ChartData<'bar'> = {
    labels: ['نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'],
    datasets: [
      {
        data: [],
        label: 'Approved',
        backgroundColor: '#00cfd5',
        borderRadius: 4
      },
      {
        data: [],
        label: 'Pending',
        backgroundColor: '#7a3ca0',
        borderRadius: 4
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b949e', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8b949e', font: { size: 10 } }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private dealService: DealService
  ) { }

  ngOnInit(): void {
    this.dashboardService.getAll().subscribe({
      next: (res) => {
        this.counts = res.data;
        this.updateCharts(res.data);
        
        // Fetch total deal orders count
        this.dealService.getAllDealOrders(1).subscribe({
          next: (orderRes) => {
            this.totalDealOrders = orderRes.data?.total || 0;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private updateCharts(data: any): void {
    // 1️⃣ Update Headers (Using real counts)
    this.revenueHeader = {
      total: (data.users + data.merchants).toLocaleString(),
      paid: data.users.toString(),
      unpaid: data.merchants.toString()
    };

    this.statsHeader = {
      totalBookings: (data.approved_deals + data.pending_deals).toString(),
      completed: data.approved_deals.toString(),
      confirmed: data.approved_deals.toString(),
      pending: data.pending_deals.toString()
    };

    // 2️⃣ Generate Dynamic Mock Trends leading to the current value
    const generateTrend = (finalValue: number, steps: number) => {
      return Array.from({ length: steps }, (_, i) =>
        Math.floor(finalValue * (0.6 + Math.random() * 0.4) * (i + 1) / steps)
      );
    };

    // Update Area Chart
    this.lineChartData.datasets[0].data = generateTrend(data.users, 12);
    this.lineChartData.datasets[1].data = generateTrend(data.merchants, 12);

    // Update Bar Chart (Last 5 months)
    this.barChartData.datasets[0].data = generateTrend(data.approved_deals, 5);
    this.barChartData.datasets[1].data = generateTrend(data.pending_deals, 5);
  }
}