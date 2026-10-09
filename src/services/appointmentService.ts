import type { Appointment } from '../types';
import type { IAppointmentService } from '../types/services';

const STORAGE_KEY = 'medilink_demo_appointments';

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Rao',
    doctorSpecialty: 'General Physician & Internal Medicine',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    patientName: 'Priya Sharma',
    patientPhone: '+91 98765 43210',
    patientEmail: 'priya.sharma@example.com',
    date: '2026-10-12',
    time: '10:30 AM',
    mode: 'in-person',
    status: 'scheduled',
    notes: 'Routine health checkup and blood pressure review',
    createdAt: new Date().toISOString(),
    isDemo: true
  },
  {
    id: 'apt-102',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh V. Verma',
    doctorSpecialty: 'Cardiologist',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    patientName: 'Priya Sharma',
    patientPhone: '+91 98765 43210',
    patientEmail: 'priya.sharma@example.com',
    date: '2026-10-15',
    time: '02:15 PM',
    mode: 'online',
    status: 'scheduled',
    notes: 'Follow up on lipid panel and ECG report review',
    createdAt: new Date().toISOString(),
    isDemo: true
  }
];

class AppointmentService implements IAppointmentService {
  private load(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  }

  private save(data: Appointment[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.load();
  }

  async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'isDemo'>
  ): Promise<Appointment> {
    const list = this.load();
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    const updated = [newApt, ...list];
    this.save(updated);
    return newApt;
  }

  async cancelAppointment(id: string): Promise<boolean> {
    const list = this.load();
    const updated = list.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a));
    this.save(updated);
    return true;
  }
}

export const appointmentService = new AppointmentService();
