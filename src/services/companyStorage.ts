import { Company, NotificationItem } from '../types';
import { INITIAL_COMPANIES, INITIAL_NOTIFICATIONS } from './mockData';

const STORAGE_KEYS = {
  COMPANIES: 'churnguard_companies_v1',
  ACTIVE_COMPANY_ID: 'churnguard_active_company_id_v1',
  NOTIFICATIONS: 'churnguard_notifications_v1',
};

export function getStoredCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (!raw) {
      saveCompanies(INITIAL_COMPANIES);
      return INITIAL_COMPANIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMPANIES;
  } catch (err) {
    console.error('Failed to load companies from localStorage', err);
    return INITIAL_COMPANIES;
  }
}

export function saveCompanies(companies: Company[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  } catch (err) {
    console.error('Failed to save companies to localStorage', err);
  }
}

export function getActiveCompanyId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    if (id) return id;
    return INITIAL_COMPANIES[0].id;
  } catch {
    return INITIAL_COMPANIES[0].id;
  }
}

export function saveActiveCompanyId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, id);
  } catch (err) {
    console.error('Failed to set active company id', err);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

export function resetAllToDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  } catch (err) {
    console.error('Failed to reset storage', err);
  }
}
