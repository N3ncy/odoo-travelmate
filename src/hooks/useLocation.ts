import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocationStore } from '@/store';
import { locationService } from '@/services/api';
import toast from 'react-hot-toast';

interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export function useLocation() {
  const {
    currentLocation,
    groupLocations,
    isSharing,
    alerts,
    setCurrentLocation,
    setGroupLocations,
    setIsSharing,
    addAlert,
  } = useLocationStore();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchId = useRef<number | null>(null);
  const shareInterval = useRef<NodeJS.Timeout | null>(null);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  const startTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported in this browser');
      }

      // Get initial position
      const pos = await getCurrentPosition();
      setCurrentLocation(pos);

      // Watch position changes
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCurrentLocation(newPos);
        },
        (error) => {
          setError(error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error('Unable to get location: ' + err.message);
    }
  }, [getCurrentPosition, setCurrentLocation]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const startSharing = useCallback(async (tripId: string, userId: string) => {
    try {
      setIsSharing(true);
      await startTracking();

      // Share location every 30 seconds
      shareInterval.current = setInterval(async () => {
        const pos = await getCurrentPosition();
        await locationService.updateLocation(tripId, userId, pos.lat, pos.lng);
      }, 30000);

      // Initial share
      const pos = await getCurrentPosition();
      await locationService.updateLocation(tripId, userId, pos.lat, pos.lng);

      toast.success('Location sharing started');
    } catch (err: any) {
      setIsSharing(false);
      toast.error('Failed to start location sharing');
    }
  }, [setIsSharing, startTracking, getCurrentPosition]);

  const stopSharing = useCallback(() => {
    setIsSharing(false);
    stopTracking();

    if (shareInterval.current) {
      clearInterval(shareInterval.current);
      shareInterval.current = null;
    }

    toast.success('Location sharing stopped');
  }, [setIsSharing, stopTracking]);

  const fetchGroupLocations = useCallback(async (tripId: string) => {
    try {
      const locations = await locationService.getGroupLocations(tripId);
      setGroupLocations(locations);
    } catch (err: any) {
      console.error('Failed to fetch group locations:', err);
    }
  }, [setGroupLocations]);

  const checkGeofence = useCallback(async (
    tripId: string,
    targetLat: number,
    targetLng: number,
    radiusMeters: number = 100
  ): Promise<boolean> => {
    if (!currentLocation) return false;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      targetLat,
      targetLng
    );

    return distance <= radiusMeters;
  }, [currentLocation]);

  const triggerPanic = useCallback(async (tripId: string, userId: string) => {
    try {
      const pos = await getCurrentPosition();
      const alert = await locationService.triggerPanicAlert(tripId, userId, pos.lat, pos.lng);
      addAlert(alert);
      toast.success('Emergency alert sent to your contacts!', { icon: '🚨' });
      return alert;
    } catch (err: any) {
      toast.error('Failed to send alert');
      throw err;
    }
  }, [getCurrentPosition, addAlert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (shareInterval.current) {
        clearInterval(shareInterval.current);
      }
    };
  }, [stopTracking]);

  return {
    currentLocation,
    groupLocations,
    isSharing,
    alerts,
    error,
    loading,
    getCurrentPosition,
    startTracking,
    stopTracking,
    startSharing,
    stopSharing,
    fetchGroupLocations,
    checkGeofence,
    triggerPanic,
  };
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export { calculateDistance };
