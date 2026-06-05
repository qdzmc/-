/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VisitorAppointment, AppointmentStatus } from '../types';
import { 
  ShieldCheck, 
  Trash2, 
  Check, 
  X, 
  ExternalLink, 
  UserCheck, 
  FileText, 
  Phone, 
  Info,
  Smartphone,
  MessageSquare
} from 'lucide-react';

interface AuditorViewProps {
  appointments: VisitorAppointment[];
  onApproveAppointment: (id: string, auditor: string) => void;
  onRejectAppointment: (id: string, refusalReason: string, auditor: string) => void;
  onBatchApprove: (ids: string[], auditor: string) => void;
  onBatchReject: (ids: string[], refusalReason: string, auditor: string) => void;
}

export default function AuditorView({
  appointments,
  onApproveAppointment,
  onRejectAppointment,
  onBatchApprove,
  onBatchReject
}: AuditorViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'PENDING' | 'AUDITED'>('PENDING');

  // Input for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modalTargetId, setModalTargetId] = useState<string | null>(null); // Null means batch reject
  const [refusalReason, setRefusalReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Simulated notification preview
  const [notifPreview, setNotifPreview] = useState<{
    phone: string;
    name: string;
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
  } | null>(null);

  // Filter list
  const filteredApts = appointments.filter(a => {
    if (auditFilter === 'ALL') return true;
    if (auditFilter === 'PENDING') return a.status === 'PENDING';
    return a.status === 'APPROVED' || a.status === 'REJECTED';
  });

  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredApts.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const executeApproveSingle = (id: string, name: string, phone: string) => {
    onApproveAppointment(id, '系统自动配给审核员');
    setNotifPreview({
      phone,
      name,
      status: 'APPROVED'
    });
    alert(`已核准访客【${name}】的进校申请，将模拟下发微信和短信审核通知书。`);
  };

  const triggerRejectModal = (id: string | null) => {
    setModalTargetId(id);
    setRefusalReason('');
    setValidationError('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (refusalReason.trim().length < 2) {
      setValidationError('拒绝原因必填，且长度不能低于2个字符！');
      return;
    }

    if (modalTargetId) {
      // Single reject
      const target = appointments.find(a => a.id === modalTargetId);
      if (target) {
        onRejectAppointment(modalTargetId, refusalReason, '总务审核科');
        setNotifPreview({
          phone: target.phone,
          name: target.name,
          status: 'REJECTED',
          reason: refusalReason
        });
      }
    } else {
      // Batch reject
      selectedIds.forEach(id => {
        const target = appointments.find(a => a.id === id);
        if (target && target.status === 'PENDING') {
          onRejectAppointment(id, refusalReason, '总务审核科-批量组');
        }
      });
      setSelectedIds([]);
      alert(`已批量拒绝所选的【${selectedIds.length}】名访客申请。`);
    }

    setShowRejectModal(false);
  };

  const handleBatchApproveExecute = () => {
    if (selectedIds.length === 0) return;
    onBatchApprove(selectedIds, '总务审核科-批量组');
    setSelectedIds([]);
    alert(`已批量批准通过所选的【${selectedIds.length}】项进校申请，已将许可通知录入数据库。`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Upper Navigation and counts cards */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1677ff]" />
            教工访客预约审核办公室 (Auditor Control Room)
          </h3>
          <p className="text-xs text-slate-400 mt-1">请按校务规范、会客保密原则及安全防卫条件，认真勾选准予通行的单子。</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 select-none pb-1 md:pb-0">
          <button
            onClick={() => setAuditFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              auditFilter === 'PENDING' ? 'bg-[#1677ff] text-white shadow-[0_2px_6px_rgba(22,127,255,0.15)] font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            待审批清单 ({appointments.filter(a => a.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setAuditFilter('AUDITED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              auditFilter === 'AUDITED' ? 'bg-[#1677ff] text-white shadow-[0_2px_6px_rgba(22,127,255,0.15)] font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            已处决归档 ({appointments.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length})
          </button>
          <button
            onClick={() => setAuditFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              auditFilter === 'ALL' ? 'bg-[#1677ff] text-white shadow-[0_2px_6px_rgba(22,127,255,0.15)] font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            全部列表
          </button>
        </div>
      </section>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {/* Batch Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50/60 text-[#1677ff] p-3 rounded-xl border border-blue-100 flex justify-between items-center text-xs">
              <span className="font-semibold">已选择 {selectedIds.length} 项</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBatchApproveExecute}
                  className="bg-[#1677ff] hover:bg-[#0958d9] text-white px-3.5 py-2 rounded-lg font-semibold transition-all shadow-[0_2px_6px_rgba(22,127,255,0.15)] cursor-pointer"
                >
                  批量审核核准 (Approve Checked)
                </button>
                <button
                  onClick={() => triggerRejectModal(null)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-150 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer"
                >
                  批量退回理由 (Reject Checked)
                </button>
              </div>
            </div>
          )}

          {/* Table list view */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length > 0 && selectedIds.length === filteredApts.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-[#1677ff] focus:ring-[#1677ff] cursor-pointer" 
                      />
                    </th>
                    <th className="p-4">访客申请基本信息</th>
                    <th className="p-4">校内接待人及部门</th>
                    <th className="p-4">拟访问时间/事由</th>
                    <th className="p-4">申请状态</th>
                    <th className="p-4 text-right">核定操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApts.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(apt.id)}
                          onChange={() => handleSelectToggle(apt.id)}
                          className="rounded border-slate-300 text-[#1677ff] focus:ring-[#1677ff] cursor-pointer" 
                        />
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img src={apt.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-800">{apt.name}</p>
                            <p className="text-[10px] text-slate-400">{apt.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{apt.hostName}</p>
                        <p className="text-[10px] text-slate-400">{apt.hostDept}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#1677ff]">{apt.visitDate}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px] inline-block font-sans" title={apt.reason}>{apt.reason}</p>
                      </td>
                      <td className="p-4">
                        {apt.status === 'PENDING' && <span className="badge badge-warning">待审批</span>}
                        {apt.status === 'APPROVED' && <span className="badge badge-success">已批准</span>}
                        {apt.status === 'REJECTED' && <span className="badge badge-danger">已驳回</span>}
                        {apt.status === 'SIGNED_IN' && <span className="badge badge-pending">在校中</span>}
                        {apt.status === 'SIGNED_OUT' && <span className="badge badge-gray">已离校</span>}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {apt.status === 'PENDING' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => executeApproveSingle(apt.id, apt.name, apt.phone)}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-lg transition-colors cursor-pointer shadow-sm"
                              title="准许进校"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerRejectModal(apt.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 p-1 rounded-lg border border-red-200 transition-all cursor-pointer"
                              title="拒绝访问"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {apt.status === 'REJECTED' ? '拒绝理由已录' : '会客完毕'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredApts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-xs text-slate-400 italic">
                        无符合条件的会客单流水记录目。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* WeChat & SMS real time template background simulator container */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            <h4 className="font-bold text-sm flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Smartphone className="w-4 h-4 text-green-500 animate-bounce" />
              进校审核推送模拟展示箱
            </h4>
            <p className="text-[11px] text-slate-400">当您对放行表单发出操作指令时，系统将通过本仿真器向来访家长、校外外聘保洁等发送即时微信消息及短信。</p>

            {notifPreview ? (
              <div className="space-y-4 text-xs">
                {/* WeChat template sandbox */}
                <div className="bg-white text-slate-800 p-3.5 rounded-lg space-y-2 border border-slate-300 shadow-sm relative">
                  <div className="flex items-center gap-1 text-green-600 font-semibold border-b pb-1.5 text-[10px] uppercase">
                    <MessageSquare className="w-3 h-3" /> 微信通知系统 (Wechat Sandbox)
                  </div>
                  <h5 className="font-bold text-slate-800">【重要】启明星高级中学服务号</h5>
                  <p className="text-[11px] text-slate-500">尊敬的 {notifPreview.name}，您的校园访问预约审核有新结果了。</p>
                  
                  <div className="bg-slate-50 p-2 rounded text-[11px] space-y-1 font-sans">
                    <p className="flex justify-between"><span>审批结果:</span> <strong className={notifPreview.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                      {notifPreview.status === 'APPROVED' ? '审批通过' : '审核拒绝'}
                    </strong></p>
                    <p className="flex justify-between"><span>提醒号码:</span> <span className="font-mono">{notifPreview.phone}</span></p>
                    {notifPreview.status === 'REJECTED' && (
                      <p className="text-red-500"><span>驳回原因:</span> {notifPreview.reason}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center justify-between"><span>详情链接：点击出示通行证</span> <ExternalLink className="w-3 w-3" /></p>
                </div>

                {/* SMS Sandbox */}
                <div className="bg-[#1677ff] text-white p-3.5 rounded-lg space-y-1.5 shadow-[0_2px_8px_rgba(22,127,255,0.15)]">
                  <div className="flex items-center gap-1 border-b border-white/20 pb-1.5 text-[10px] font-semibold text-blue-100">
                    <Smartphone className="w-3 h-3" /> 5G 闪信通道 (SMS Sandbox)
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans text-blue-50">
                    【启明星中学】您好，您登记的入校通行办件：{notifPreview.name} 被标记为
                    <strong className="mx-1 text-yellow-300">
                      {notifPreview.status === 'APPROVED' ? '【通过】请亮码进校。' : `【驳回】退回原因[${notifPreview.reason}]`}
                    </strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-44 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden border border-slate-800">
                <span className="material-symbols-outlined text-[48px] animate-pulse">sms</span>
                <p className="text-[10px] mt-1 italic">正在监听下发事件线...</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200/85 p-4 text-xs text-slate-600 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5 text-slate-800"><Info className="w-4 h-4 text-[#1677ff]" />审批规则细项</h5>
            <p>1. 如果您直接核准，系统即刻通知对方出示 <strong>GATE_IN 进校二维码页</strong> 并开放门卫终端读取能力。</p>
            <p>2. 已拒绝的申请如果被拒载，对方可以在微信查看页面中实时看到您签署 of <strong>refusalReason</strong> 决定由。您可以进行修改，并在下一次更新时更新对方反馈。</p>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-900 text-sm">拒绝进校申请 (驳回意见)</h4>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">请填写拒绝理据/退回成因 (不能少于2个字符) <span className="text-red-500">*</span></label>
              <textarea
                required
                value={refusalReason}
                onChange={(e) => {
                  setRefusalReason(e.target.value);
                  if (e.target.value.trim().length >= 2) setValidationError('');
                }}
                placeholder="比如：拜访班主任时间冲突，请选择非早读操课阶段。"
                className="w-full h-24 p-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              {validationError && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" /> {validationError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
