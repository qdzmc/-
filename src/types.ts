/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'visitor' | 'guard' | 'auditor' | 'admin';

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED_IN' | 'SIGNED_OUT';

export interface CompanionInfo {
  name: string;
  phone: string;
  idCard?: string;
}

export interface VisitorAppointment {
  id: string;
  name: string;
  phone: string;
  idCard?: string;
  company?: string;
  hostName: string;
  hostDept: string;
  reason: string;
  visitDate: string; // YYYY-MM-DD
  companionsCount: number;
  companions: CompanionInfo[];
  photoUrl: string;
  status: AppointmentStatus;
  refusalReason?: string;
  createdAt: string;
  checkedInTime?: string;
  checkedOutTime?: string;
  auditedBy?: string;
  auditedTime?: string;
  gateActionBy?: string;
  gateActionTime?: string;
}

export type SlotStatus = 'AVAILABLE' | 'FULL' | 'CLOSED' | 'EXPIRED';

export interface ServicePublish {
  id: string;
  name: string;
  category: string;
  location: string;
  staff: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dailyStartTime: string; // HH:MM
  dailyEndTime: string; // HH:MM
  slotDurationMinutes: number;
  maxCapacityPerSlot: number;
  requireAudit: boolean;
  requireGateVerify: boolean;
  enableCheckIn: boolean;
  createdAt: string;
}

export interface ServiceTimeSlot {
  id: string; // serviceId-timeStr
  serviceId: string;
  timeLabel: string; // "09:00"
  bookedCount: number;
  maxCapacity: number;
  status: SlotStatus;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  slotTime: string; // "09:00"
  bookingDate: string; // YYYY-MM-DD
  userName: string;
  userPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED_IN' | 'FINISHED';
  refusalReason?: string;
  createdAt: string;
  signedInTime?: string;
  finishedTime?: string;
}

export interface Gate {
  id: string;
  name: string; // "正门" | "北门" | "西门"
  openTime: string; // "07:30"
  closeTime: string; // "18:00"
  status: 'ACTIVE' | 'CLOSED';
}

export interface GateRecord {
  id: string;
  gateId: string;
  gateName: string;
  visitorName: string;
  visitorPhone: string;
  type: 'GATE_IN' | 'GATE_OUT';
  actionTime: string;
  handlerName: string; // 门卫
  status: 'APPROVED' | 'DENIED';
  hostName: string;
  reason: string;
}

export interface SystemConfig {
  schoolName: string;
  enableSmsSandbox: boolean;
  enableWechatSandbox: boolean;
  autoApproveVisitor: boolean;
}
