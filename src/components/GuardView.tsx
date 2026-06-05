/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VisitorAppointment, Gate, GateRecord } from '../types';
import { 
  Users, 
  LogIn, 
  LogOut, 
  MapPin, 
  AlertTriangle, 
  HelpCircle, 
  Bell, 
  Volume2, 
  VolumeX, 
  Check, 
  X, 
  ShieldAlert, 
  Clock, 
  Search,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface GuardViewProps {
  appointments: VisitorAppointment[];
  gates: Gate[];
  records: GateRecord[];
  onVerifyPass: (id: string, operator: string) => void;
  onDenyEntry: (id: string, operator: string) => void;
  onManualCheckIn: (id: string, gateId: string, operator: string) => void;
  onManualCheckOut: (id: string, gateId: string, operator: string) => void;
}

export default function GuardView({
  appointments,
  gates,
  records,
  onVerifyPass,
  onDenyEntry,
  onManualCheckIn,
  onManualCheckOut
}: GuardViewProps) {
  // Gate selected
  const [selectedGateId, setSelectedGateId] = useState<string>(gates[0]?.id || '');
  const selectedGateObj = gates.find(g => g.id === selectedGateId) || gates[0];

  // Sound alert simulator state
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  // Manual query search
  const [searchKey, setSearchKey] = useState('');
  
  // Clock mock state (Refreshes real time in UI)
  const [currentSec, setCurrentSec] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSec(prev => (prev + 1) % 5); // count 0..4 then repeat
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter appointments for pending verification
  // A visitor who scanned GATE_IN is SIGNED_IN but can be listed for visual verification
  const pendingAptsForSecurity = appointments.filter(a => a.status === 'PENDING' && a.visitDate === '2026-06-05');
  const signedInAptsToday = appointments.filter(a => a.status === 'SIGNED_IN' && a.visitDate === '2026-06-05');
  
  // Alarm trigger detection: if any PENDING appts exist, trigger flashing alarm after 15 seconds
  useEffect(() => {
    if (pendingAptsForSecurity.length > 0) {
      setAlarmActive(true);
    } else {
      setAlarmActive(false);
    }
  }, [pendingAptsForSecurity]);

  // Statistics Calculators based on current state (Real-time computed)
  const todayApts = appointments.filter(a => a.visitDate === '2026-06-05');
  const totalVisitorsToday = todayApts.length;
  const signedInToday = appointments.filter(a => (a.status === 'SIGNED_IN' || a.status === 'SIGNED_OUT') && a.visitDate === '2026-06-05').length;
  const signedOutToday = appointments.filter(a => a.status === 'SIGNED_OUT' && a.visitDate === '2026-06-05').length;
  const currentlyOnCampus = appointments.filter(a => a.status === 'SIGNED_IN' && a.visitDate === '2026-06-05').length;

  // Overtime people: entered more than 4 hours ago from current time demo (e.g. checked in before 08:30)
  const overtimeCount = appointments.filter(a => {
    if (a.status !== 'SIGNED_IN' || a.visitDate !== '2026-06-05') return false;
    if (!a.checkedInTime) return false;
    // Mock condition: if checked in time includes 08: or 07: (earlier hours)
    const hStr = a.checkedInTime.split('T')[1]?.substring(0, 2);
    return Number(hStr) <= 8;
  }).length;

  const currentGateRecords = records.filter(r => r.gateId === selectedGateId);

  // Manual search match results (only filter currently playable options)
  const filteredSearchApts = searchKey ? appointments.filter(a => 
    a.visitDate === '2026-06-05' && 
    (a.name.includes(searchKey) || a.phone.includes(searchKey))
  ) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Upper Panel: Gate switch and simulator trigger metrics */}
      <div className="bg-slate-950 text-white rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="text-base font-bold font-sans">门岗值班核验控制端</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            当前值班：<strong>门卫 A岗录入员</strong> | 守护校园一线的物理屏障安全。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Gate Selector */}
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-400">执勤岗亭:</span>
            <select
              value={selectedGateId}
              onChange={(e) => setSelectedGateId(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer border-none p-0 focus:ring-0"
            >
              {gates.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white">{g.name}</option>
              ))}
            </select>
          </div>

          {/* Alarm status sound toggle emulator */}
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSoundMuted ? 'bg-slate-850 text-slate-400 border border-slate-800' : 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isSoundMuted ? '音效已关' : '警铃开启'}
          </button>

          {/* Simulated Auto clock */}
          <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg font-mono">
            系统同步: 5s 循环 
            <span className="font-bold text-blue-400 ml-1">.{currentSec}s</span>
          </div>
        </div>
      </div>

      {/* Module 6: Real-time Statistics Screen */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">今日访客数</span>
            <Users className="w-4 h-4 text-[#1677ff]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2 font-mono">{totalVisitorsToday}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">今日已签到</span>
            <LogIn className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#11af2c] mt-2 font-mono">{signedInToday}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">今日已离校</span>
            <LogOut className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-500 mt-2 font-mono">{signedOutToday}</p>
        </div>

        <div className="bg-blue-50/45 rounded-xl p-4 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-blue-800">在校访客数</span>
            <MapPin className="w-4 h-4 text-[#1677ff]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1677ff] mt-2 font-mono">{currentlyOnCampus}</p>
        </div>

        <div className="bg-red-50 text-red-900 rounded-xl p-4 border border-red-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-red-500">超时未离校</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-2 font-mono">{overtimeCount}</p>
        </div>

        <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-800">待核验申请</span>
            <Bell className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2 font-mono">{pendingAptsForSecurity.length}</p>
        </div>
      </div>

      {alarmActive && !isSoundMuted && (
        <div className="bg-red-500 text-white rounded-lg p-3 text-xs flex justify-between items-center animate-pulse shadow-md">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce shrink-0" />
            <strong className="font-semibold">【紧急提醒】发现有待核验的新访客进校申请正在阻塞！请立即进行人工审查或放行。</strong>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider shrink-0">Alarm Active</p>
        </div>
      )}

      {/* Main Verification Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification lists stream flow */}
        <div className="lg:col-span-8 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span> 
            需要实时核验放行的入场人员
          </h4>

          {pendingAptsForSecurity.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-dashed border-slate-205 text-center flex flex-col items-center justify-center space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <span className="material-symbols-outlined text-[42px] text-slate-350">verified_user</span>
              <p className="text-xs font-semibold text-slate-600">当前没有积压的进校待审查件</p>
              <p className="text-[11px] text-slate-400">当访客提交微信预约申请且教工通过该登记后，将立即产生大屏放行通知任务。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAptsForSecurity.map((apt) => (
                <div 
                  key={apt.id} 
                  className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 border-l-4 transition-all relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center sm:items-start ${
                    alarmActive ? 'border-l-red-500 shadow-red-100/30 bg-red-50/10' : 'border-l-[#1677ff]'
                  }`}
                >
                  {/* Photo Profile */}
                  <img src={apt.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm" />
                  
                  {/* Visitor details */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{apt.name} <span className="font-normal text-xs text-slate-400">({apt.company || '个人访客'})</span></h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">联络电话：{apt.phone.substring(0, 3)}****{apt.phone.substring(7, 11)}</p>
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-mono">
                        提交: {apt.createdAt.split('T')[1]?.substring(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                      <div>
                        <span className="text-slate-400">接待人/科室:</span>
                        <p className="font-semibold text-slate-700">{apt.hostName} ({apt.hostDept})</p>
                      </div>
                      <div>
                        <span className="text-slate-400">来访事由:</span>
                        <p className="font-semibold text-slate-705 truncate" title={apt.reason}>{apt.reason}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onVerifyPass(apt.id, '门卫A岗')}
                        className="flex-1 py-1.5 rounded-lg bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(22,127,255,0.15)] hover:shadow-md cursor-pointer flex items-center justify-center gap-1 min-h-[40px]"
                      >
                        <Check className="w-4 h-4" /> 核验放行
                      </button>
                      <button
                        onClick={() => onDenyEntry(apt.id, '门卫A岗')}
                        className="flex-1 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 min-h-[40px]"
                      >
                        <X className="w-4 h-4" /> 拒绝放行
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Gate Logs */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              【{selectedGateObj.name}】实时进出登记历史 ({currentGateRecords.length})
            </h4>

            {currentGateRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic">此岗哨今日暂无过门日志流水。</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {currentGateRecords.sort((a,b) => b.actionTime.localeCompare(a.actionTime)).map((rec) => (
                  <div key={rec.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rec.type === 'GATE_IN' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-purple-50 text-purple-700 border border-purple-150'
                        }`}>
                          {rec.type === 'GATE_IN' ? '确认入校' : '确认离校'}
                        </span>
                        <span className="font-bold text-slate-800">{rec.visitorName}</span>
                        <span className="text-slate-400 font-mono">({rec.visitorPhone})</span>
                      </div>
                      <p className="text-slate-500">来访理由：{rec.reason} ・ 访教工：{rec.hostName}</p>
                    </div>

                    <div className="text-right space-y-0.5 shrink-0 pl-2">
                      <p className="font-bold text-slate-800 font-mono">{rec.actionTime.split('T')[1]?.substring(0, 8)}</p>
                      <p className="text-[10px] text-slate-400">处理人：{rec.handlerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: manual lookup check-in and checkout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">手工登记控制面板</h4>
            <p className="text-xs text-slate-500 leading-relaxed">若部分访客老年人不带手机、或没有成功扫码，可在此处搜索姓名、尾号，手工执行进出登记操作。</p>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="搜索访客姓名/手机号..."
                className="w-full pl-8 pr-3 py-2 border rounded-lg border-slate-200 text-xs focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>

            {searchKey && (
              <div className="bg-slate-55 rounded-lg p-2 border border-slate-200 max-h-56 overflow-y-auto space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">匹配的今日访客 ({filteredSearchApts.length})</p>
                {filteredSearchApts.map((apt) => (
                  <div key={apt.id} className="bg-white p-2.5 rounded border border-slate-100 text-xs space-y-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{apt.name}</span>
                      <span className="text-[9px] bg-slate-105 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600 font-mono uppercase">{apt.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">手机: {apt.phone}</p>
                    
                    <div className="flex gap-1 pt-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={apt.status !== 'APPROVED'}
                        onClick={() => {
                          onManualCheckIn(apt.id, selectedGateId, '手动操作台');
                          setSearchKey('');
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-colors ${
                          apt.status === 'APPROVED' ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                        }`}
                      >
                        进校签到
                      </button>
                      <button
                        type="button"
                        disabled={apt.status !== 'SIGNED_IN'}
                        onClick={() => {
                          onManualCheckOut(apt.id, selectedGateId, '手动操作台');
                          setSearchKey('');
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-colors ${
                          apt.status === 'SIGNED_IN' ? 'bg-purple-500 text-white hover:bg-purple-650 shadow-sm' : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                        }`}
                      >
                        确认离校
                      </button>
                    </div>
                  </div>
                ))}
                {filteredSearchApts.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">未找到任何符合匹配条件的预约项</p>
                )}
              </div>
            )}
          </div>

          {/* Quick instructions security summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2"><CalendarCheck className="w-4 h-4 text-[#1677ff]" />门岗通行工作提示</h4>
            <div className="space-y-2.5 text-xs text-slate-500 leading-relaxed">
              <p className="flex gap-1.5"><span className="text-[#1677ff] font-bold">1.</span> 验证人员进入学校时，不仅需要确认状态核验，还需对登记照片进行二次人脸比对，无误后放行。</p>
              <p className="flex gap-1.5"><span className="text-[#1677ff] font-bold">2.</span> 业务办理人员需要进校时，如果符合管理员发布的业务条目、需要门岗核验的，在上面“待核验流”中同意其通过。</p>
              <p className="flex gap-1.5"><span className="text-[#1677ff] font-bold">3.</span> 严禁非开放时间（{selectedGateObj.openTime}至{selectedGateObj.closeTime}之外）进行扫码入校。在时间线之外，手机模拟扫描会有报警。点按拒绝放行即可。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
