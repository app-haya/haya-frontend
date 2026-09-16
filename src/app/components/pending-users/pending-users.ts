import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pending-users',
  templateUrl: './pending-users.html',
  styleUrls: ['./pending-users.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class PendingUsers implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  currentPage = 1;
  lastPage = 1;
  total = 0;

  showRejectModal = false;
  rejectReason = '';
  currentRejectId: number | null = null;

  // Document preview modal
  showDocumentPreview = false;
  previewUrl: string = '';
  previewTitle: string = '';
  safePreviewUrl: SafeResourceUrl | null = null;
  isPdf = false;

  constructor(
    private userService: UsersService,
    private notification: NotificationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(page: number = 1): void {
    this.loading = true;
    this.userService.getPendingUsers(page).subscribe({
      next: (res: any) => {
        this.users = res.data.data;
        this.filteredUsers = [...this.users];
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
        this.total = res.data.total ?? this.users.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadPendingUsers(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadPendingUsers(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    this.loadPendingUsers(page);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }

  approve(id: number): void {
    this.userService.approveUser(id).subscribe(() => {
      this.loadPendingUsers(this.currentPage);
      this.notification.success(' approved successfully!');
    });
  }

  reject(id: number): void {
    this.currentRejectId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.currentRejectId = null;
    this.rejectReason = '';
  }

  submitReject(): void {
    if (this.currentRejectId === null) return;
    this.userService.rejectUser(this.currentRejectId, this.rejectReason).subscribe(() => {
      this.loadPendingUsers(this.currentPage);
      this.notification.success('Rejected successfully!');
      this.closeRejectModal();
    });
  }

  search(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  }

  viewDocument(url: string, title: string = 'Verify Image'): void {
    if (!url) return;
    this.previewUrl = url;
    this.previewTitle = title;
    this.isPdf = url.toLowerCase().split('?')[0].includes('.pdf');
    if (this.isPdf) {
      const pdfEmbedUrl = (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('blob:') || url.startsWith('data:'))
        ? url
        : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfEmbedUrl);
    } else {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    this.showDocumentPreview = true;
  }

  closeDocumentPreview(): void {
    this.showDocumentPreview = false;
    this.previewUrl = '';
    this.safePreviewUrl = null;
    this.isPdf = false;
  }

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.showDocumentPreview) {
      this.closeDocumentPreview();
    }
    if (this.showRejectModal) {
      this.closeRejectModal();
    }
  }
}