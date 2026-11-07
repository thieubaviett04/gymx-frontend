'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { PenaltyRuleDetail, PenaltyRuleSummary } from '@/types/penaltyRule';
import {
  getPenaltyRuleStatusBadge,
  getRuleAudienceLabel,
  getRuleFineLabel,
  PENALTY_RULE_SEVERITY_LABELS,
  PENALTY_RULE_STATUS_LABELS,
} from '@/types/penaltyRule';

interface RuleDetailInfoProps {
  rule: PenaltyRuleSummary | PenaltyRuleDetail;
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
        {value || '—'}
      </div>
    </div>
  );
}

export function RuleDetailInfo({ rule }: RuleDetailInfoProps) {
  const detailRule = rule as PenaltyRuleDetail;
  const hasDescription = Boolean(rule.description && rule.description.trim());

  return (
    <div className="space-y-8">
      {detailRule.previousRuleCode && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            Thay thế từ quy định trước đó: <strong className="font-semibold">{detailRule.previousRuleCode}</strong>
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl">
        <div className="border-b border-[#F1F5F9] pb-2 mb-4">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            THÔNG TIN QUY ĐỊNH
          </h4>
        </div>

        <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 sm:gap-y-7">
          <InfoItem
            label="Tên quy định"
            value={rule.name}
          />

          <InfoItem
            label="Mã quy định"
            value={rule.ruleCode}
            isHighlight
          />

          <InfoItem
            label="Mức độ vi phạm"
            value={PENALTY_RULE_SEVERITY_LABELS[rule.severityLevel] || rule.severityLevel}
          />

          <InfoItem
            label="Đối tượng áp dụng"
            value={getRuleAudienceLabel(rule)}
          />

          <InfoItem
            label="Số tiền phạt"
            value={getRuleFineLabel(rule)}
            isHighlight
          />

          <InfoItem
            label="Ngày hiệu lực"
            value={formatDate(rule.effectiveDate || (rule as any).effectiveFrom)}
          />

          <InfoItem
            label="Trạng thái"
            value={getPenaltyRuleStatusBadge(rule.status, rule.effectiveDate || (rule as any).effectiveFrom).label}
          />

          <InfoItem
            label="Vi phạm đã áp dụng"
            value={`${rule.violationsCount ?? 0} lần`}
          />

          <InfoItem
            label="Ngày tạo"
            value={formatDate(rule.createdDate)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl pt-2">
        <div className="border-b border-[#F1F5F9] pb-2 mb-4">
          <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
            MÔ TẢ QUY ĐỊNH
          </h4>
        </div>

        {hasDescription ? (
          <div className="px-5">
            <div className="text-[14px] text-[#202939] leading-relaxed whitespace-pre-line break-words">
              {rule.description}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12 sm:py-14">
            <img
              src="/images/empty-rating.svg"
              alt="Chưa có mô tả chi tiết"
              className="w-[104px] h-[121px] object-contain mb-4"
            />
            <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
              Chưa có mô tả chi tiết cho quy định này
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RuleDetailInfo;
