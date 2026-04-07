import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../../../../services/admin.service';
import { NotificationService } from '../../../../services/notification.service';
import { DialogService } from '../../../../services/dialog.service';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './admins.html',
  styleUrls: ['./admins.css'],
})
export class Admins implements OnInit {
  admins: any[] = [];
  filteredAdmins: any[] = [];
  searchTerm = '';
  loading = true;
  isDark = false;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private dialogService: DialogService
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
          this.filteredAdmins = [...this.admins];
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
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
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this admin?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.adminService.deleteAdmin(id).subscribe({
          next: (res: any) => {
            if (res.errorcode === '0') {
              this.notification.success('Admin deleted successfully!');
              this.fetchAdmins(this.currentPage);
            }
          },
        });
      }
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
    const max = 5;
    if (this.lastPage <= max) {
      for (let i = 1; i <= this.lastPage; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.lastPage, start + 4);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }
}