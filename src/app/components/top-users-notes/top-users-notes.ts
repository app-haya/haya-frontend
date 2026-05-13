import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-top-users-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './top-users-notes.html',
  styleUrls: ['./top-users-notes.css']
})
export class TopUsersNotes implements OnInit {
  users: any[] = [];
  loading = true;
  Math = Math;

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 30;

  // Filter State
  months = Array.from({length: 12}, (_, i) => i + 1);
  years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  // Modal State
  selectedUser: any = null;
  noteText: string = '';
  isModalOpen: boolean = false;

  constructor(
    private usersService: UsersService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  onDateChange() {
    this.currentPage = 1;
    this.fetchUsers(this.currentPage);
  }

  fetchUsers(page: number = 1) {
    this.loading = true;
    this.usersService.getTopUsersWithNotes(page, this.perPage, this.selectedMonth, this.selectedYear).subscribe({
      next: (res: any) => {
        this.users = res.data || [];
        this.currentPage = res.meta?.page || 1;
        this.lastPage = res.meta?.total_pages || 1;
        this.total = res.meta?.total || 0;
        this.perPage = res.meta?.per_page || 30;
        this.loading = false;
      },
      error: (err: any) => {
        this.notification.error('Failed to load users');
        console.error(err);
        this.loading = false;
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

  openModal(item: any) {
    this.selectedUser = item;
    this.noteText = item.note || '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.noteText = '';
  }

  toggleStatus(item: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const newStatus = isChecked ? 'completed' : 'waiting';
    const oldStatus = item.status;
    
    // Optimistically update
    item.status = newStatus;

    this.usersService.updateUserNote(item.user_id, { 
      status: newStatus,
      month: this.selectedMonth,
      year: this.selectedYear 
    }).subscribe({
      next: () => {
        this.notification.success('Status updated successfully');
      },
      error: (err: any) => {
        this.notification.error('Failed to update status');
        // Revert
        item.status = oldStatus;
        if (event.target) {
          (event.target as HTMLInputElement).checked = oldStatus === 'completed';
        }
      }
    });
  }

  saveNote() {
    if (!this.selectedUser) return;
    
    const userId = this.selectedUser.user_id;
    const data = {
      note: this.noteText,
      month: this.selectedMonth,
      year: this.selectedYear
    };

    this.usersService.updateUserNote(userId, data).subscribe({
      next: (res: any) => {
        this.notification.success('Note updated successfully');
        // Update local data
        this.selectedUser.note = this.noteText;
        this.selectedUser.note_updated_at = new Date().toISOString();
        this.closeModal();
      },
      error: (err: any) => {
        this.notification.error('Failed to update note');
        console.error(err);
      }
    });
  }
}
