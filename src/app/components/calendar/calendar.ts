import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  currentDate: Date = new Date();
  currentMonth: number = 9; // October (0-indexed)
  currentYear: number = 2025;
  daysInMonth: any[] = []; // سيحتوي على معلومات كل يوم
  events: any[] = [];
  viewMode: 'month' | 'week' | 'day' = 'month';
  selectedDate: Date | null = null;
  showEventModal: boolean = false;
  eventTitle: string = '';
  selectedDay: number | null = null;
  showEventDetailsModal: boolean = false;
  selectedEventForDetails: any = null;

  constructor() {
    this.loadEventsFromStorage();
  }

  ngOnInit() {
    this.generateCalendar();
  }

  // تحميل الأحداث من التخزين المحلي
  loadEventsFromStorage() {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // تحويل تواريخ الأحداث من نص إلى كائنات Date
        this.events = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      } catch (e) {
        console.error('Error parsing events from storage', e);
        // إذا حدث خطأ، استخدم الأحداث الافتراضية
        this.events = [
          { id: 1, title: 'Team Meeting', date: new Date(2025, 9, 12) },
          { id: 2, title: 'Product Launch', date: new Date(2025, 9, 21) }
        ];
      }
    } else {
      // إذا لم تكن هناك أحداث مخزنة، استخدم الأحداث الافتراضية
      this.events = [
        { id: 1, title: 'Team Meeting', date: new Date(2025, 9, 12) },
        { id: 2, title: 'Product Launch', date: new Date(2025, 9, 21) }
      ];
    }
  }

  // حفظ الأحداث في التخزين المحلي
  saveEventsToStorage() {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    this.daysInMonth = [];
    
    // إضافة أيام فارغة في بداية الشهر
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.daysInMonth.push({ day: null, isCurrentMonth: false });
    }
    
    // إضافة أيام الشهر
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const dayEvents = this.getEventsForDate(i);
      this.daysInMonth.push({
        day: i,
        isCurrentMonth: true,
        date: date,
        events: dayEvents,
        isToday: this.isToday(date),
        hasEvents: dayEvents.length > 0
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  setViewMode(mode: 'month' | 'week' | 'day') {
    this.viewMode = mode;
    console.log('View mode changed to:', mode);
    // هنا يمكن إضافة منطق لعرض التقويم حسب الوضع المحدد
  }

  getEventsForDate(day: number): any[] {
    return this.events.filter(event => 
      event.date.getDate() === day && 
      event.date.getMonth() === this.currentMonth && 
      event.date.getFullYear() === this.currentYear
    );
  }

  selectDate(dayInfo: any) {
    if (dayInfo.isCurrentMonth) {
      this.selectedDate = dayInfo.date;
      this.selectedDay = dayInfo.day;
      this.eventTitle = '';
      this.showEventModal = true;
    }
  }

  getMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.currentMonth];
  }

  saveEvent() {
    if (this.eventTitle.trim() !== '' && this.selectedDate) {
      // إضافة حدث جديد
      const newEvent = {
        id: this.events.length + 1,
        title: this.eventTitle,
        date: new Date(this.selectedDate)
      };
      this.events.push(newEvent);
      this.saveEventsToStorage(); // حفظ الأحداث في التخزين المحلي
      this.generateCalendar();
      this.closeEventModal();
    }
  }

  closeEventModal() {
    this.showEventModal = false;
    this.eventTitle = '';
    this.selectedDay = null;
  }

  // حذف حدث
  deleteEvent(eventId: number, event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // منع انتشار الحدث
    }
    
    // البحث عن الحدث وحذفه
    this.events = this.events.filter(event => event.id !== eventId);
    
    // حفظ التغييرات في التخزين المحلي
    this.saveEventsToStorage();
    
    // إعادة إنشاء التقويم
    this.generateCalendar();
    
    // إذا كان الحدث معروضًا في نافذة التفاصيل، أغلق النافذة
    if (this.selectedEventForDetails && this.selectedEventForDetails.id === eventId) {
      this.closeEventDetailsModal();
    }
  }

  // فتح نافذة تفاصيل الحدث
  openEventDetails(event: any, eventObj: MouseEvent) {
    eventObj.stopPropagation(); // منع انتشار الحدث لفتح نافذة إضافة حدث جديد
    this.selectedEventForDetails = event;
    this.showEventDetailsModal = true;
  }

  // إغلاق نافذة تفاصيل الحدث
  closeEventDetailsModal() {
    this.showEventDetailsModal = false;
    this.selectedEventForDetails = null;
  }

  // حذف الحدث من نافذة التفاصيل
  deleteEventFromDetails() {
    if (this.selectedEventForDetails) {
      this.deleteEvent(this.selectedEventForDetails.id);
      this.closeEventDetailsModal();
    }
  }
}