/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VisitorAppointment, ServicePublish, ServiceBooking, ServiceTimeSlot, CompanionInfo, Gate } from '../types';
import { generateTimeSlots } from '../data';
import { 
  Calendar, 
  User, 
  Briefcase, 
  FileText, 
  MapPin, 
  Users, 
  QrCode, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  UserCheck,
  Send,
  Phone,
  Video
} from 'lucide-react';

interface VisitorViewProps {
  appointments: VisitorAppointment[];
  services: ServicePublish[];
  bookings: ServiceBooking[];
  gates: Gate[];
  onSubmitAppointment: (apt: Omit<VisitorAppointment, 'id' | 'status' | 'createdAt'>) => void;
  onSubmitBooking: (booking: Omit<ServiceBooking, 'id' | 'status' | 'createdAt'>) => void;
  onScanAction: (type: 'GATE_IN' | 'GATE_OUT' | 'SERVICE_CHECKIN', targetId: string, aptOrBookingId: string) => { success: boolean; message: string };
}

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
];

export default function VisitorView({
  appointments,
  services,
  bookings,
  gates,
  onSubmitAppointment,
  onSubmitBooking,
  onScanAction
}: VisitorViewProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'appointment' | 'center' | 'passes' | 'scanner'>('appointment');

  // Visitor Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [company, setCompany] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostDept, setHostDept] = useState('教研室');
  const [reason, setReason] = useState('');
  const [visitDate, setVisitDate] = useState('2026-06-05');
  const [photoUrl, setPhotoUrl] = useState(DEMO_PHOTOS[0]);
  
  // Companions count & list
  const [companionName, setCompanionName] = useState('');
  const [companionPhone, setCompanionPhone] = useState('');
  const [companionId, setCompanionId] = useState('');
  const [companions, setCompanions] = useState<CompanionInfo[]>([]);

  // Service Booking State
  const [selectedService, setSelectedService] = useState<ServicePublish | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-06-05');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Scanner Simulator State
  const [scannedResult, setScannedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scannerType, setScannerType] = useState<'GATE_IN' | 'GATE_OUT' | 'SERVICE_CHECKIN'>('GATE_IN');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedAptId, setSelectedAptId] = useState('');

  const handleAddCompanion = () => {
    if (!companionName || !companionPhone) return;
    setCompanions([...companions, { name: companionName, phone: companionPhone, idCard: companionId }]);
    setCompanionName('');
    setCompanionPhone('');
    setCompanionId('');
  };

  const handleRemoveCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !hostName || !reason) {
      alert('请将必填信息填写完整！');
      return;
    }
    onSubmitAppointment({
      name,
      phone,
      idCard,
      company,
      hostName,
      hostDept,
      reason,
      visitDate,
      companionsCount: companions.length,
      companions,
      photoUrl,
    });
    // Reset Form
    setName('');
    setPhone('');
    setIdCard('');
    setCompany('');
    setHostName('');
    setReason('');
    setCompanions([]);
    alert('访客通行申请提交成功！请在 “我的通行证/预约” 中查看审核状态。');
    setActiveTab('passes');
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !bookingName || !bookingPhone) {
      alert('请填写预约人姓名、电话并选择空闲时间段！');
      return;
    }
    onSubmitBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      slotTime: selectedSlot,
      bookingDate,
      userName: bookingName,
      userPhone: bookingPhone,
    });
    // Reset
    setBookingName('');
    setBookingPhone('');
    setSelectedSlot(null);
    setSelectedService(null);
    alert('校务业务办理预约成功！');
    setActiveTab('passes');
  };

  const executeSimulatedScan = () => {
    if (!selectedTargetId || !selectedAptId) {
      alert('请完成扫描目标和对应核验预约码的选择！');
      return;
    }
    const result = onScanAction(scannerType, selectedTargetId, selectedAptId);
    setScannedResult(result);
  };

  // Generated slots for booking panel
  const availableSlots: ServiceTimeSlot[] = selectedService 
    ? generateTimeSlots(selectedService, bookings, bookingDate)
    : [];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-hidden max-w-4xl mx-auto">
      {/* Navigation Sub-header */}
      <div className="bg-slate-50 border-b border-slate-250/20 flex overflow-x-auto">
        <button
          onClick={() => { setActiveTab('appointment'); setScannedResult(null); }}
          className={`flex-1 py-4 px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-all shrink-0 flex items-center justify-center gap-2 ${
            activeTab === 'appointment' ? 'border-[#1677ff] text-[#1677ff] bg-white font-semibold' : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <User className="w-4 h-4 text-slate-400" /> 访客通行登记
        </button>
        <button
          onClick={() => { setActiveTab('center'); setScannedResult(null); }}
          className={`flex-1 py-4 px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-all shrink-0 flex items-center justify-center gap-2 ${
            activeTab === 'center' ? 'border-[#1677ff] text-[#1677ff] bg-white font-semibold' : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Calendar className="w-4 h-4 text-slate-400" /> 业务预约中心
        </button>
        <button
          onClick={() => { setActiveTab('passes'); setScannedResult(null); }}
          className={`flex-1 py-4 px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-all shrink-0 flex items-center justify-center gap-2 ${
            activeTab === 'passes' ? 'border-[#1677ff] text-[#1677ff] bg-white font-semibold' : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <QrCode className="w-4 h-4 text-slate-400" /> 我的通行证/预约
        </button>
        <button
          onClick={() => { setActiveTab('scanner'); setScannedResult(null); }}
          className={`flex-1 py-4 px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-all shrink-0 flex items-center justify-center gap-2 ${
            activeTab === 'scanner' ? 'border-[#1677ff] text-[#1677ff] bg-white font-semibold' : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Camera className="w-4 h-4 text-slate-400" /> 模拟扫码端
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6 md:p-8">
        {/* Module 1: Submit Visitor Appointment */}
        {activeTab === 'appointment' && (
          <form onSubmit={handleAppointmentSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">自助提交访客进校预约</h3>
              <p className="text-sm text-slate-500 mt-1">请真实完整填写您的进校申请信息，以便校方管理员及门卫核算通行。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Mock */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <img 
                  src={photoUrl} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                />
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-sm text-slate-800">上传访客现场白底免冠照片 (必填)</p>
                  <p className="text-xs text-slate-500 mt-1">系统将自动识别人脸，供各门卫核实您的真实身份。</p>
                  <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                    {DEMO_PHOTOS.map((pic, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(pic)}
                        className={`w-8 h-8 rounded-full overflow-hidden border ${photoUrl === pic ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-300'}`}
                      >
                        <img src={pic} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  访客姓名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入真实姓名"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  手机号码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入11位手机号码"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">身份证号码 (选填)</label>
                <input
                  type="text"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  placeholder="请输入18位二代身份证"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">来访单位 (选填)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="如：个人、XX公司、学生家长"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  被访教职工姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="请输入校内对接教职工姓名"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">接待部门</label>
                <select
                  value={hostDept}
                  onChange={(e) => setHostDept(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                >
                  <option value="教研室">教研室</option>
                  <option value="德育处">德育处</option>
                  <option value="教务处">教务处</option>
                  <option value="总务后勤处">总务后勤处</option>
                  <option value="校长办公室">校长办公室</option>
                  <option value="人事科">人事科</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">预约访问日期</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  进校事由简述 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="请输入本次进校办事的具体事由..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm h-24"
                  />
                </div>
              </div>
            </div>

            {/* Companions lists Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#1677ff]" /> 同行人员 ({companions.length}人)
                </h4>
                <span className="text-xs text-slate-500">如携带有家属或随同人员，请在此录入</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="同行人姓名"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1677ff]"
                />
                <input
                  type="tel"
                  placeholder="同行人手机号"
                  value={companionPhone}
                  onChange={(e) => setCompanionPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1677ff]"
                />
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="身份证号(选填)"
                    value={companionId}
                    onChange={(e) => setCompanionId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1677ff]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompanion}
                    className="bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs px-3 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer"
                  >
                    添加
                  </button>
                </div>
              </div>

              {companions.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {companions.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 mr-2">{comp.name}</span>
                        <span className="text-slate-500 mr-2">{comp.phone}</span>
                        {comp.idCard && <span className="text-slate-400 font-mono">({comp.idCard})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1677ff] hover:bg-[#0958d9] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_2px_8px_rgba(22,127,255,0.2)] hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-5 h-5" /> 提交通行预约审查申请
            </button>
          </form>
        )}

        {/* Module 2: School Service Booking */}
        {activeTab === 'center' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">教务政务预约中心</h3>
              <p className="text-sm text-slate-500 mt-1">选择校内服务进行精准时段预约，减少到场排队等待时间。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    setSelectedSlot(null);
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedService?.id === srv.id 
                      ? 'border-[#1677ff] bg-blue-55/10 shadow-[0_2px_12px_rgba(22,127,255,0.06)] ring-1 ring-[#1677ff]' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="badge badge-pending">
                    {srv.category}
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-2 text-sm">{srv.name}</h4>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {srv.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 接待人: {srv.staff}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 单次: {srv.slotDurationMinutes}分钟
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedService && (
              <form onSubmit={handleBookingSubmit} className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/80 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800">您已选择：{selectedService.name}</h4>
                  <button 
                    type="button" 
                    onClick={() => setSelectedService(null)} 
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">预约人姓名</label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="你的姓名"
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-sm focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">预约联系电话</label>
                    <input
                      type="tel"
                      required
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="联系方式"
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-sm focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">选择预约日期</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      min="2026-06-01"
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-sm focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    />
                  </div>
                </div>

                {/* Timeslots Panel view */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">选择办事时间段 (绿:可选 红:满 灰:失效)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => {
                      const isExpired = slot.status === 'EXPIRED';
                      const isFull = slot.status === 'FULL';
                      const isSelected = selectedSlot === slot.timeLabel;

                      let btnStyle = "border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff] text-slate-800";
                      if (isExpired) btnStyle = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed font-normal";
                      else if (isFull) btnStyle = "bg-red-50 text-red-500 border-red-150 cursor-not-allowed";
                      else if (isSelected) btnStyle = "bg-[#1677ff] text-white border-[#1677ff] shadow-sm font-semibold";

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isExpired || isFull}
                          onClick={() => setSelectedSlot(slot.timeLabel)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                        >
                          <div>{slot.timeLabel}</div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : isFull ? 'text-red-500 font-bold' : isExpired ? 'text-slate-400' : 'text-green-600'}`}>
                            {isExpired ? '已过期' : isFull ? '已约满' : `${slot.bookedCount}/${slot.maxCapacity}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-md ${
                    selectedSlot 
                      ? 'bg-[#1677ff] hover:bg-[#0958d9] text-white cursor-pointer shadow-[0_2px_8px_rgba(22,127,255,0.2)]' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {selectedSlot ? `确认预约 ${bookingDate} ${selectedSlot}` : '请先选择时间段'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Module 3 & 5: My Passes and Service bookings */}
        {activeTab === 'passes' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">我的校园卡与通行证</h3>
                <p className="text-sm text-slate-500 mt-1">您申请的进校通行授权或办事预约记录实时存放于此。</p>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-l-4 border-[#1677ff] pl-2">访客通行证列表 ({appointments.length})</h4>
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">暂无通行证书。请在 “访客通行登记” 中提交申请。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointments.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-2">
                        {apt.status === 'PENDING' && (
                          <span className="badge badge-warning">
                            <Clock className="w-3 h-3" /> 待审核
                          </span>
                        )}
                        {apt.status === 'APPROVED' && (
                          <span className="badge badge-success">
                            <CheckCircle className="w-3 h-3" /> 审核通过, 未入校
                          </span>
                        )}
                        {apt.status === 'REJECTED' && (
                          <span className="badge badge-danger">
                            <AlertTriangle className="w-3 h-3" /> 已拒绝进校
                          </span>
                        )}
                        {apt.status === 'SIGNED_IN' && (
                          <span className="badge badge-pending">
                            <CheckCircle className="w-3 h-3 shadow-sm" /> 正在校园中
                          </span>
                        )}
                        {apt.status === 'SIGNED_OUT' && (
                          <span className="badge badge-gray">
                            <Clock className="w-3 h-3" /> 已离校
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <img src={apt.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200" />
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-800 text-sm">{apt.name} <span className="font-normal text-xs text-slate-400">[{apt.company || '个人访客'}]</span></h5>
                          <p className="text-xs text-slate-600">来访时间：<strong className="text-[#1677ff] font-semibold">{apt.visitDate}</strong></p>
                          <p className="text-xs text-slate-500">对接人：{apt.hostName} ({apt.hostDept})</p>
                          <p className="text-xs text-slate-500">缘由：{apt.reason}</p>
                          {apt.companionsCount > 0 && (
                            <p className="text-xs text-slate-500">随行：{apt.companions.map((c) => c.name).join(', ')}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-405 font-mono">
                          凭证号：{apt.id} <br />
                          {apt.checkedInTime && <span>进入: {apt.checkedInTime.split('T')[1].substring(0, 8)} </span>}
                          {apt.checkedOutTime && <span>离校: {apt.checkedOutTime.split('T')[1].substring(0, 8)}</span>}
                        </div>
                        
                        {/* Interactive simulation code representation */}
                        {apt.status === 'APPROVED' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-550 font-medium bg-white px-2 py-1 rounded border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] animate-pulse">扫码进门标志</span>
                            <span className="text-[10px] bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded uppercase font-bold border border-blue-200/50">GATE_IN</span>
                          </div>
                        )}
                        {apt.status === 'SIGNED_IN' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-550 font-medium bg-white px-2 py-1 rounded border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">扫码出门凭证</span>
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded uppercase font-bold border border-purple-150">GATE_OUT</span>
                          </div>
                        )}
                        {apt.status === 'REJECTED' && (
                          <div className="bg-red-50 p-2 rounded border border-red-100 text-xs w-full text-red-600">
                            <strong>拒绝原因：</strong>{apt.refusalReason || '不满足访问时间'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Bookings Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-l-4 border-amber-500 pl-2">办事业务预约单列表 ({bookings.length})</h4>
              {bookings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">暂无预定订单。请在 “业务预约中心” 中选择办事项目提交。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((bk) => (
                    <div key={bk.id} className="bg-white rounded-xl border border-slate-200/85 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge badge-gray font-bold text-[10px]">校内业务</span>
                        <div>
                          {bk.status === 'PENDING' && <span className="badge badge-warning">等待审批</span>}
                          {bk.status === 'APPROVED' && <span className="badge badge-success">已批准・未签到</span>}
                          {bk.status === 'SIGNED_IN' && <span className="badge badge-pending">已到场签到</span>}
                          {bk.status === 'FINISHED' && <span className="badge badge-gray">办理完成</span>}
                          {bk.status === 'REJECTED' && <span className="badge badge-danger">预约回绝</span>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-semibold text-slate-900 text-sm">{bk.serviceName}</h5>
                        <p className="text-xs text-slate-600">预约时间：<strong className="text-[#1677ff] font-semibold">{bk.bookingDate} {bk.slotTime}</strong></p>
                        <p className="text-xs text-slate-500">预定人：{bk.userName} ({bk.userPhone})</p>
                      </div>

                      {bk.status === 'APPROVED' && (
                        <div className="mt-3 p-2 bg-slate-50 border border-slate-150 rounded-lg text-xs flex justify-between items-center">
                          <span className="text-slate-500">到场后，请使用手机扫描以下科室签到码：</span>
                          <span className="bg-yellow-100 text-yellow-800 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold border border-yellow-250">SERVICE_CHECKIN</span>
                        </div>
                      )}
                      
                      {bk.status === 'REJECTED' && (
                        <p className="mt-2 text-xs text-red-500 bg-red-50 p-1.5 rounded">{bk.refusalReason || '信息不符，请重新约定'}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module 4: Integrated Simulated Scanner */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 font-sans">手机模拟扫描物理二维码 (核验入口)</h3>
              <p className="text-sm text-slate-500 mt-1">
                真实的校园场景中，访客会用手机微信扫描门岗进出的背景板、或科室的签到牌。
                本模块模拟您的手机行为：选择目标码类型及您的预约，即可一键进行签到操作！
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 text-sm">第1步：模拟扫描的二维码类型</h4>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScannerType('GATE_IN');
                      setSelectedTargetId(gates[0]?.id || '');
                      setScannedResult(null);
                    }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      scannerType === 'GATE_IN' ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-sm' : 'bg-white text-slate-600 border-slate-250/80 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    扫进校码 (GATE_IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerType('GATE_OUT');
                      setSelectedTargetId(gates[0]?.id || '');
                      setScannedResult(null);
                    }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      scannerType === 'GATE_OUT' ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-sm' : 'bg-white text-slate-600 border-slate-250/80 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    扫出校码 (GATE_OUT)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerType('SERVICE_CHECKIN');
                      setSelectedTargetId(services[0]?.id || '');
                      setScannedResult(null);
                    }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      scannerType === 'SERVICE_CHECKIN' ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-sm' : 'bg-white text-slate-600 border-slate-250/80 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    扫业务办事码
                  </button>
                </div>

                {scannerType !== 'SERVICE_CHECKIN' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">选择扫的是哪一个门岗：</label>
                    <select
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs bg-white focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    >
                      {gates.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} ({g.openTime}-{g.closeTime}开放)</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">选择扫描哪一个科室项目办理：</label>
                    <select
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs bg-white focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 text-sm">第2步：选择代表您要核验哪个证件</h4>

                {scannerType !== 'SERVICE_CHECKIN' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">选择要扫码通行的访客卡号：</label>
                    <select
                      value={selectedAptId}
                      onChange={(e) => setSelectedAptId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs bg-white focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    >
                      <option value="">- 请选择一个访客预约卡 -</option>
                      {appointments
                        .filter((a) => {
                          if (scannerType === 'GATE_IN') return a.status === 'APPROVED';
                          if (scannerType === 'GATE_OUT') return a.status === 'SIGNED_IN';
                          return true;
                        })
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            [{a.status}] {a.name} ({a.visitDate} 去访 {a.hostName})
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">若下拉栏为空，需要先申请获批（GATE_IN）或入校（GATE_OUT）。</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">选择对应的办事业务预约项目：</label>
                    <select
                      value={selectedAptId}
                      onChange={(e) => setSelectedAptId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs bg-white focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]"
                    >
                      <option value="">- 请选择您的业务预约单 -</option>
                      {bookings
                        .filter((b) => b.serviceId === selectedTargetId && b.status === 'APPROVED')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            预约人：{b.userName} (订在：{b.bookingDate} {b.slotTime})
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">仅显示此项服务在APPROVED状态的办事预定。</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl space-y-4">
              <span className="material-symbols-outlined text-[48px] text-slate-300 fill-icon animate-pulse">qr_code_scanner</span>
              <button
                type="button"
                onClick={executeSimulatedScan}
                className="bg-[#1677ff] hover:bg-[#0958d9] text-white font-semibold py-3 px-8 rounded-lg text-sm transition-all shadow-[0_2px_8px_rgba(22,127,255,0.2)] hover:shadow-md cursor-pointer"
              >
                进行虚拟手机扫描识别！
              </button>
            </div>

            {scannedResult && (
              <div className={`p-4 rounded-xl border text-sm flex gap-3 ${
                scannedResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span className="material-symbols-outlined shrink-0 text-2xl">
                  {scannedResult.success ? 'check_circle' : 'error'}
                </span>
                <div>
                  <h5 className="font-bold">{scannedResult.success ? '扫描并在系统提交成功' : '签到拦截'}</h5>
                  <p className="text-xs mt-1 text-slate-600">{scannedResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
