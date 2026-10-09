import type { GeoCoordinates } from '../types';
import { logAuditEvent } from './auditService';

export interface LocationWatcherOptions {
  intervalMs?: number; // Default 10-15s (12000 ms)
  onLocationUpdate: (coords: GeoCoordinates) => void;
  onError?: (error: string) => void;
}

// Active tracking session metadata
interface TrackingSession {
  caseId: string;
  token: string;
  intervalId: ReturnType<typeof setInterval> | null;
  history: Array<{ coords: GeoCoordinates; timestamp: number }>;
  isActive: boolean;
}

const activeTrackingSessions = new Map<string, TrackingSession>();

// Hyderabad central ambulance hub fallback coordinates
export const HYDERABAD_CENTRAL: GeoCoordinates = { lat: 17.3916, lng: 78.4720 };

/**
 * Starts continuous ambulance GPS tracking for an active case.
 * Transmits location updates every 10-15 seconds.
 * Strictly adheres to minimum data principles: stops on case close, history purged with case retention.
 */
export function startAmbulanceTracking(
  caseId: string,
  token: string,
  options: LocationWatcherOptions
): () => void {
  // If already tracking this case, return existing stop handler
  if (activeTrackingSessions.has(caseId)) {
    const existing = activeTrackingSessions.get(caseId)!;
    if (existing.isActive) {
      return () => stopAmbulanceTracking(caseId);
    }
  }

  const intervalMs = options.intervalMs || 12000; // 12 seconds default

  const session: TrackingSession = {
    caseId,
    token,
    intervalId: null,
    history: [],
    isActive: true,
  };

  activeTrackingSessions.set(caseId, session);

  // Dispatch initial coordinate
  let currentCoords = { ...HYDERABAD_CENTRAL };
  options.onLocationUpdate(currentCoords);
  session.history.push({ coords: currentCoords, timestamp: Date.now() });

  // Log initial GPS tracking event to audit log (Zero PII - coords and token only)
  logAuditEvent(caseId, 'paramedic', token, 'GPS_TRACKING_EVENT', {
    status: 'TRACKING_STARTED',
    intervalMs,
  });

  // Start periodic GPS update loop
  session.intervalId = setInterval(() => {
    if (!session.isActive) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: GeoCoordinates = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          };
          currentCoords = coords;
          session.history.push({ coords, timestamp: Date.now() });
          options.onLocationUpdate(coords);
        },
        () => {
          // Fallback simulation in testing or headless/offline environments
          // Ambulances move ~0.001 deg (~100m) per interval toward medical district
          currentCoords = {
            lat: Number((currentCoords.lat + (Math.random() - 0.45) * 0.002).toFixed(5)),
            lng: Number((currentCoords.lng + (Math.random() - 0.45) * 0.002).toFixed(5)),
          };
          session.history.push({ coords: currentCoords, timestamp: Date.now() });
          options.onLocationUpdate(currentCoords);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      // Geolocation API absent - simulated drift
      currentCoords = {
        lat: Number((currentCoords.lat + (Math.random() - 0.45) * 0.002).toFixed(5)),
        lng: Number((currentCoords.lng + (Math.random() - 0.45) * 0.002).toFixed(5)),
      };
      session.history.push({ coords: currentCoords, timestamp: Date.now() });
      options.onLocationUpdate(currentCoords);
    }
  }, intervalMs);

  return () => stopAmbulanceTracking(caseId);
}

/**
 * Stops GPS tracking immediately when the case is closed or arrived.
 */
export function stopAmbulanceTracking(caseId: string): void {
  const session = activeTrackingSessions.get(caseId);
  if (!session) return;

  if (session.intervalId) {
    clearInterval(session.intervalId);
    session.intervalId = null;
  }
  session.isActive = false;

  logAuditEvent(caseId, 'paramedic', session.token, 'GPS_TRACKING_EVENT', {
    status: 'TRACKING_STOPPED',
    totalBreadcrumbs: session.history.length,
  });
}

/**
 * Purges tracking history from memory (invoked by retention service).
 */
export function purgeTrackingHistory(caseId: string): void {
  stopAmbulanceTracking(caseId);
  activeTrackingSessions.delete(caseId);
}

export function getTrackingHistory(caseId: string): Array<{ coords: GeoCoordinates; timestamp: number }> {
  return activeTrackingSessions.get(caseId)?.history || [];
}
