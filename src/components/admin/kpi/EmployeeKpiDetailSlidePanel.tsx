'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Dumbbell, UserCheck } from 'lucide-react';
import { Badge, RewardGiftIcon } from '@/components/ui';
import { useRouter } from '@/i18n/routing';
import { formatVND, formatDate } from '@/lib/utils/formatters';
import { kpiService } from '@/lib/api/modules/kpiService';
import type { EmployeeKpiDetail } from '@/types/kpi';

interface EmployeeKpiDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  kpiId: string | null;
}

function InfoItem({
  label,
  value,
  isHighlight = false,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  isHighlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <div
        className={`text-[14px] leading-relaxed break-words ${
          isHighlight
            ? 'font-semibold text-[#064343]'
            : 'font-medium text-[#011010]'
        }`}
      >
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </div>
    </div>
  );
}

export function EmployeeKpiDetailSlidePanel({
  isOpen,
  onClose,
  kpiId,
}: EmployeeKpiDetailSlidePanelProps) {
  const router = useRouter();
  const { data: detailData, isLoading } = useQuery({
    queryKey: ['admin-employee-kpi-detail', kpiId],
    queryFn: async () => {
      if (!kpiId) return null;
      const res = await kpiService.getEmployeeKpiById(kpiId);
      return res.data as EmployeeKpiDetail;
    },
    enabled: isOpen && !!kpiId,
    staleTime: 30000,
  });

  if (!isOpen || !kpiId) return null;

  const detail = detailData;
  const isTrainer = detail?.position === 'TRAINER';
  const isAchieved = detail?.status === 'ACHIEVED';
  const roleName = isTrainer ? 'Huấn luyện viên' : 'Lễ tân';
  const hasNote = Boolean(detail?.note && detail.note.trim().length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết tiến độ KPI"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[700px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Chi tiết tiến độ KPI
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isAchieved ? 'active' : 'inactive'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {isAchieved ? 'Đạt chỉ tiêu' : 'Đang áp dụng'}
              </Badge>
            </div>

            <div className="w-[1px] h-4 bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#064343] animate-spin" />
            <p className="text-[14px] text-[#64748B]">Đang tải chi tiết tiến độ...</p>
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#64748B]">
            Không tìm thấy thông tin tiến độ KPI.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN NHÂN VIÊN
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem label="Mã NV" value={detail.employeeCode} />
                <InfoItem label="Họ và tên" value={detail.fullName} />
                <InfoItem label="Vai trò" value={roleName} />
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  CHỈ TIÊU & TIẾN ĐỘ THỰC TẾ
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem label="Mẫu KPI áp dụng" value={detail.templateName} />
                <InfoItem
                  label="Kỳ đánh giá"
                  value={`Tháng ${detail.month}/${detail.year}`}
                />
                <InfoItem
                  label="Ngày giao chỉ tiêu"
                  value={formatDate(detail.assignedAt)}
                />

                <InfoItem
                  label="Doanh thu"
                  value={`${formatVND(detail.actualRevenue)} / ${formatVND(detail.targetRevenue)}`}
                />

                {isTrainer ? (
                  <InfoItem
                    label="Buổi dạy PT"
                    value={`${detail.actualPtSessions ?? 0} / ${detail.targetPtSessions ?? 0} buổi`}
                  />
                ) : (
                  <InfoItem
                    label="Hội viên mới"
                    value={`${detail.actualNewMembers ?? 0} / ${detail.targetNewMembers ?? 0} hội viên`}
                  />
                )}

                <InfoItem
                  label="Thưởng chỉ tiêu"
                  value={
                    isAchieved ? (
                      <span className="font-semibold text-emerald-600">
                        +{formatVND(detail.targetBonusAmount)}
                      </span>
                    ) : (
                      '—'
                    )
                  }
                />

                <div className="sm:col-span-3 flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#64748B]">Tổng tiến độ hoàn thành KPI:</span>
                    <span className="font-bold text-[#064343]">
                      {detail.overallProgress >= 100
                        ? '100%'
                        : `${Math.max(detail.overallProgress, 0).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAchieved ? 'bg-emerald-600' : 'bg-[#064343]'
                      }`}
                      style={{
                        width: `${Math.min(Math.max(detail.overallProgress, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {detail.completedPtSessionsList && detail.completedPtSessionsList.length > 0 && (
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#064343]" />
                    <span>DANH SÁCH BUỔI DẠY PT ({detail.completedPtSessionsList.length})</span>
                  </h4>
                </div>

                <div className="px-5">
                  <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-medium">
                        <tr>
                          <th className="py-2.5 px-3">Hội viên</th>
                          <th className="py-2.5 px-3">Gói tập</th>
                          <th className="py-2.5 px-3 text-right">Thời gian hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {detail.completedPtSessionsList.map((session, idx) => (
                          <tr key={session.sessionId || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-[#011010]">
                              {session.memberName}
                            </td>
                            <td className="py-2.5 px-3 text-[#64748B]">
                              {session.packageTitle || 'Gói PT cá nhân'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#64748B]">
                              {formatDate(session.completedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {detail.achievedOrdersList && detail.achievedOrdersList.length > 0 && (
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#064343]" />
                    <span>DANH SÁCH ĐƠN HÀNG HOÀN THÀNH ({detail.achievedOrdersList.length})</span>
                  </h4>
                </div>

                <div className="px-5">
                  <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-medium">
                        <tr>
                          <th className="py-2.5 px-3">Mã đơn</th>
                          <th className="py-2.5 px-3">Khách hàng</th>
                          <th className="py-2.5 px-3 text-right">Giá trị đơn</th>
                          <th className="py-2.5 px-3 text-right">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {detail.achievedOrdersList.map((order, idx) => (
                          <tr key={order.orderId || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-medium text-[#064343]">
                              {order.orderCode}
                            </td>
                            <td className="py-2.5 px-3 text-[#011010]">
                              {order.customerName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-emerald-600">
                              {formatVND(order.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#64748B]">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  GHI CHÚ
                </h4>
              </div>

              {hasNote ? (
                <div className="px-5">
                  <p className="text-[14px] text-[#011010] leading-relaxed whitespace-pre-wrap break-words">
                    {detail.note}
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-8 sm:py-10">
                  <img
                    src="/images/empty-rating.svg"
                    alt="Chưa có ghi chú"
                    className="w-[90px] h-[105px] object-contain mb-3"
                  />
                  <p className="text-[15px] text-[#64748B] font-normal leading-6 text-center">
                    Chưa có ghi chú
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-[68px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span>Đóng</span>
          </button>

          {isAchieved && (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/admin/payroll/rewards');
              }}
              className="h-[40px] px-5 rounded-[10px] text-[13px] font-medium leading-[20px] text-white bg-[#064343] hover:bg-[#053737] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center gap-2"
            >
              <RewardGiftIcon className="w-4 h-4 text-white" color="#FFFFFF" />
              <span>Thưởng KPI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeKpiDetailSlidePanel;

