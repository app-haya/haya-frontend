import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, TranslateModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  users: any[] = [];
  Math = Math;
  filteredUsers: any[] = [];
  searchTerm = '';
  loading = true;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;
  paginationLinks: any[] = [];

  constructor(
    private usersService: UsersService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(page: number = 1) {
    this.loading = true;
    this.usersService.getAllUsers(page).subscribe({
      next: (res: any) => {
        this.users = res.users?.data || [];
        this.filteredUsers = this.users;
        this.loading = false;
        this.currentPage = res.users?.current_page || 1;
        this.lastPage = res.users?.last_page || 1;
        this.total = res.users?.total || 0;
        this.perPage = res.users?.per_page || 10;
        this.paginationLinks = res.users?.links || [];
      },
      error: (err) => {
        this.notification.error('Failed to load users');
        console.error(err);
        this.loading = false;
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  }

  deleteUser(id: number) {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this user?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.usersService.deleteUser(id).subscribe({
          next: () => {
            this.notification.success('User deleted successfully');
            this.fetchUsers(this.currentPage);
          },
          error: (err) => {
            this.notification.error('Failed to delete user');
            console.error(err);
          }
        });
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.fetchUsers(page);
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