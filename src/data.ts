/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisitorAppointment, ServicePublish, ServiceBooking, Gate, GateRecord, SystemConfig, ServiceTimeSlot, SlotStatus } from './types';

// Anchor date: 2026-06-05
const TODAY = '2026-06-05';

export const INITIAL_GATES: Gate[] = [
  { id: 'gate-1', name: '学校正门', openTime: '07:30', closeTime: '18:00', status: 'ACTIVE' },
  { id: 'gate-2', name: '西北偏门', openTime: '07:30', closeTime: '18:00', status: 'ACTIVE' },
  { id: 'gate-3', name: '北侧后门', openTime: '08:00', closeTime: '17:30', status: 'ACTIVE' },
];

export const INITIAL_SERVICES: ServicePublish[] = [
  {
    id: 'srv-1',
    name: '毕业档案盖章及提取办理',
    category: '教务处',
    location: '主楼一楼102办公室',
    staff: '张德培 老师',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    dailyStartTime: '09:00',
    dailyEndTime: '11:00',
    slotDurationMinutes: 10,
    maxCapacityPerSlot: 1,
    requireAudit: true,
    requireGateVerify: true,
    enableCheckIn: true,
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'srv-2',
    name: '在学证明及成绩单材料领取',
    category: '行政处',
    location: '行政楼二楼115教导窗',
    staff: '李丽华 老师',
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    dailyStartTime: '14:00',
    dailyEndTime: '16:00',
    slotDurationMinutes: 15,
    maxCapacityPerSlot: 4,
    requireAudit: false,
    requireGateVerify: true,
    enableCheckIn: true,
    createdAt: '2026-06-01T08:15:00Z',
  },
  {
    id: 'srv-3',
    name: '校园卡损坏补办及挂失登记',
    category: '网络与信息中心',
    location: '图书信息大楼B1信息化窗口',
    staff: '王博能 老师',
    startDate: '2026-06-02',
    endDate: '2026-06-30',
    dailyStartTime: '13:00',
    dailyEndTime: '15:00',
    slotDurationMinutes: 30,
    maxCapacityPerSlot: 10,
    requireAudit: false,
    requireGateVerify: false,
    enableCheckIn: true,
    createdAt: '2026-06-02T09:00:00Z',
  }
];

