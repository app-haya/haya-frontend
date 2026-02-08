import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DealService } from '../../../services/deal.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-deal-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './deal-details.html',
    styleUrls: ['./deal-details.css']
})
export class DealDetails implements OnInit {
    deal: any = null;
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dealService: DealService,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        // Try to get deal from router state first
        const stateDeal = history.state.deal;
        if (stateDeal) {
            this.deal = stateDeal;
            this.loading = false;
        } else {
            // If no state (e.g. refresh), we might need to fetch, 
            // but user said the endpoint doesn't exist.
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.notification.error('Deal data lost on refresh. Navigating back...');
                setTimeout(() => {
                    window.history.back();
                }, 2000);
            }
        }
    }

    approve() {
        this.dealService.approveDeal(this.deal.id).subscribe({
            next: () => {
                this.notification.success('Deal approved successfully');
                this.deal.status = 'approved';
                setTimeout(() => this.router.navigate(['/deals']), 1500);
            }
        });
    }

    reject() {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason && reason.trim()) {
            this.dealService.rejectDeal(this.deal.id, reason).subscribe({
                next: () => {
                    this.notification.success('Deal rejected successfully');
                    this.deal.status = 'rejected';
                    setTimeout(() => this.router.navigate(['/deals']), 1500);
                }
            });
        }
    }
}
