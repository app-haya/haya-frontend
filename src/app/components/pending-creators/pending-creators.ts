import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pending-creators',
  templateUrl: './pending-creators.html',
  styleUrls: ['./pending-creators.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PendingCreators implements OnInit {

  creators: any[] = [];
  filteredCreators: any[] = [];
  loading: boolean = false;

  searchTerm: string = '';

  currentPage = 1;
  lastPage = 1;

  constructor(private userService: UsersService,private notification: NotificationService,) {}

  ngOnInit(): void {
    this.loadPendingCreators();
  }

  loadPendingCreators(page: number = 1) {
    this.loading = true;
    this.userService.getPendingCreators(page).subscribe({
      next: (res: any) => {
        this.creators = res.data.data; // pagination structure
        this.filteredCreators = [...this.creators];
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Pagination
  prevPage() {
    if (this.currentPage > 1) {
      this.loadPendingCreators(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.loadPendingCreators(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    this.loadPendingCreators(page);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }

  // Approve / Reject
  approve(id: number) {
    this.userService.approveCreator(id).subscribe(() => {
      this.loadPendingCreators(this.currentPage);
     this.notification.success(' approved successfully!');

    });
  }

  reject(id: number) {
    this.userService.rejectCreator(id).subscribe(() => {
      this.loadPendingCreators(this.currentPage);
           this.notification.success(' rejected successfully!');

    });
  }

  // Search filter
  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCreators = this.creators.filter(c =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }
}
