import { BookingState } from '../types/booking.types';

export const STORAGE_KEY = "instantcal-booking";
 
export const STEPS = ["Service", "Staff", "Date & Time"];

export function getStepFromURL(): number {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  const s = parseInt(params.get("step") ?? "1", 10);
  return s >= 1 && s <= 3 ? s : 1;
}
 
export function getBookingFromStorage(): BookingState {
  if (typeof window === "undefined") return { serviceId: null, staffId: null, dateTime: null };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { serviceId: null, staffId: null, dateTime: null };
}
 
export function saveBookingToStorage(booking: BookingState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
  } catch {}
}
 
export function setStepInURL(step: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(step));
  window.history.pushState({}, "", url.toString());
}