export const INITIAL_APPOINTMENTS: VisitorAppointment[] = [
  {
    id: 'apt-1',
    name: '林建国',
    phone: '13812345678',
    idCard: '310101198205051234',
    company: '上海浦东科技发展公司',
    hostName: '陈志远',
    hostDept: '教研室',
    reason: '教学科研共建研讨会与教材核对',
    visitDate: TODAY,
    companionsCount: 1,
    companions: [{ name: '周志成', phone: '13917654321', idCard: '310104198305011111' }],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    status: 'SIGNED_IN',
    createdAt: '2026-06-04T10:15:00Z',
    auditedBy: '张审核员',
    auditedTime: '2026-06-04T14:20:00Z',
    checkedInTime: '2026-06-05T08:12:35Z'
  },
  {
    id: 'apt-2',
    name: '刘晓琴',
    phone: '13567890123',
    idCard: '440101198510205678',
    company: '家属家长',
    hostName: '张惠珍',
    hostDept: '高一三班班主任',
    reason: '学生日常在校表现及选科交流',
    visitDate: TODAY,
    companionsCount: 0,
    companions: [],
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    status: 'APPROVED',
    createdAt: '2026-06-04T14:30:00Z',
    auditedBy: '张审核员',
    auditedTime: '2026-06-04T16:00:00Z'
  },
  {
    id: 'apt-3',
    name: '赵一凡',
    phone: '18621113333',
    idCard: '320101199002014444',
    company: '文轩教辅设备商',
    hostName: '沈校长',
    hostDept: '校长办公室',
    reason: '多媒体教室设备维护终审汇报',
    visitDate: TODAY,
    companionsCount: 2,
    companions: [
      { name: '王一鸣', phone: '18621114444' },
      { name: '钱亮亮', phone: '18621115555' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    status: 'PENDING',
    createdAt: '2026-06-05T07:22:15Z'
  },
  {
    id: 'apt-4',
    name: '张雅丽',
    phone: '17721021234',
    idCard: '330101200004052222',
    company: '个人访客',
    hostName: '校招组主任',
    hostDept: '人事科',
    reason: '应聘教师编制资格原件复审',
    visitDate: TODAY,
    companionsCount: 0,
    companions: [],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    status: 'PENDING',
    createdAt: '2026-06-05T07:44:48Z'
  },
  {
    id: 'apt-5',
    name: '薛卫国',
    phone: '13611119999',
    idCard: '110101197011112222',
    company: '恒盛食堂食材供应链',
    hostName: '高主任',
    hostDept: '总务处',
    reason: '校区后勤食堂季度抽样检测',
    visitDate: TODAY,
    companionsCount: 0,
    companions: [],
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    status: 'SIGNED_OUT',
    createdAt: '2026-06-04T09:00:00Z',
    auditedBy: '张审核员',
    auditedTime: '2026-06-04T10:10:00Z',
    checkedInTime: '2026-06-05T07:45:00Z',
    checkedOutTime: '2026-06-05T08:50:30Z'
  },
  {
    id: 'apt-6',
    name: '王小伟',
    phone: '13344445555',
    idCard: '510101199908081234',
    company: '飞碟快递',
    hostName: '收发室',
    hostDept: '后勤部',
    reason: '大宗退役图书文件包裹取件',
    visitDate: TODAY,
    companionsCount: 0,
    companions: [],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80',
    status: 'REJECTED',
    refusalReason: '来访时间属于课间操集会阶段不便通行，请预约在10点后。',
    createdAt: '2026-06-04T15:20:00Z',
    auditedBy: '李副主任',
    auditedTime: '2026-06-04T16:25:00Z'
  }
];

export const INITIAL_SERVICE_BOOKINGS: ServiceBooking[] = [
  {
    id: 'sbk-1',
    serviceId: 'srv-1',
    serviceName: '毕业档案盖章及提取办理',
    slotTime: '09:00',
    bookingDate: TODAY,
    userName: '刘佳琪',
    userPhone: '15921834241',
    status: 'SIGNED_IN',
    createdAt: '2026-06-04T08:00:00Z',
    signedInTime: '2026-06-05T08:55:12Z'
  },
  {
    id: 'sbk-2',
    serviceId: 'srv-1',
    serviceName: '毕业档案盖章及提取办理',
    slotTime: '09:10',
    bookingDate: TODAY,
    userName: '周立新',
    userPhone: '15822184451',
    status: 'APPROVED',
    createdAt: '2026-06-04T08:05:00Z'
  },
  {
    id: 'sbk-3',
    serviceId: 'srv-2',
    serviceName: '在学证明及成绩单材料领取',
    slotTime: '14:00',
    bookingDate: TODAY,
    userName: '张博雅',
    userPhone: '18911223344',
    status: 'PENDING',
    createdAt: '2026-06-05T07:10:00Z'
  }
];

export const INITIAL_GATE_RECORDS: GateRecord[] = [
  {
    id: 'rec-1',
    gateId: 'gate-1',
    gateName: '学校正门',
    visitorName: '薛卫国',
    visitorPhone: '13611119999',
    type: 'GATE_IN',
    actionTime: '2026-06-05T07:45:00Z',
    handlerName: '老李(正门岗)',
    status: 'APPROVED',
    hostName: '高主任',
    reason: '校区后勤食堂季度抽样检测'
  },
  {
    id: 'rec-2',
    gateId: 'gate-1',
    gateName: '学校正门',
    visitorName: '薛卫国',
    visitorPhone: '13611119999',
    type: 'GATE_OUT',
    actionTime: '2026-06-05T08:50:30Z',
    handlerName: '老李(正门岗)',
    status: 'APPROVED',
    hostName: '高主任',
    reason: '校区后勤食堂季度抽样检测'
  },
  {
    id: 'rec-3',
    gateId: 'gate-1',
    gateName: '学校正门',
    visitorName: '林建国',
    visitorPhone: '13812345678',
    type: 'GATE_IN',
    actionTime: '2026-06-05T08:12:35Z',
    handlerName: '老李(正门岗)',
    status: 'APPROVED',
    hostName: '陈志远',
    reason: '教学科研共建研讨会与教材核对'
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  schoolName: '启明星高级中学',
  enableSmsSandbox: true,
  enableWechatSandbox: true,
  autoApproveVisitor: false,
};

// Local storage management helpers
const KEYS = {
  GATES: 'campus_visitor_gates',
  SERVICES: 'campus_visitor_services',
  APPOINTMENTS: 'campus_visitor_appointments',
  BOOKINGS: 'campus_visitor_bookings',
  GATE_RECORDS: 'campus_visitor_gate_records',
  CONFIG: 'campus_visitor_config',
};

export const loadData = () => {
  const gates = localStorage.getItem(KEYS.GATES) ? JSON.parse(localStorage.getItem(KEYS.GATES)!) as Gate[] : INITIAL_GATES;
  const services = localStorage.getItem(KEYS.SERVICES) ? JSON.parse(localStorage.getItem(KEYS.SERVICES)!) as ServicePublish[] : INITIAL_SERVICES;
  const appointments = localStorage.getItem(KEYS.APPOINTMENTS) ? JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS)!) as VisitorAppointment[] : INITIAL_APPOINTMENTS;
  const bookings = localStorage.getItem(KEYS.BOOKINGS) ? JSON.parse(localStorage.getItem(KEYS.BOOKINGS)!) as ServiceBooking[] : INITIAL_SERVICE_BOOKINGS;
  const records = localStorage.getItem(KEYS.GATE_RECORDS) ? JSON.parse(localStorage.getItem(KEYS.GATE_RECORDS)!) as GateRecord[] : INITIAL_GATE_RECORDS;
  const config = localStorage.getItem(KEYS.CONFIG) ? JSON.parse(localStorage.getItem(KEYS.CONFIG)!) as SystemConfig : INITIAL_CONFIG;

  return { gates, services, appointments, bookings, records, config };
};

export const saveData = (data: {
  gates?: Gate[];
  services?: ServicePublish[];
  appointments?: VisitorAppointment[];
  bookings?: ServiceBooking[];
  records?: GateRecord[];
  config?: SystemConfig;
}) => {
  if (data.gates) localStorage.setItem(KEYS.GATES, JSON.stringify(data.gates));
  if (data.services) localStorage.setItem(KEYS.SERVICES, JSON.stringify(data.services));
  if (data.appointments) localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
  if (data.bookings) localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(data.bookings));
  if (data.records) localStorage.setItem(KEYS.GATE_RECORDS, JSON.stringify(data.records));
  if (data.config) localStorage.setItem(KEYS.CONFIG, JSON.stringify(data.config));
};

