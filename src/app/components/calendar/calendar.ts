import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  currentDate: Date = new Date();
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();

  daysInMonth: any[] = [];
  events: any[] = [];

  selectedDate: Date | null = null;
  showEventModal: boolean = false;
  eventTitle: string = '';

  showEventDetailsModal: boolean = false;
  selectedEventForDetails: any = null;

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor() {
    this.loadEventsFromStorage();
  }

  ngOnInit() {
    this.generateCalendar();
  }

  loadEventsFromStorage() {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        this.events = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
      } catch (e) {
        console.error('Error parsing events', e);
        this.getDefaultEvents();
      }
    } else {
      this.getDefaultEvents();
    }
  }

  getDefaultEvents() {
    const today = new Date();
    this.events = [
      { id: Date.now() + 1, title: 'Project Kickoff', date: new Date(today.getFullYear(), today.getMonth(), 10) },
      { id: Date.now() + 2, title: 'Client Review', date: new Date(today.getFullYear(), today.getMonth(), 15) },
      { id: Date.now() + 3, title: 'Team Outing', date: new Date(today.getFullYear(), today.getMonth(), 22) }
    ];
    this.saveEventsToStorage();
  }

  saveEventsToStorage() {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);

    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    this.daysInMonth = [];

    // Fill previous month days (represented as empty or with dates)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i);
      this.daysInMonth.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: date,
        events: []
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const dayEvents = this.getEventsForDate(date);
      this.daysInMonth.push({
        day: i,
        isCurrentMonth: true,
        date: date,
        events: dayEvents,
        isToday: this.isToday(date),
        hasEvents: dayEvents.length > 0
      });
    }

    // Fill next month days to complete the 6x7 grid
    const remainingCells = 42 - this.daysInMonth.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.daysInMonth.push({
        day: i,
        isCurrentMonth: false,
        date: date,
        events: []
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  getEventsForDate(date: Date): any[] {
    return this.events.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
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

  selectDate(dayInfo: any) {
    this.selectedDate = dayInfo.date;
    this.eventTitle = '';
    this.showEventModal = true;
  }

  openQuickAdd() {
    this.selectedDate = new Date();
    this.showEventModal = true;
  }

  saveEvent() {
    if (!this.eventTitle.trim()) return;

    if (this.selectedDate) {
      const newEvent = {
        id: Date.now(),
        title: this.eventTitle.trim(),
        date: new Date(this.selectedDate)
      };

      this.events.push(newEvent);
      this.events.sort((a, b) => a.date.getTime() - b.date.getTime());

      this.saveEventsToStorage();
      this.generateCalendar();
      this.closeEventModal();
    }
  }

  closeEventModal() {
    this.showEventModal = false;
    this.eventTitle = '';
  }

  deleteEvent(eventId: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.events = this.events.filter(e => e.id !== eventId);
    this.saveEventsToStorage();
    this.generateCalendar();
  }

  openEventDetails(event: any, eventObj: MouseEvent) {
    eventObj.stopPropagation();
    this.selectedEventForDetails = event;
    this.showEventDetailsModal = true;
  }

  closeEventDetailsModal() {
    this.showEventDetailsModal = false;
    this.selectedEventForDetails = null;
  }

  deleteEventFromDetails() {
    if (this.selectedEventForDetails) {
      this.deleteEvent(this.selectedEventForDetails.id);
      this.closeEventDetailsModal();
    }
  }

  getMonthName(): string {
    return this.months[this.currentMonth];
  }
}