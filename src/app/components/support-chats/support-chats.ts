import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-support-chats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    NgFor,
    NgIf,
    NgClass,
    DatePipe
  ],
  templateUrl: './support-chats.html',
  styleUrls: ['./support-chats.css']
})
export class SupportChats implements OnInit {
  @ViewChild('chatScrollContainer') chatScrollContainer!: ElementRef;

  chats: any[] = [];
  filteredChats: any[] = [];
  loadingChats: boolean = false;
  selectedChat: any = null;

  messages: any[] = [];
  loadingMessages: boolean = false;
  replyText: string = '';
  selectedFile: File | null = null;
  sendingReply: boolean = false;

  departments: any[] = [];
  selectedDepartmentId: number | null = null;
  searchTerm: string = '';

  // Pagination for chats
  currentPage: number = 1;
  lastPage: number = 1;
  totalChats: number = 0;

  // Toast
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  toastTimeout: any = null;

  constructor(
    private supportService: SupportService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadChats(1);
  }

  loadDepartments(): void {
    this.supportService.getDepartments().subscribe({
      next: (res: any) => {
        this.departments = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadChats(page: number = 1): void {
    this.loadingChats = true;
    this.currentPage = page;

    this.supportService.getSupportChats(page, 20, this.selectedDepartmentId || undefined).subscribe({
      next: (res: any) => {
        this.loadingChats = false;
        if (res && res.data) {
          const paginatedData = res.data;
          this.chats = Array.isArray(paginatedData.data) ? paginatedData.data : (Array.isArray(paginatedData) ? paginatedData : []);
          this.currentPage = paginatedData.current_page || page;
          this.lastPage = paginatedData.last_page || 1;
          this.totalChats = paginatedData.total !== undefined ? paginatedData.total : this.chats.length;
          this.filterChats();

          // Auto select first chat if available and none selected
          if (!this.selectedChat && this.filteredChats.length > 0) {
            this.selectChat(this.filteredChats[0]);
          }
        } else {
          this.chats = [];
          this.filteredChats = [];
        }
      },
      error: (err) => {
        this.loadingChats = false;
        console.error('Error fetching support chats:', err);
        this.chats = [];
        this.filteredChats = [];
      }
    });
  }

  onDepartmentChange(): void {
    this.selectedChat = null;
    this.messages = [];
    this.loadChats(1);
  }

  filterChats(): void {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredChats = [...this.chats];
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    this.filteredChats = this.chats.filter((c) => {
      const userName = (c.user?.name || c.name || '').toLowerCase();
      const userEmail = (c.user?.email || c.email || '').toLowerCase();
      const lastMsg = (c.last_message || c.message || '').toLowerCase();
      const deptName = (c.department?.name_ar || c.department?.name_en || '').toLowerCase();

      return (
        userName.includes(term) ||
        userEmail.includes(term) ||
        lastMsg.includes(term) ||
        deptName.includes(term)
      );
    });
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.messages = [];
    this.replyText = '';
    this.selectedFile = null;
    this.loadMessages(chat.uuid || chat.id);
  }

  loadMessages(chatUuid: string): void {
    this.loadingMessages = true;
    this.supportService.getChatMessages(chatUuid).subscribe({
      next: (res: any) => {
        this.loadingMessages = false;
        const data = res.data || res.messages || res;
        this.messages = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        this.scrollToBottom();
      },
      error: (err) => {
        this.loadingMessages = false;
        console.error('Error loading chat messages:', err);
        this.messages = [];
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  sendReply(): void {
    if (!this.selectedChat) return;
    if (!this.replyText.trim() && !this.selectedFile) {
      this.showToast(this.translate.instant('Please enter a message or attach a file'), 'danger');
      return;
    }

    const chatUuid = this.selectedChat.uuid || this.selectedChat.id;
    this.sendingReply = true;

    this.supportService.replyToChat(chatUuid, this.replyText.trim(), this.selectedFile || undefined).subscribe({
      next: (res: any) => {
        this.sendingReply = false;
        const newMsg = res.data || res.message || {
          message: this.replyText.trim(),
          sender_type: 'official',
          created_at: new Date().toISOString()
        };
        this.messages.push(newMsg);
        this.replyText = '';
        this.selectedFile = null;
        this.scrollToBottom();
        this.showToast(this.translate.instant('Reply sent successfully'), 'success');
      },
      error: (err) => {
        this.sendingReply = false;
        console.error('Error sending reply:', err);
        const msg = err.error?.message || this.translate.instant('Failed to send reply');
        this.showToast(msg, 'danger');
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        const el = this.chatScrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  showToast(message: string, type: 'success' | 'danger' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }
}