export const generateTimeSlots = (service: ServicePublish, bookings: ServiceBooking[], selectedDate: string): ServiceTimeSlot[] => {
  const result: ServiceTimeSlot[] = [];
  const startMins = convertToMinutes(service.dailyStartTime);
  const endMins = convertToMinutes(service.dailyEndTime);
  const step = service.slotDurationMinutes;

  for (let current = startMins; current + step <= endMins; current += step) {
    const timeLabel = convertToTimeString(current);
    const id = `${service.id}-${timeLabel}`;
    
    // Count existing bookings for this service on this date and time
    const bookedCount = bookings.filter(
      b => b.serviceId === service.id && b.bookingDate === selectedDate && b.slotTime === timeLabel && b.status !== 'REJECTED'
    ).length;

    let status: SlotStatus = 'AVAILABLE';
    if (bookedCount >= service.maxCapacityPerSlot) {
      status = 'FULL';
    }

    // Example closure/past checks (Mock rule: if time before 09:30 on selected TODAY, mark as expired/closed for demo)
    if (selectedDate === TODAY && current < convertToMinutes('09:20')) {
      status = 'EXPIRED';
    }

    result.push({
      id,
      serviceId: service.id,
      timeLabel,
      bookedCount,
      maxCapacity: service.maxCapacityPerSlot,
      status,
    });
  }

  return result;
};

function convertToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function convertToTimeString(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
