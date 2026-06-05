/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadData, saveData, generateTimeSlots } from './data';
import { VisitorAppointment, ServiceBooking, Gate, GateRecord, UserRole, ServicePublish } from './types';
import VisitorView from './components/VisitorView';
import GuardView from './components/GuardView';
import AuditorView from './components/AuditorView';
import AdminView from './components/AdminView';
import { 
  ShieldAlert, 
  Users, 
  HelpCircle, 
  Lock, 
  Laptop, 
  CheckCircle,
  Clock, 
  Compass, 
  Check, 
  Activity, 
  GraduationCap 
} from 'lucide-react';

// Web Audio API beep sound generator for notification alert
export function playAlertSound(type: 'success' | 'warn' | 'click') {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'warn') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220.00, audioCtx.currentTime); // A3
      oscillator.frequency.linearRampToValueAtTime(110.00, audioCtx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.45);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    }
  } catch (e) {
    // Fail silently if context not allowed yet
  }
}

export default function App() {
  const [role, setRole] = useState<UserRole>('visitor');
  const [data, setData] = useState(loadData());

  // Save back to local storage when state changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Audio system triggers for any pending items (Module 6 requirement)
  useEffect(() => {
    const pendingCount = data.appointments.filter(a => a.status === 'PENDING' && a.visitDate === '2026-06-05').length;
    if (pendingCount > 0) {
      const interval = setInterval(() => {
        playAlertSound('warn');
      }, 5000); // sound alert every 5 seconds while pending requests are waiting
      return () => clearInterval(interval);
    }
  }, [data.appointments]);

  // 1. Submit Visitor Appointment (Visitor View)
  const handleAddAppointment = (newApt: Omit<VisitorAppointment, 'id' | 'status' | 'createdAt'>) => {
    const id = `apt-${Date.now()}`;
    const appointment: VisitorAppointment = {
      ...newApt,
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const updated = [appointment, ...data.appointments];
    setData(prev => ({ ...prev, appointments: updated }));
    playAlertSound('success');
  };

  // 2. Submit Service Time Slot Booking (Visitor View)
  const handleAddBooking = (newBbk: Omit<ServiceBooking, 'id' | 'status' | 'createdAt'>) => {
    const id = `sbk-${Date.now()}`;
    // Check if the service requires audit
    const selectedService = data.services.find(s => s.id === newBbk.serviceId);
    const requireAudit = selectedService ? selectedService.requireAudit : false;

    const booking: ServiceBooking = {
      ...newBbk,
      id,
      status: requireAudit ? 'PENDING' : 'APPROVED',
      createdAt: new Date().toISOString(),
    };
    const updated = [booking, ...data.bookings];
    setData(prev => ({ ...prev, bookings: updated }));
    playAlertSound('success');
  };

  // 3. Simulated QR Scan processing (Entrance / Exit QR Scan)
  const handleScanAction = (
    type: 'GATE_IN' | 'GATE_OUT' | 'SERVICE_CHECKIN',
    targetId: string,
    aptOrBookingId: string
  ): { success: boolean; message: string } => {
    
    // Check if within gate hours (Module 3 open hours requirement: 07:30 - 18:00)
    // We will parse Current Time or simulate based on simulated local clock
    const nowHour = new Date().getUTCHours() + 8; // Simulated China hour
    const nowMin = new Date().getUTCMinutes();
    const currentMinutes = nowHour * 60 + nowMin;

    if (type === 'GATE_IN' || type === 'GATE_OUT') {
      const gate = data.gates.find(g => g.id === targetId);
      if (gate) {
        const [openH, openM] = gate.openTime.split(':').map(Number);
        const [closeH, closeM] = gate.closeTime.split(':').map(Number);
        const openTotal = openH * 60 + openM;
        const closeTotal = closeH * 60 + closeM;

        if (currentMinutes < openTotal || currentMinutes > closeTotal) {
          playAlertSound('warn');
          return {
            success: false,
            message: `【门禁拒绝】当前不在门岗的可开放通行时段（${gate.openTime}-${gate.closeTime}）内，非开放时间扫码无效！`
          };
        }
      }
    }

    if (type === 'GATE_IN') {
      // Find appointment
      const apt = data.appointments.find(a => a.id === aptOrBookingId);
      if (!apt) return { success: false, message: '未找到匹配的会客预约！' };
      if (apt.status !== 'APPROVED') {
        return { success: false, message: `核验失败！当前核验卡状态为[${apt.status}]，只有已获核准(APPROVED)的凭证才能扫码签到。` };
      }

      // Update state to SIGNED_IN
      const updatedApts = data.appointments.map(a => {
        if (a.id === aptOrBookingId) {
          return {
            ...a,
            status: 'SIGNED_IN' as const,
            checkedInTime: new Date().toISOString()
          };
        }
        return a;
      });

      // Insert gate log
      const gateObj = data.gates.find(g => g.id === targetId) || data.gates[0];
      const newRecord: GateRecord = {
        id: `rec-${Date.now()}`,
        gateId: gateObj.id,
        gateName: gateObj.name,
        visitorName: apt.name,
        visitorPhone: apt.phone,
        type: 'GATE_IN',
        actionTime: new Date().toISOString(),
        handlerName: '自助智慧闸机',
        status: 'APPROVED',
        hostName: apt.hostName,
        reason: apt.reason
      };

      setData(prev => ({ 
        ...prev, 
        appointments: updatedApts,
        records: [newRecord, ...prev.records]
      }));
      playAlertSound('success');
      return { success: true, message: `【进校成功】访客林[${apt.name}]您好，登记成功！您已触发实时门岗放行核验通告。` };
    }

    if (type === 'GATE_OUT') {
      const apt = data.appointments.find(a => a.id === aptOrBookingId);
      if (!apt) return { success: false, message: '未找到匹配的会客信息！' };
      if (apt.status !== 'SIGNED_IN') {
        return { success: false, message: `检测失败！您的状态并不是在校中(SIGNED_IN)，扫码离校不成功。` };
      }

      // Update state to SIGNED_OUT
      const updatedApts = data.appointments.map(a => {
        if (a.id === aptOrBookingId) {
          return {
            ...a,
            status: 'SIGNED_OUT' as const,
            checkedOutTime: new Date().toISOString()
          };
        }
        return a;
      });

      // Insert gate log
      const gateObj = data.gates.find(g => g.id === targetId) || data.gates[0];
      const newRecord: GateRecord = {
        id: `rec-${Date.now()}`,
        gateId: gateObj.id,
        gateName: gateObj.name,
        visitorName: apt.name,
        visitorPhone: apt.phone,
        type: 'GATE_OUT',
        actionTime: new Date().toISOString(),
        handlerName: '出校自助闸机',
        status: 'APPROVED',
        hostName: apt.hostName,
        reason: apt.reason
      };

      setData(prev => ({ 
        ...prev, 
        appointments: updatedApts,
        records: [newRecord, ...prev.records]
      }));
      playAlertSound('success');
      return { success: true, message: `【离校成功】访客[${apt.name}]，已确认出校记录。欢迎再次来校。` };
    }

    if (type === 'SERVICE_CHECKIN') {
      const bkg = data.bookings.find(b => b.id === aptOrBookingId);
      if (!bkg) return { success: false, message: '找不到预约单据项目！' };
      if (bkg.status !== 'APPROVED') {
        return { success: false, message: `签到无效：其目前处理状态为[${bkg.status}]，不能执行科室到场核销。` };
      }

      // Update to SIGNED_IN then simulate auto completion shortly
      const updatedBbk = data.bookings.map(b => {
        if (b.id === aptOrBookingId) {
          return {
            ...b,
            status: 'SIGNED_IN' as const,
            signedInTime: new Date().toISOString()
          };
        }
        return b;
      });

      setData(prev => ({ ...prev, bookings: updatedBbk }));
      
      // Auto transition to FINISHED after 8 seconds (Simulating teacher signing off paperwork)
      setTimeout(() => {
        setData(current => {
          const finishedBookings = current.bookings.map(item => {
            if (item.id === aptOrBookingId) {
              return {
                ...item,
                status: 'FINISHED' as const,
                finishedTime: new Date().toISOString()
              };
            }
            return item;
          });
          return { ...current, bookings: finishedBookings };
        });
        playAlertSound('success');
      }, 7000);

      playAlertSound('success');
      return { success: true, message: `【到场签到成功】[${bkg.userName}] 您已完成科室排队签到登记！窗口老师(张老师/李老师)将在10秒内为您核办完成手续并自动结单。` };
    }

    return { success: false, message: '未知扫描码类型。' };
  };

  // 4. Auditor Approvings (Module 1)
  const handleApproveAppointment = (id: string, auditor: string) => {
    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'APPROVED' as const,
          auditedBy: auditor,
          auditedTime: new Date().toISOString()
        };
      }
      return a;
    });
    setData(prev => ({ ...prev, appointments: updated }));
    playAlertSound('success');
  };

  const handleRejectAppointment = (id: string, refusalReason: string, auditor: string) => {
    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'REJECTED' as const,
          refusalReason,
          auditedBy: auditor,
          auditedTime: new Date().toISOString()
        };
      }
      return a;
    });
    setData(prev => ({ ...prev, appointments: updated }));
    playAlertSound('warn');
  };

  const handleBatchApprove = (ids: string[], auditor: string) => {
    const updated = data.appointments.map(a => {
      if (ids.includes(a.id) && a.status === 'PENDING') {
        return {
          ...a,
          status: 'APPROVED' as const,
          auditedBy: auditor,
          auditedTime: new Date().toISOString()
        };
      }
      return a;
    });
    setData(prev => ({ ...prev, appointments: updated }));
    playAlertSound('success');
  };

  // 5. Guard Direct Controls (Verify, Deny, Manual register) (Module 4)
  const handleVerifyPass = (id: string, operator: string) => {
    // Guard approves entrance
    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'SIGNED_IN' as const,
          checkedInTime: new Date().toISOString(),
          gateActionBy: operator,
          gateActionTime: new Date().toISOString()
        };
      }
      return a;
    });

    const targetAppointment = data.appointments.find(a => a.id === id);
    if (!targetAppointment) return;

    // Create entry log
    const newRecord: GateRecord = {
      id: `rec-${Date.now()}`,
      gateId: data.gates[0].id,
      gateName: data.gates[0].name,
      visitorName: targetAppointment.name,
      visitorPhone: targetAppointment.phone,
      type: 'GATE_IN',
      actionTime: new Date().toISOString(),
      handlerName: operator,
      status: 'APPROVED',
      hostName: targetAppointment.hostName,
      reason: targetAppointment.reason
    };

    setData(prev => ({
      ...prev,
      appointments: updated,
      records: [newRecord, ...prev.records]
    }));
    playAlertSound('success');
  };

  const handleDenyEntry = (id: string, operator: string) => {
    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'REJECTED' as const,
          refusalReason: '门卫出于临时安保需要当场拒绝其入校申请。',
          gateActionBy: operator,
          gateActionTime: new Date().toISOString()
        };
      }
      return a;
    });

    const targetAppointment = data.appointments.find(a => a.id === id);
    if (!targetAppointment) return;

    // Create entry log flagged denied
    const newRecord: GateRecord = {
      id: `rec-${Date.now()}`,
      gateId: data.gates[0].id,
      gateName: data.gates[0].name,
      visitorName: targetAppointment.name,
      visitorPhone: targetAppointment.phone,
      type: 'GATE_IN',
      actionTime: new Date().toISOString(),
      handlerName: operator,
      status: 'DENIED',
      hostName: targetAppointment.hostName,
      reason: targetAppointment.reason
    };

    setData(prev => ({
      ...prev,
      appointments: updated,
      records: [newRecord, ...prev.records]
    }));
    playAlertSound('warn');
  };

  const handleManualCheckIn = (id: string, gateId: string, operator: string) => {
    const apt = data.appointments.find(a => a.id === id);
    if (!apt) return;

    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'SIGNED_IN' as const,
          checkedInTime: new Date().toISOString(),
          gateActionBy: operator,
          gateActionTime: new Date().toISOString()
        };
      }
      return a;
    });

    const gateObj = data.gates.find(g => g.id === gateId) || data.gates[0];
    const newRecord: GateRecord = {
      id: `rec-${Date.now()}`,
      gateId: gateObj.id,
      gateName: gateObj.name,
      visitorName: apt.name,
      visitorPhone: apt.phone,
      type: 'GATE_IN',
      actionTime: new Date().toISOString(),
      handlerName: operator,
      status: 'APPROVED',
      hostName: apt.hostName,
      reason: apt.reason
    };

    setData(prev => ({
      ...prev,
      appointments: updated,
      records: [newRecord, ...prev.records]
    }));
    playAlertSound('success');
  };

  const handleManualCheckOut = (id: string, gateId: string, operator: string) => {
    const apt = data.appointments.find(a => a.id === id);
    if (!apt) return;

    const updated = data.appointments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'SIGNED_OUT' as const,
          checkedOutTime: new Date().toISOString(),
          gateActionBy: operator,
          gateActionTime: new Date().toISOString()
        };
      }
      return a;
    });

    const gateObj = data.gates.find(g => g.id === gateId) || data.gates[0];
    const newRecord: GateRecord = {
      id: `rec-${Date.now()}`,
      gateId: gateObj.id,
      gateName: gateObj.name,
      visitorName: apt.name,
      visitorPhone: apt.phone,
      type: 'GATE_OUT',
      actionTime: new Date().toISOString(),
      handlerName: operator,
      status: 'APPROVED',
      hostName: apt.hostName,
      reason: apt.reason
    };

    setData(prev => ({
      ...prev,
      appointments: updated,
      records: [newRecord, ...prev.records]
    }));
    playAlertSound('success');
  };

  // 6. Admin Actions
  const handleAddService = (newSrv: Omit<ServicePublish, 'id' | 'createdAt'>) => {
    const id = `srv-${Date.now()}`;
    const srv: ServicePublish = {
      ...newSrv,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [...data.services, srv];
    setData(prev => ({ ...prev, services: updated }));
    playAlertSound('success');
  };

  const handleAddGate = (newGate: Omit<Gate, 'id'>) => {
    const id = `gate-${Date.now()}`;
    const gate: Gate = {
      ...newGate,
      id
    };
    const updated = [...data.gates, gate];
    setData(prev => ({ ...prev, gates: updated }));
    playAlertSound('success');
  };

  const handleRemoveGate = (id: string) => {
    if (data.gates.length <= 1) {
      alert('校园必须保留至少一个对外通行闸机岗亭！');
      return;
    }
    const updated = data.gates.filter(g => g.id !== id);
    setData(prev => ({ ...prev, gates: updated }));
    playAlertSound('warn');
  };

  const handleUpdateGateTime = (id: string, openTime: string, closeTime: string) => {
    const updated = data.gates.map(g => {
      if (g.id === id) {
        return { ...g, openTime, closeTime };
      }
      return g;
    });
    setData(prev => ({ ...prev, gates: updated }));
    playAlertSound('success');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans flex flex-col justify-between">
      {/* Top Banner & Multi-role Playground Simulator Selector */}
      <nav className="bg-white border-b border-slate-200/80 select-none sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#1677ff] rounded-xl border border-blue-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {data.config.schoolName}・校园智能通行平台
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">V1.2</span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-sans">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                政教统一实录码与数字化门卫审核子系统
              </p>
            </div>
          </div>

          {/* Role Switching Panel */}
          <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/40 gap-1 overflow-x-auto w-full lg:w-auto shrink-0 justify-center">
            <button
              onClick={() => { setRole('visitor'); playAlertSound('click'); }}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                role === 'visitor' ? 'bg-[#1677ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              访客/家长端
            </button>
            <button
              onClick={() => { setRole('auditor'); playAlertSound('click'); }}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                role === 'auditor' ? 'bg-[#1677ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              政教审核员
            </button>
            <button
              onClick={() => { setRole('guard'); playAlertSound('click'); }}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                role === 'guard' ? 'bg-[#1677ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              门岗大屏看板
            </button>
            <button
              onClick={() => { setRole('admin'); playAlertSound('click'); }}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                role === 'admin' ? 'bg-[#1677ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              系统管理员
            </button>
          </div>

          {/* Right Profile Sandbox Info */}
          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200/60 font-sans">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">
                {role === 'visitor' && '社会来访市民'}
                {role === 'auditor' && '总务政教处'}
                {role === 'guard' && '物理岗亭特警'}
                {role === 'admin' && '平台运营主管'}
              </div>
              <div className="text-[10px] text-slate-400">
                {role === 'visitor' && '访客与业务登记端'}
                {role === 'auditor' && '会客与办事审核办'}
                {role === 'guard' && '门岗安全核验官'}
                {role === 'admin' && '系统全局开发者'}
              </div>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-[#1677ff] border border-slate-200/80 uppercase">
              {role.substring(0, 2)}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Visitor Side representation */}
        {role === 'visitor' && (
          <VisitorView
            appointments={data.appointments}
            services={data.services}
            bookings={data.bookings}
            gates={data.gates}
            onSubmitAppointment={handleAddAppointment}
            onSubmitBooking={handleAddBooking}
            onScanAction={handleScanAction}
          />
        )}

        {/* Auditor Side representation */}
        {role === 'auditor' && (
          <AuditorView
            appointments={data.appointments}
            onApproveAppointment={handleApproveAppointment}
            onRejectAppointment={handleRejectAppointment}
            onBatchApprove={handleBatchApprove}
            onBatchReject={(ids, reason, aud) => {
              ids.forEach(id => handleRejectAppointment(id, reason, aud));
              playAlertSound('warn');
            }}
          />
        )}

        {/* Monitor Guard Side representation */}
        {role === 'guard' && (
          <GuardView
            appointments={data.appointments}
            gates={data.gates}
            records={data.records}
            onVerifyPass={handleVerifyPass}
            onDenyEntry={handleDenyEntry}
            onManualCheckIn={handleManualCheckIn}
            onManualCheckOut={handleManualCheckOut}
          />
        )}

        {/* System Administration Configuration tab */}
        {role === 'admin' && (
          <AdminView
            services={data.services}
            gates={data.gates}
            appointments={data.appointments}
            bookings={data.bookings}
            records={data.records}
            onAddService={handleAddService}
            onAddGate={handleAddGate}
            onRemoveGate={handleRemoveGate}
            onUpdateGateTime={handleUpdateGateTime}
          />
        )}
      </main>

      {/* Footer Branding of CampusGate platform */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-xs text-center space-y-2 select-none">
        <p className="font-bold text-slate-100">校园预约与访客管理一体化数字看板平台</p>
        <p>© 2026 {data.config.schoolName}. 数字化星辰校区安全保障系统中心. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 font-mono">
          Persistent Cache Memory Storage enabled. Developed for schools as high-clarity guard & visitor terminal.
        </p>
      </footer>
    </div>
  );
}
