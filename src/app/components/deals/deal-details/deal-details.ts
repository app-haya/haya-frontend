import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
        private dealService: DealService,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadDealDetails(+id);
        }
    }

    loadDealDetails(id: number) {
        this.loading = true;
        this.dealService.getDealById(id).subscribe({
            next: (res: any) => {
                this.deal = res.data;
                this.loading = false;
            },
            error: (err) => {
                this.notification.error('Failed to load deal details');
                this.loading = false;
            }
        });
    }

    approve() {
        this.dealService.approveDeal(this.deal.id).subscribe({
            next: () => {
                this.notification.success('Deal approved successfully');
                this.loadDealDetails(this.deal.id);
            }
        });
    }

    reject() {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason && reason.trim()) {
            this.dealService.rejectDeal(this.deal.id, reason).subscribe({
                next: () => {
                    this.notification.success('Deal rejected successfully');
                    this.loadDealDetails(this.deal.id);
                }
            });
        }
    }
}
