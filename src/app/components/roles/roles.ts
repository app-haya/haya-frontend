import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css'],
})
export class Roles implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];

  loading = false;
  searchTerm = '';

  showModal = false;
  modalTitle = 'Add Role';
  editingRole: any = null;

  formData = {
    id: null,
    name: '',
  };

  constructor(
    private rolesService: AdminService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;

    this.rolesService.getRoles().subscribe({
      next: (res) => {
        this.roles = res?.data || res || [];
        this.filteredRoles = [...this.roles];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading = false;
      },
    });
  }

  // 🔍 فلترة
  filterRoles(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredRoles = [...this.roles];
      return;
    }

    this.filteredRoles = this.roles.filter((role) =>
      (role.name || '').toLowerCase().includes(term)
    );
  }

  // ➕ إضافة
  openAddModal(): void {
    this.modalTitle = 'Add Role';
    this.showModal = true;
    this.editingRole = null;
    this.formData = { id: null, name: '' };
  }

  // ✏ تعديل
  openEditModal(role: any): void {
    this.modalTitle = 'Edit Role';
    this.showModal = true;
    this.editingRole = role;

    this.formData = {
      id: role.id,
      name: role.name,
    };
  }

  saveRole(): void {
    const req$ = this.editingRole
      ? this.rolesService.updateRole(this.formData.id!, { name: this.formData.name })
      : this.rolesService.createRole({ name: this.formData.name });

    req$.subscribe({
      next: () => {
        this.notification.success('Role saved successfully');
        this.showModal = false;
        this.loadRoles();
      },
      error: () => this.notification.error('Failed to save role'),
    });
  }

  // 🗑 حذف
  deleteRole(id: number): void {
    if (!confirm('Are you sure you want to delete this role?')) return;

    this.rolesService.deleteRole(id).subscribe({
      next: () => {
        this.notification.success('Role deleted successfully');
        this.roles = this.roles.filter((r) => r.id !== id);
        this.filteredRoles = this.filteredRoles.filter((r) => r.id !== id);
      },
      error: (err) => {
        console.error(err);
        this.notification.error('Failed to delete role');
      },
    });
  }
}
