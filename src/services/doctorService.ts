import { mockDoctors } from '../data/mockDoctors';
import type { Doctor } from '../types';
import type { IDoctorService } from '../types/services';

class DoctorService implements IDoctorService {
  async getDoctors(query?: string, specialty?: string): Promise<Doctor[]> {
    let filtered = [...mockDoctors];

    if (specialty && specialty !== 'All Specialties') {
      filtered = filtered.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase());
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  async getSpecialties(): Promise<string[]> {
    const set = new Set(mockDoctors.map((d) => d.specialty));
    return ['All Specialties', ...Array.from(set)];
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    return mockDoctors.find((d) => d.id === id) || null;
  }
}

export const doctorService = new DoctorService();
