'use client';

import React from 'react';

interface EmployeeTabEmptyStateProps {
  message: string;
}

export function EmployeeTabEmptyState({ message }: EmployeeTabEmptyStateProps) {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-12 sm:py-16">
      <img
        src="/images/empty-rating.svg"
        alt={message}
        className="w-[104px] h-[121px] object-contain mb-4"
      />
      <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
        {message}
      </p>
    </div>
  );
}

