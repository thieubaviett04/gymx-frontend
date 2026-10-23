'use client';

import * as React from 'react';
import { X, AlertCircle, CheckCircle2, HelpCircle, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/* ─────────────────────────────────────────────────────────────────────────────
 * Base Modal / Dialog Component (Theo chuẩn Figma Node 51:376)
 * ────────────────────────────────────────────────────────────────────────── */

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'max-w-[380px]',
  md: 'max-w-[440px]',
  lg: 'max-w-[540px]',
  xl: 'max-w-[640px]',
};

export function Dialog({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  size = 'md',
}: DialogProps) {
  // Đóng dialog khi bấm phím Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full bg-white rounded-xl border border-[#E5E5E5]',
          'shadow-[0px_4px_10px_0px_rgba(255,136,51,0.08),0_20px_25px_-5px_rgba(0,0,0,0.1)]',
          'flex flex-col overflow-hidden transition-all duration-200 transform animate-in zoom-in-95',
          sizeClasses[size],
          className
        )}
      >
        {showCloseButton && (
          <div className="flex items-center justify-end px-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#99A1AF] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Sub-components: Header, Content, Footer
 * ────────────────────────────────────────────────────────────────────────── */

export function DialogHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 pt-2 pb-0 flex flex-col items-center', className)}>
      {children}
    </div>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 py-4 flex flex-col items-center text-center gap-5', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 pb-6 pt-2 flex items-center justify-center gap-3', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'font-sans font-semibold text-[20px] leading-7 tracking-[-0.005em] text-[#0A0A0A] text-center',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'font-sans font-normal text-[15px] sm:text-[16px] leading-7 text-[#525252] text-center',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ConfirmDialog – Component chuyên biệt cho xác nhận:
 * Log out (51:401), Delete (51:375), Complete (51:556)
 * ────────────────────────────────────────────────────────────────────────── */

export type ConfirmType = 'danger' | 'success' | 'warning' | 'primary';
export type ConfirmState = 'logout' | 'delete' | 'complete' | 'custom';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  type?: ConfirmType;
  state?: ConfirmState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  description?: React.ReactNode;
  highlightText?: string;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  state = 'custom',
  size = 'md',
  title,
  description,
  highlightText,
  cancelText = 'Không',
  confirmText,
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  // Tự động phân giải type theo state Figma 51:376
  const resolvedType: ConfirmType =
    type || (state === 'complete' ? 'success' : state === 'logout' || state === 'delete' ? 'danger' : 'primary');

  // Cấu hình mặc định cho từng state theo Figma Pop Up 51:376
  let defaultTitle = title;
  let defaultDescription = description;
  let defaultConfirmText = confirmText;

  if (state === 'logout') {
    defaultTitle = title || 'Đăng xuất';
    defaultDescription = description || 'Bạn có chắc chắn muốn đăng xuất không?';
    defaultConfirmText = confirmText || 'Đăng xuất';
  } else if (state === 'delete') {
    defaultTitle = title || 'Xác nhận xóa hội viên';
    defaultDescription =
      description ||
      (highlightText ? (
        <>
          Bạn có chắc chắn muốn xóa hội viên{' '}
          <span className="text-[#FF6B00] font-semibold">{highlightText}</span> không?
        </>
      ) : (
        'Bạn có chắc chắn muốn xóa hội viên này không?'
      ));
    defaultConfirmText = confirmText || 'Có, tôi đồng ý';
  } else if (state === 'complete') {
    defaultTitle = title || 'Xác nhận hoàn thành buổi tập';
    defaultDescription = description || 'Bạn có chắc chắn muốn hoàn thành buổi tập hôm nay?';
    defaultConfirmText = confirmText || 'Có, tôi đồng ý';
  } else {
    defaultTitle = title || 'Xác nhận hành động';
    defaultDescription = description || 'Bạn có chắc chắn muốn tiếp tục không?';
    defaultConfirmText = confirmText || 'Đồng ý';
  }

  // Render Icon minh họa 72x72px cân đối, gọn gàng
  const renderIllustration = () => {
    if (icon) return icon;

    if (state === 'logout') {
      return (
        <div className="w-[72px] h-[72px] rounded-full bg-[#FFF5F5] border border-[#FEE2E2] flex items-center justify-center text-[#EF4444] shadow-none">
          <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">
            <LogOut className="w-6 h-6 text-[#EF4444]" />
          </div>
        </div>
      );
    }

    if (state === 'delete' || resolvedType === 'danger') {
      return (
        <div className="w-[72px] h-[72px] rounded-full bg-[#FFF5F5] border border-[#FEE2E2] flex items-center justify-center text-[#EF4444] shadow-none">
          <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-[#EF4444]" />
          </div>
        </div>
      );
    }

    if (state === 'complete' || resolvedType === 'success') {
      return (
        <div className="w-[72px] h-[72px] rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#22C55E] shadow-none">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
          </div>
        </div>
      );
    }

    if (resolvedType === 'warning') {
      return (
        <div className="w-[72px] h-[72px] rounded-full bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shadow-none">
          <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-[72px] h-[72px] rounded-full bg-[#FFF4EC] border border-[#FFD8BF] flex items-center justify-center text-[#FF6B00] shadow-none">
        <div className="w-12 h-12 rounded-full bg-[#FFE7D6] flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-[#FF6B00]" />
        </div>
      </div>
    );
  };

  const getConfirmButtonClasses = () => {
    if (resolvedType === 'danger') {
      return 'bg-[#EF4444] hover:bg-red-600 text-white border-transparent';
    }
    if (resolvedType === 'success') {
      return 'bg-[#22C55E] hover:bg-green-600 text-white border-transparent';
    }
    if (resolvedType === 'warning') {
      return 'bg-[#F59E0B] hover:bg-amber-600 text-white border-transparent';
    }
    return 'bg-[#FF6B00] hover:bg-[#FF8833] text-white border-transparent';
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size={size}>
      <DialogContent className="pt-0 pb-1 gap-3.5">
        {/* Hình minh họa 72x72px */}
        <div className="mb-0.5">{renderIllustration()}</div>

        {/* Tiêu đề & Mô tả */}
        <div className="space-y-1.5 max-w-[360px]">
          <h3 className="font-sans font-semibold text-[18px] sm:text-[19px] leading-6 tracking-[-0.005em] text-[#0A0A0A]">
            {defaultTitle}
          </h3>

          <div className="font-sans font-normal text-[14px] sm:text-[15px] leading-6 text-[#525252]">
            {defaultDescription}
          </div>
        </div>
      </DialogContent>

      {/* Footer: 2 Buttons "Không" & "Xác nhận" */}
      <DialogFooter className="gap-3 pb-6 pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="min-w-[80px] h-10 px-4 rounded-lg border border-[#E5E5E5] bg-white text-sm font-normal text-[#525252] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all cursor-pointer disabled:opacity-50"
        >
          {cancelText}
        </button>

        <Button
          type="button"
          isLoading={isLoading}
          disabled={isLoading}
          onClick={onConfirm}
          className={cn(
            'min-w-[110px] h-10 px-4 rounded-lg text-sm font-medium shadow-none cursor-pointer transition-all',
            getConfirmButtonClasses()
          )}
        >
          {defaultConfirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
