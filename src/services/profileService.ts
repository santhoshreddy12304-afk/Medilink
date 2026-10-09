import type { UserProfile } from '../types';
import type { IProfileService } from '../types/services';

const STORAGE_KEY = 'medilink_demo_user_profile';

const INITIAL_PROFILE: UserProfile = {
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  ageRange: '28-35',
  gender: 'Female',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Dust Mites',
  chronicConditions: 'Mild Asthma (Intermittent)',
  emergencyContactName: 'Rohan Sharma',
  emergencyContactPhone: '+91 98765 00000',
  emergencyContactRelation: 'Spouse',
  isDemo: true
};

class ProfileService implements IProfileService {
  async getProfile(): Promise<UserProfile> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PROFILE;
    }
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
}

export const profileService = new ProfileService();
