import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pending-users',
  templateUrl: './pending-users.html',
  styleUrls: ['./pending-users.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class PendingUsers implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  loading: boolean = false;

  searchTerm: string = '';

  currentPage = 1;
  lastPage = 1;

  constructor(private userService: UsersService,private notification: NotificationService,) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(page: number = 1) {
    this.loading = true;
    this.userService.getPendingUsers(page).subscribe((res: any) => {
      this.users = res.data.data;
      this.filteredUsers = [...this.users]; // نسخة للفلترة
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page;
      this.loading = false;
    }, () => this.loading = false);
  }

  // Pagination
  prevPage() {
    if (this.currentPage > 1) {
      this.loadPendingUsers(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.loadPendingUsers(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    this.loadPendingUsers(page);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }

  // Approve / Reject
  approve(id: number) {
    this.userService.approveUser(id).subscribe(() => {
      this.loadPendingUsers(this.currentPage);
     this.notification.success(' approved successfully!');

    });
  }

  reject(id: number) {
    this.userService.rejectUser(id).subscribe(() => {
      this.loadPendingUsers(this.currentPage);
     this.notification.success(' rejected successfully!');

    });
  }

  // Search
  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  }
}
