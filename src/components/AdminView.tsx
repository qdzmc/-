/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServicePublish, Gate, VisitorAppointment, ServiceBooking, GateRecord } from '../types';
import { 
  Plus, 
  HelpCircle, 
  Trash2, 
  QrCode, 
  BarChart2, 
  BookOpen, 
  PlusCircle, 
  Check, 
  X, 
  Download, 
  ExternalLink,
  Shield,
  FileSpreadsheet
} from 'lucide-react';

interface AdminViewProps {
  services: ServicePublish[];
  gates: Gate[];
  appointments: VisitorAppointment[];
  bookings: ServiceBooking[];
  records: GateRecord[];
  onAddService: (srv: Omit<ServicePublish, 'id' | 'createdAt'>) => void;
  onAddGate: (gate: Omit<Gate, 'id'>) => void;
  onRemoveGate: (id: string) => void;
  onUpdateGateTime: (id: string, openTime: string, closeTime: string) => void;
}

export default function AdminView({
  services,
  gates,
  appointments,
  bookings,
  records,
  onAddService,
  onAddGate,
  onRemoveGate,
  onUpdateGateTime
}: AdminViewProps) {
  // Tabs
  const [adminTab, setAdminTab] = useState<'services' | 'gates' | 'stat'>('services');

  // New Service Publish State
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('教务处');
  const [srvLocation, setSrvLocation] = useState('');
  const [srvStaff, setSrvStaff] = useState('');
  const [srvStartDate, setSrvStartDate] = useState('2026-06-05');
  const [srvEndDate, setSrvEndDate] = useState('2026-06-15');
  const [srvStartTime, setSrvStartTime] = useState('09:00');
  const [srvEndTime, setSrvEndTime] = useState('11:00');
  const [srvDuration, setSrvDuration] = useState(10);
  const [srvCapacity, setSrvCapacity] = useState(1);
  const [srvRequireAudit, setSrvRequireAudit] = useState(false);
  const [srvRequireGate, setSrvRequireGate] = useState(true);
  const [srvEnableCheck, setSrvEnableCheck] = useState(true);

  // New Gate State
  const [gateName, setGateName] = useState('');
  const [gateOpen, setGateOpen] = useState('07:30');
  const [gateClose, setGateClose] = useState('18:00');

  // Selected Gate QR Preview Modeler
  const [activePreviewGate, setActivePreviewGate] = useState<Gate | null>(null);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvLocation || !srvStaff) {
      alert('请将新建服务的主要必填字段填写完整！');
      return;
    }
    onAddService({
      name: srvName,
      category: srvCategory,
      location: srvLocation,
      staff: srvStaff,
      startDate: srvStartDate,
      endDate: srvEndDate,
      dailyStartTime: srvStartTime,
      dailyEndTime: srvEndTime,
      slotDurationMinutes: srvDuration,
      maxCapacityPerSlot: srvCapacity,
      requireAudit: srvRequireAudit,
      requireGateVerify: srvRequireGate,
      enableCheckIn: srvEnableCheck,
    });
    // Reset Form
    setSrvName('');
    setSrvLocation('');
    setSrvStaff('');
    alert('新一轮校务接待预约业务成功发布！系统已开始监听。');
  };

  const handleCreateGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateName) return;
    onAddGate({
      name: gateName,
      openTime: gateOpen,
      closeTime: gateClose,
      status: 'ACTIVE',
    });
    setGateName('');
    alert(`【${gateName}】信息已成功载入系统并对应生成进出双向智能QR码保护系统。`);
  };

  // Mock export statistics
  const exportToCSV = (type: 'VISITOR' | 'SERVICE') => {
    let content = 'data:text/csv;charset=utf-8,';
    if (type === 'VISITOR') {
      content += '访问申请单号,访客姓名,手机号,对接教师,被访部门,来访日期,来访事由,状态,进校登记时间,离校登记时间\n';
      appointments.forEach(a => {
        content += `"${a.id}","${a.name}","${a.phone}","${a.hostName}","${a.hostDept}","${a.visitDate}","${a.reason}","${a.status}","${a.checkedInTime || ''}","${a.checkedOutTime || ''}"\n`;
      });
    } else {
      content += '业务预约单号,项目名称,预约日期,段位时间,预定市民,代表电话,服务状态\n';
      bookings.forEach(b => {
        content += `"${b.id}","${b.serviceName}","${b.bookingDate}","${b.slotTime}","${b.userName}","${b.userPhone}","${b.status}"\n`;
      });
    }

    const encodedUri = encodeURI(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type === 'VISITOR' ? '访客记录统计表' : '校务预约记录表'}_2026-06-05.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Computations
  // 1. Visits by dept count mapping
  const deptCount: { [key: string]: number } = {};
  appointments.forEach(a => {
    const dept = a.hostDept || '其他';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });

  // 2. Business booking completion stats
  const finishedCount = bookings.filter(b => b.status === 'FINISHED').length;
  const missedCount = bookings.filter(b => b.status === 'PENDING').length; // simple no-show mock (pending items are untreated)
  const totalBookCount = bookings.length;
  const completionRate = totalBookCount === 0 ? 0 : Math.round((finishedCount / totalBookCount) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tab Switcher Area */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-1 shadow-sm">
        <button
          onClick={() => setAdminTab('services')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            adminTab === 'services' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 预约业务发布配置
        </button>
        <button
          onClick={() => setAdminTab('gates')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            adminTab === 'gates' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" /> 门岗管理及通行码
        </button>
        <button
          onClick={() => setAdminTab('stat')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            adminTab === 'stat' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> 平台统计分析与导出
        </button>
      </div>

      {/* Tab Contents */}
      {adminTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Publish service form */}
          <form onSubmit={handleCreateService} className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm border-b pb-2">发布新校务办事时间窗口预约</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">办事业务项目名称</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="如：应届生毕业档案提取签署盖章"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">主办分类部门</label>
                <select
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                >
                  <option value="教务处">教务处</option>
                  <option value="办公室">办公室</option>
                  <option value="德育处">德育处</option>
                  <option value="招生办">招生办</option>
                  <option value="总务处">总务处</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">办理具体地点</label>
                <input
                  type="text"
                  required
                  value={srvLocation}
                  onChange={(e) => setSrvLocation(e.target.value)}
                  placeholder="如：主楼一楼102室教务科窗口"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">接待办理教师</label>
                <input
                  type="text"
                  required
                  value={srvStaff}
                  onChange={(e) => setSrvStaff(e.target.value)}
                  placeholder="如：王老师 (教务助理)"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">开放日期开始</label>
                <input
                  type="date"
                  value={srvStartDate}
                  onChange={(e) => setSrvStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">开放截止日期</label>
                <input
                  type="date"
                  value={srvEndDate}
                  onChange={(e) => setSrvEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">首段开始时间</label>
                <input
                  type="time"
                  value={srvStartTime}
                  onChange={(e) => setSrvStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">末段截止时间</label>
                <input
                  type="time"
                  value={srvEndTime}
                  onChange={(e) => setSrvEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">单次预约办结耗时 (分钟)</label>
                <input
                  type="number"
                  value={srvDuration}
                  onChange={(e) => setSrvDuration(Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">该时段支持最大通过人数</label>
                <input
                  type="number"
                  value={srvCapacity}
                  onChange={(e) => setSrvCapacity(Number(e.target.value))}
                  placeholder="1"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700">
                <input 
                  type="checkbox" 
                  checked={srvRequireAudit} 
                  onChange={(e) => setSrvRequireAudit(e.target.checked)}
                  className="rounded text-blue-600" 
                /> 
                需要管理员在线审核 (Require Audit)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700">
                <input 
                  type="checkbox" 
                  checked={srvRequireGate} 
                  onChange={(e) => setSrvRequireGate(e.target.checked)}
                  className="rounded text-blue-600" 
                /> 
                需要校本门岗拦截核对
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-xs transition-all shadow cursor-pointer"
            >
              立刻发布办件窗口
            </button>
          </form>

          {/* Current listing */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm">已发布的线上时间仓项目 ({services.length})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {services.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-900 font-bold">
                    <span>{s.name}</span>
                    <span className="text-[10px] bg-slate-200 px-1 py-0.5 rounded font-normal shrink-0">{s.category}</span>
                  </div>
                  <p className="text-slate-600">时段间隙：{s.dailyStartTime}-{s.dailyEndTime} ({s.slotDurationMinutes}分钟/轮)</p>
                  <p className="text-slate-500">承载量限制：每个时段限 {s.maxCapacityPerSlot} 人办结</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gate and QR code management */}
      {adminTab === 'gates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Gates details listings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm pb-2 border-b">学校门卫岗哨通行点部署</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gates.map((g) => (
                  <div key={g.id} className="bg-slate-50 border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> {g.name}
                      </h5>
                      <p className="text-[10px] text-slate-500">开放通勤限额：{g.openTime} 至 {g.closeTime}</p>
                    </div>

                    <div className="flex gap-1.5 mt-4">
                      <button
                        type="button"
                        onClick={() => setActivePreviewGate(g)}
                        className="flex-1 py-1.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold transition-all cursor-pointer flex justify-center items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> 二维码牌
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveGate(g.id)}
                        className="py-1.5 px-2 rounded hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 text-[10px] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Active QR Printer paper display */}
            {activePreviewGate && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center space-y-4 relative">
                <button onClick={() => setActivePreviewGate(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
                
                <h5 className="font-bold text-slate-800 text-sm">【打印下载核验卡片】 {activePreviewGate.name} 专用通门哨卡</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
                  {/* Gate in placard */}
                  <div className="border border-green-200 rounded-xl p-4 bg-green-50/20 text-center space-y-2">
                    <span className="text-[10px] bg-green-600 text-white font-bold px-2 py-0.5 rounded uppercase">GATE_IN</span>
                    <div className="w-28 h-28 mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-inner relative">
                      <QrCode className="w-20 h-20 text-green-600" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-400">IN-{activePreviewGate.id}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-xs">进门通道二维码</p>
                    <p className="text-[10px] text-slate-500">张贴在岗亭外部供访客步行/驾车入内时扫码登记进校园。</p>
                  </div>

                  {/* Gate out placard */}
                  <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/20 text-center space-y-2">
                    <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded uppercase">GATE_OUT</span>
                    <div className="w-28 h-28 mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-inner relative">
                      <QrCode className="w-20 h-20 text-purple-600" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-400">OUT-{activePreviewGate.id}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-xs">出门离校放行码</p>
                    <p className="text-[10px] text-slate-500">张贴于出口闸机前，离校时扫码扣减校区留存访问，退出签到。</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => alert('已成功发送打印命令！将在您连接本校的局域网络打印机执行。')} className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> 打印下载高清码牌PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Gate form component */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">部署新设或临时通道门岗</h4>
            
            <form onSubmit={handleCreateGate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">岗哨名称</label>
                <input
                  type="text"
                  required
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  placeholder="如：西门车辆专用通道房"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">每日开放最早时间</label>
                <input
                  type="time"
                  value={gateOpen}
                  onChange={(e) => setGateOpen(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">每日晚间关闭时间</label>
                <input
                  type="time"
                  value={gateClose}
                  onChange={(e) => setGateClose(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs"
              >
                录入新通道口
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Real time stats & analytics + mock CSV exports */}
      {adminTab === 'stat' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">校园通行统计仪表大屏 Dashboard</h4>
                <p className="text-xs text-slate-500 mt-0.5">本统计区收集本校的访学、办事预约记录，支撑后台核算评估。</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => exportToCSV('VISITOR')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" /> 导出访客过门流水 (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => exportToCSV('SERVICE')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" /> 导出业务预约主表 (CSV)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Department visit ratio (Mock Visual list) */}
              <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 flex justify-between">
                  <span>被访部门热点占比统计</span>
                  <span className="text-[10px] text-slate-400">June 2026</span>
                </h5>
                <div className="space-y-2 text-xs">
                  {Object.entries(deptCount).map(([dept, count]) => {
                    const ratio = Math.round((count / appointments.length) * 100);
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold">{dept}</span>
                          <span className="font-mono text-slate-500">{count}次 ({ratio}%)</span>
                        </div>
                        {/* Custom SVG CSS bar chart */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${ratio}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Completion stats */}
              <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 flex justify-between">
                  <span>校内业务办理达成率</span>
                  <span className="text-[10px] text-slate-400">6月累积</span>
                </h5>
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-slate-200 fill-none" strokeWidth="8" />
                      <circle cx="40" cy="40" r="34" className="stroke-blue-600 fill-none" strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - completionRate / 100)} />
                    </svg>
                    <span className="absolute font-bold text-slate-800 text-sm">{completionRate || 0}%</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs text-slate-800">业务完成度评估良好</p>
                    <p className="text-[10px] text-slate-400">
                      已履行 {finishedCount} 件 / 总预约量 {totalBookCount} 
                    </p>
                  </div>
                </div>
              </div>

              {/* No-show & ranking checklist */}
              <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h5 className="font-bold text-xs text-slate-800">热门业务项目排行对比 (按预定份数)</h5>
                <div className="divide-y divide-slate-100 text-xs">
                  {services.map((srv, idx) => {
                    const cnt = bookings.filter(b => b.serviceId === srv.id).length;
                    return (
                      <div key={srv.id} className="py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                            idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 truncate max-w-[150px]" title={srv.name}>{srv.name}</span>
                        </div>
                        <span className="font-mono text-slate-500 font-semibold">{cnt} 例预定</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
