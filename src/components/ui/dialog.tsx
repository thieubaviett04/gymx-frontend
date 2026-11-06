'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  sm: 'max-w-[390px]',
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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full bg-white rounded-[12px] border border-[#E5E5E5]',
          'shadow-[0px_4px_24px_rgba(0,0,0,0.08)]',
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
              <X className="w-5 h-5 text-[#525252]" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
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
    <div className={cn('px-6 pt-2 pb-2 text-center', className)}>
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
        'font-sans font-semibold text-[20px] leading-7 tracking-[-0.005em] text-[#000000]',
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
        'font-sans font-normal text-[15px] leading-6 text-[#525252] mt-1.5',
        className
      )}
    >
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
    <div className={cn('px-6 py-2 flex flex-col items-center text-center', className)}>
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
    <div
      className={cn(
        'flex items-center justify-center gap-3 px-6 pt-4 pb-12',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Icon minh họa Figma Node 72:3812 (question 2) chuẩn xác 86x86px
 * ────────────────────────────────────────────────────────────────────────── */
function QuestionMarkIllustration({ className = 'text-[#EF4444]' }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 86 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-[64px] h-[64px] shrink-0', className)}
    >
      <path
        d="M42.832 67.3555C40.9765 67.3555 39.4727 65.8516 39.4727 63.9961C39.4727 62.1406 40.9765 60.6367 42.832 60.6367C44.6876 60.6367 46.1914 62.1406 46.1914 63.9961C46.1914 65.8516 44.6876 67.3555 42.832 67.3555ZM46.1914 52.2383V47.7274C52.6871 46.156 57.1875 40.2626 56.9309 33.5983C56.6521 26.3416 50.6983 20.441 43.3766 20.1667C39.4648 20.0185 35.7708 21.42 32.9783 24.1094C30.2337 26.753 28.7227 30.3 28.7227 34.0977C28.7227 35.9532 30.2265 37.457 32.082 37.457C33.9376 37.457 35.4414 35.9532 35.4414 34.0977C35.4414 32.1424 36.2215 30.3138 37.6388 28.949C39.1046 27.5377 41.0513 26.8035 43.1247 26.8802C46.9571 27.0246 50.0724 30.0887 50.2174 33.8569C50.3519 37.3685 47.9282 40.4713 44.4527 41.2337C41.5204 41.8774 39.4727 44.4113 39.4727 47.3967V52.2383C39.4727 54.0938 40.9765 55.5977 42.832 55.5977C44.6876 55.5977 46.1914 54.0938 46.1914 52.2383ZM65.2493 79.8029C66.8365 78.8416 67.3437 76.7762 66.3824 75.1896C65.4205 73.6025 63.3551 73.0953 61.7685 74.0565C56.1258 77.4743 49.6354 79.2812 43 79.2812C22.9947 79.2812 6.71875 63.0053 6.71875 43C6.71875 22.9947 22.9947 6.71875 43 6.71875C63.0053 6.71875 79.2812 22.9947 79.2812 43C79.2812 50.1538 77.1541 57.1166 73.1294 63.1372C72.098 64.6791 72.5126 66.7656 74.0545 67.797C75.5971 68.8285 77.6836 68.4138 78.7144 66.8712C83.4811 59.7424 86 51.4877 86 43C86 31.5145 81.5272 20.7159 73.4056 12.5944C65.2841 4.47282 54.4855 0 43 0C31.5145 0 20.7159 4.47282 12.5944 12.5944C4.47282 20.7159 0 31.5145 0 43C0 54.4855 4.47282 65.2841 12.5944 73.4056C20.7159 81.5272 50.863 86 43 86C50.863 86 58.5568 83.8571 65.2493 79.8029Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ConfirmDialog – Component chuyên biệt cho xác nhận theo chuẩn Figma #51:375
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
  singleButton?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  state = 'custom',
  size = 'sm',
  title,
  description,
  highlightText,
  cancelText = 'Không',
  confirmText,
  isLoading = false,
  icon,
  singleButton = false,
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
    defaultTitle = title || 'Xác nhận xóa';
    defaultDescription =
      description ||
      (highlightText ? (
        <span>
          Bạn có chắc muốn xóa{' '}
          <span className="text-[#064343] font-medium">&quot;{highlightText}&quot;</span> chứ?
        </span>
      ) : (
        'Bạn có chắc muốn xóa mục này chứ?'
      ));
    defaultConfirmText = confirmText || 'Có, tôi đồng ý';
  } else if (state === 'complete') {
    defaultTitle = title || 'Xác nhận hoàn thành';
    defaultDescription = description || 'Bạn có chắc chắn muốn hoàn thành buổi tập hôm nay?';
    defaultConfirmText = confirmText || 'Có, tôi đồng ý';
  } else {
    defaultTitle = title || 'Xác nhận hành động';
    defaultDescription = description || 'Bạn có chắc chắn muốn tiếp tục không?';
    defaultConfirmText = confirmText || 'Đồng ý';
  }

  // Render Icon minh họa 86x86px chuẩn Figma #72:3812
  const renderIllustration = () => {
    if (icon) return icon;

    if (state === 'delete' || state === 'logout' || resolvedType === 'danger') {
      return <QuestionMarkIllustration className="text-[#EF4444]" />;
    }

    if (state === 'complete' || resolvedType === 'success') {
      return <QuestionMarkIllustration className="text-[#22C55E]" />;
    }

    if (resolvedType === 'warning') {
      return <QuestionMarkIllustration className="text-[#F59E0B]" />;
    }

    return <QuestionMarkIllustration className="text-[#064343]" />;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size={size}>
      <DialogContent className="pt-0 pb-1 px-6 gap-3 flex flex-col items-center text-center">
        {/* Hình minh họa 86x86px chuẩn Figma #51:375 */}
        <div className="mb-1 flex justify-center">{renderIllustration()}</div>

        {/* Tiêu đề & Mô tả */}
        <div className="space-y-2 max-w-[320px] text-center">
          <h3 className="font-sans font-semibold text-[20px] leading-7 tracking-[-0.005em] text-[#000000]">
            {defaultTitle}
          </h3>

          <div className="font-sans font-normal text-[15px] leading-6 text-[#525252]">
            {defaultDescription}
          </div>
        </div>
      </DialogContent>

      {/* Footer: 2 Buttons chuẩn Figma #51:375 (Regular font, NO shadow, NO hover glow, kéo dài khoảng đệm dưới pb-[52px]) */}
      <DialogFooter className="gap-3 pb-[52px] pt-5 px-6 justify-center flex items-center">
        {!singleButton && (
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="min-w-[84px] h-[44px] px-4 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] font-normal text-[#525252] cursor-pointer disabled:opacity-50 shadow-none outline-none select-none transition-none"
          >
            {cancelText}
          </button>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          className={cn(
            'min-w-[128px] h-[44px] px-4 rounded-[8px] text-[14px] font-normal text-white cursor-pointer border-none outline-none shadow-none select-none transition-none flex items-center justify-center gap-2 disabled:opacity-60',
            resolvedType === 'danger'
              ? 'bg-[#EF4444]'
              : resolvedType === 'success'
              ? 'bg-[#22C55E]'
              : resolvedType === 'warning'
              ? 'bg-[#F59E0B]'
              : 'bg-[#064343]'
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
          {defaultConfirmText}
        </button>
      </DialogFooter>
    </Dialog>
  );
}
