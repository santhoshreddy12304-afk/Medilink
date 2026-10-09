import type { Appointment, ChatMessage, Doctor, UserProfile } from './index';

export interface IAssistantService {
  sendMessage(prompt: string, history: ChatMessage[]): Promise<ChatMessage>;
  getInitialState(): ChatMessage[];
}

export interface IDoctorService {
  getDoctors(query?: string, specialty?: string): Promise<Doctor[]>;
  getSpecialties(): Promise<string[]>;
  getDoctorById(id: string): Promise<Doctor | null>;
}

export interface IAppointmentService {
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'isDemo'>): Promise<Appointment>;
  cancelAppointment(id: string): Promise<boolean>;
}

export interface IProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}
