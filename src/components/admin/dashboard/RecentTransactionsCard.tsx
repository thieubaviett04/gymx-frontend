'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TransactionItem {
  id: string;
  customerName: string;
  code: string;
  packageName: string;
  time: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  statusText: string;
}

const DEFAULT_TRANSACTIONS: TransactionItem[] = [
  {
    id: '1',
    customerName: 'Hoàng Anh Tuấn',
    code: 'HD-58812',
    packageName: 'VIP 1 Năm',
    time: '14:32',
    amount: '6.900.000 ₫',
    status: 'completed',
    statusText: 'Thành công',
  },
  {
    id: '2',
    customerName: 'Trịnh Mai Phương',
    code: 'HD-58811',
    packageName: 'Gym Pro',
    time: '13:58',
    amount: '650.000 ₫',
    status: 'completed',
    statusText: 'Thành công',
  },
  {
    id: '3',
    customerName: 'Lý Gia Huy',
    code: 'HD-58810',
    packageName: 'PT 1 kèm 1',
    time: '12:15',
    amount: '4.500.000 ₫',
    status: 'pending',
    statusText: 'Chờ xử lý',
  },
  {
    id: '4',
    customerName: 'Đỗ Khánh Vy',
    code: 'HD-58809',
    packageName: 'Day Pass',
    time: '11:40',
    amount: '80.000 ₫',
    status: 'completed',
    statusText: 'Thành công',
  },
  {
    id: '5',
    customerName: 'Cao Minh Đức',
    code: 'HD-58808',
    packageName: 'Gym Pro 3 tháng',
    time: '10:02',
    amount: '1.750.000 ₫',
    status: 'completed',
    statusText: 'Thành công',
  },
];

export function RecentTransactionsCard({
  transactions = DEFAULT_TRANSACTIONS,
}: {
  transactions?: TransactionItem[];
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#EDEDED] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-[#F8FAFC]">
        <h3 className="text-base font-semibold text-[#011010] font-heading">
          Giao dịch mới nhất
        </h3>
        <span className="text-xs text-[#64748B] font-medium">Hôm nay</span>
      </div>

      <div className="pt-2 divide-y divide-[#EDEDED]/70">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="py-3 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors"
          >
            {/* Left: Customer & Details */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#011010] truncate">
                {tx.customerName}
              </p>
              <p className="text-xs text-[#666666] truncate mt-0.5">
                {tx.code} · {tx.packageName} · {tx.time}
              </p>
            </div>

            {/* Right: Amount & Status Badge */}
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-[#011010] tracking-tight">
                {tx.amount}
              </p>
              <span
                className={cn(
                  'inline-block text-xs font-bold mt-0.5',
                  tx.status === 'completed'
                    ? 'text-[#059669]'
                    : tx.status === 'pending'
                    ? 'text-[#B45309]'
                    : 'text-[#DC2626]'
                )}
              >
                {tx.statusText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTransactionsCard;
