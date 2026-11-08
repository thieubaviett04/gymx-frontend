'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { PrinterIcon } from '@/components/ui/icons';
import { formatVND } from '@/lib/utils/formatters';
import type { PenaltyRuleSummary, RuleTargetAudience } from '@/types/penaltyRule';
import { normalizeAudience } from '@/types/penaltyRule';

interface RulePrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PenaltyRuleSummary[];
}

export function RulePrintPreviewDialog({
  isOpen,
  onClose,
  rules,
}: RulePrintPreviewDialogProps) {
  const [selectedScope, setSelectedScope] = useState<'ALL' | RuleTargetAudience>('ALL');

  if (!isOpen) return null;

  const filteredRules = rules.filter((rule) => {
    if (selectedScope === 'ALL') return true;
    return normalizeAudience(rule.violationType ?? (rule as any).targetAudience) === selectedScope;
  });

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[920px] bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="h-[64px] px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#064343]/10 flex items-center justify-center text-[#064343]">
              <PrinterIcon size={18} color="#064343" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0A0A0A] leading-tight">
                Xem trước bản nội quy phòng tập
              </h3>
              <p className="text-[12px] text-slate-500 leading-tight">
                Khổ giấy tiêu chuẩn A4 (Dành cho niêm yết & lưu hành)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-600 hidden sm:inline">
                Phạm vi in:
              </span>
              <div className="w-[170px]">
                <Select
                  value={selectedScope}
                  onValueChange={(val) => setSelectedScope(val as 'ALL' | RuleTargetAudience)}
                >
                  <SelectTrigger className="h-[38px] text-[13px] bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Chọn phạm vi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Toàn bộ quy định</SelectItem>
                    <SelectItem value="GENERAL">Nội quy chung</SelectItem>
                    <SelectItem value="MEMBER">Nội quy Hội viên</SelectItem>
                    <SelectItem value="STAFF">Nội quy Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="h-[38px] px-4 bg-[#064343] hover:bg-[#053737] text-white rounded-[8px] flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <PrinterIcon size={16} color="#FFFFFF" />
              <span>In ngay</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 flex justify-center">
          <div
            id="gymx-print-content"
            className="w-full max-w-[760px] min-h-[960px] bg-white p-8 sm:p-14 shadow-lg border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="text-center pb-6 border-b border-slate-200">
                <h4 className="text-[17px] font-bold text-slate-900 tracking-wider uppercase leading-snug">
                  GYMX FITNESS & YOGA CENTER
                </h4>
                <p className="text-[13px] text-slate-600 mt-0.5">
                  Hệ thống Phòng tập Thể hình & Yoga Cao cấp GymX
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Số 123 Đường Cầu Giấy, Quận Cầu Giấy, TP. Hà Nội • Hotline: 1900 8888
                </p>
                <div className="w-24 h-[1px] bg-slate-300 mx-auto my-3" />
                <h2 className="text-[20px] font-bold text-slate-900 tracking-wide uppercase mt-4">
                  BẢN QUY ĐỊNH NỘI QUY PHÒNG TẬP
                </h2>
                <p className="text-[13px] text-slate-600 italic mt-1">
                  (Ban hành theo Quyết định số 01/QĐ-BQL của Ban Quản Lý GymX)
                </p>
              </div>

              <div className="pt-6 space-y-4">
                {filteredRules.length === 0 ? (
                  <p className="text-center text-slate-400 italic py-10">
                    Không có điều khoản nào phù hợp với phạm vi in đã chọn.
                  </p>
                ) : (
                  filteredRules.map((rule, idx) => (
                    <div key={rule.id} className="text-left">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[14px] text-slate-900">
                          Điều {idx + 1}: {rule.name}
                        </span>
                        <span className="text-[12px] font-normal text-slate-500">
                          {(() => {
                            const norm = normalizeAudience(rule.violationType ?? (rule as any).targetAudience);
                            return norm === 'MEMBER'
                              ? '(Áp dụng: Hội viên)'
                              : norm === 'STAFF'
                              ? '(Áp dụng: Nhân viên)'
                              : '(Áp dụng: Chung)';
                          })()}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-[13px] text-slate-700 leading-relaxed pl-3 mt-1 whitespace-pre-line">
                          - {rule.description}
                        </p>
                      )}
                      <p className="text-[12px] font-medium text-slate-800 pl-3 mt-1 italic">
                        * Chế tài:{' '}
                        {(() => {
                          const norm = normalizeAudience(rule.violationType ?? (rule as any).targetAudience);
                          if (norm === 'MEMBER' || !rule.fineAmount || Number(rule.fineAmount) === 0) {
                            return 'Nhắc nhở lần 1; vi phạm tái diễn sẽ xử lý kỷ luật theo thang cảnh báo hội viên.';
                          }
                          return `Phạt ${formatVND(rule.fineAmount)}/lần vi phạm (trừ trực tiếp vào bảng lương).`;
                        })()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-10 mt-10 border-t border-slate-100 flex flex-col items-end text-right select-none">
              <p className="text-[13px] text-slate-600 italic">
                Hà Nội, ngày {day} tháng {month} năm {year}
              </p>
              <p className="text-[13px] font-bold text-slate-900 uppercase mt-1">
                TM. BAN QUẢN LÝ PHÒNG TẬP
              </p>
              <p className="text-[12px] text-slate-400 italic mt-0.5 mb-16">
                (Ký và đóng dấu)
              </p>
              <p className="text-[13px] font-bold text-slate-900">
                GIÁM ĐỐC ĐIỀU HÀNH
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #gymx-print-content,
          #gymx-print-content * {
            visibility: visible !important;
          }
          #gymx-print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

export default RulePrintPreviewDialog;

