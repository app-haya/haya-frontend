import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admins.html',
  styleUrls: ['./admins.css']
})
export class Admins implements OnInit {
  admins: any[] = [];
  filteredAdmins: any[] = [];
  searchTerm = '';
  loading = true;
  Math = Math;

  // Pagination variables
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  constructor(private adminService: AdminService,private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchAdmins();
  }

  fetchAdmins(page: number = 1) {
    this.loading = true;
    this.adminService.getAllAdmins(page).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0' && res.data) {
          this.admins = res.data.data || [];
          this.filteredAdmins = this.admins;

          this.currentPage = res.data.current_page || 1;
          this.lastPage = res.data.last_page || 1;
          this.total = res.data.total || 0;
          this.perPage = res.data.per_page || 10;
        } else {
          this.admins = [];
          this.filteredAdmins = [];
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching admins:', err);
        this.loading = false;
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAdmins = this.admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.phone?.toLowerCase().includes(term)
    );
  }

  deleteAdmin(id: number) {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    this.adminService.deleteAdmin(id).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') {
          this.notification.success(' Admin deleted successfully!');
          this.fetchAdmins(this.currentPage);
        } else {
          this.notification.error('Failed to delete admin');
        }
      },
      error: (err) => console.error('Delete error:', err)
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.fetchAdmins(page);
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.lastPage <= maxVisiblePages) {
      for (let i = 1; i <= this.lastPage; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > this.lastPage) {
        endPage = this.lastPage;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
