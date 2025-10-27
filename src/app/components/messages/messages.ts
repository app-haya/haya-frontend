import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../../services/messages.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class Messages implements OnInit {
  messages: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  lastPage: number = 1;
  loading: boolean = false;
  fromDate: string = '';
  toDate: string = '';

  constructor(private messagesService: MessagesService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(page: number = 1) {
    this.loading = true;
    this.messagesService.getAllMessages(page).subscribe(
      (res: any) => {
        this.messages = res.messages.data;
        this.currentPage = res.messages.current_page;
        this.lastPage = res.messages.last_page;
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }
filterMessages(page: number = 1) {
  const formData = new FormData();

  if (this.searchTerm.trim() !== '') formData.append('message', this.searchTerm);
  if (this.fromDate) formData.append('created_at', this.fromDate);

  this.loading = true;
  this.currentPage = page;

  this.messagesService.filterMessages(formData, page).subscribe(
    (res: any) => {
      this.messages = res.data.data;
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page || 1;
      this.loading = false;
    },
    () => (this.loading = false)
  );
}

goToPage(page: number) {
  if (page < 1 || page > this.lastPage) return;
  this.currentPage = page;

  if (this.searchTerm.trim() !== '' || this.fromDate.trim() !== '') {
    this.filterMessages(page);
  } else {
    this.loadMessages(page);
  }
}

prevPage() {
  this.goToPage(this.currentPage - 1);
}

nextPage() {
  this.goToPage(this.currentPage + 1);
}

getPageNumbers(): number[] {
  const pages: number[] = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(this.currentPage - 2, 1);
  let endPage = Math.min(startPage + maxPagesToShow - 1, this.lastPage);

  startPage = Math.max(endPage - maxPagesToShow + 1, 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}
}
