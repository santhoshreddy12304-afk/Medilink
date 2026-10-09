import type { ActivityItem, HealthMetric } from '../types';

export const mockHealthMetrics: HealthMetric[] = [
  {
    id: 'metric-1',
    name: 'Blood Pressure',
    value: '118/76',
    unit: 'mmHg',
    status: 'optimal',
    change: 'Normal range',
    lastUpdated: 'Today, 8:30 AM'
  },
  {
    id: 'metric-2',
    name: 'Fasting Blood Sugar',
    value: '94',
    unit: 'mg/dL',
    status: 'optimal',
    change: '-3 mg/dL vs last test',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'metric-3',
    name: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    status: 'normal',
    change: 'Resting average',
    lastUpdated: 'Today, 9:15 AM'
  },
  {
    id: 'metric-4',
    name: 'SpO2 Oxygen Level',
    value: '99',
    unit: '%',
    status: 'optimal',
    change: 'Optimal',
    lastUpdated: 'Today, 9:15 AM'
  }
];

export const mockRecentActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'chat',
    title: 'Consulted AI Assistant',
    subtitle: 'Fasting sugar test preparation query',
    timestamp: '2 hours ago',
    badgeText: 'AI Chat'
  },
  {
    id: 'act-2',
    type: 'appointment',
    title: 'Appointment Booked',
    subtitle: 'Dr. Ananya Rao • Internal Medicine',
    timestamp: 'Yesterday',
    badgeText: 'Confirmed'
  },
  {
    id: 'act-3',
    type: 'profile_update',
    title: 'Health Profile Updated',
    subtitle: 'Allergies & emergency contact details reviewed',
    timestamp: '3 days ago'
  }
];
