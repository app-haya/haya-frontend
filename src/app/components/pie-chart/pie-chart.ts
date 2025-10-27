import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './pie-chart.html',
  styleUrls: ['./pie-chart.css']
})
export class PieChart {
  public pieChartData: ChartData<'pie'> = {
    labels: ['Erlang', 'Ruby', 'Haskell', 'Go', 'Java'],
    datasets: [
      {
        data: [438, 483, 388, 187, 455],
        backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // ✅ النوع الصحيح، ما تحطه كـ string عادي
        labels: {
          font: { size: 14 },
          padding: 20
        }
      },
      tooltip: {
        enabled: true
      }
    }
  };
}
