'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scan,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { employeeService } from '@/lib/api';
import type { EmployeeFaceDetail } from '@/types/employee';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/utils/media-url';

interface InitialEmployeeInfo {
  id: string;
  employeeCode: string;
  fullName: string;
  position: string;
  avatarUrl?: string | null;
}

interface EmployeeFaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmployee?: InitialEmployeeInfo | null;
  onSuccess?: (detail: EmployeeFaceDetail) => void;
}

type ModalStep = 'CODE_INPUT' | 'EXISTING_WARNING' | 'CAPTURE' | 'PREVIEW' | 'SUCCESS';
type CaptureSource = 'CAMERA' | 'FILE';

export function EmployeeFaceEnrollmentModal({
  isOpen,
  onClose,
  initialEmployee,
  onSuccess,
}: EmployeeFaceEnrollmentModalProps) {
  const [step, setStep] = useState<ModalStep>('CODE_INPUT');
  const [userCode, setUserCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [activeEmployee, setActiveEmployee] = useState<InitialEmployeeInfo | null>(null);
  const [faceDetail, setFaceDetail] = useState<EmployeeFaceDetail | null>(null);

  const [captureSource, setCaptureSource] = useState<CaptureSource>('CAMERA');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string>('face-capture.jpg');

  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Thiết bị hoặc trình duyệt không hỗ trợ truy cập camera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Quyền truy cập camera bị từ chối. Vui lòng cho phép quyền trong trình duyệt hoặc sử dụng tính năng tải ảnh.'
          : 'Không thể khởi động camera. Vui lòng kiểm tra lại thiết bị hoặc chuyển sang tải ảnh từ máy tính.';
      setCameraError(errorMsg);
      setCaptureSource('FILE');
    } finally {
      setCameraLoading(false);
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setCapturedBlob(null);
      setEnrollmentError(null);
      setCodeError(null);
      return;
    }

    if (initialEmployee) {
      setActiveEmployee(initialEmployee);
      setUserCode(initialEmployee.employeeCode);
      setIsValidatingCode(true);
      employeeService
        .getFaceDetail(initialEmployee.id)
        .then((res) => {
          if (res?.data) {
            setFaceDetail(res.data);
            if (res.data.hasFaceEnrolled) {
              setStep('EXISTING_WARNING');
            } else {
              setStep('CAPTURE');
            }
          } else {
            setStep('CAPTURE');
          }
        })
        .catch(() => {
          setStep('CAPTURE');
        })
        .finally(() => {
          setIsValidatingCode(false);
        });
    } else {
      setActiveEmployee(null);
      setFaceDetail(null);
      setUserCode('');
      setStep('CODE_INPUT');
    }
  }, [isOpen, initialEmployee, stopCameraStream]);

  useEffect(() => {
    if (isOpen && step === 'CAPTURE' && captureSource === 'CAMERA') {
      startCameraStream();
    } else {
      stopCameraStream();
    }
  }, [isOpen, step, captureSource, startCameraStream, stopCameraStream]);

  const handleValidateUserCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedCode = userCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCodeError('Vui lòng nhập mã người dùng.');
      return;
    }

    setIsValidatingCode(true);
    setCodeError(null);

    try {
      const res = await employeeService.getFaceDetailByCode(trimmedCode);
      if (res?.data) {
        const detail = res.data;
        setFaceDetail(detail);
        setActiveEmployee({
          id: detail.employeeId,
          employeeCode: detail.employeeCode,
          fullName: detail.fullName,
          position: detail.position,
        });

        if (detail.hasFaceEnrolled) {
          setStep('EXISTING_WARNING');
        } else {
          setStep('CAPTURE');
        }
      } else {
        setCodeError('Mã người dùng không tồn tại.');
      }
    } catch {
      setCodeError('Mã người dùng không tồn tại.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setPreviewUrl(url);
        setCapturedFileName(`face-${activeEmployee?.employeeCode || 'user'}-${Date.now()}.jpg`);
        setEnrollmentError(null);
        setStep('PREVIEW');
        stopCameraStream();
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validExtensions.includes(file.type)) {
      setEnrollmentError('Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEnrollmentError('Dung lượng tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setCapturedBlob(file);
    setPreviewUrl(url);
    setCapturedFileName(file.name);
    setEnrollmentError(null);
    setStep('PREVIEW');
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
    setEnrollmentError(null);
    setStep('CAPTURE');
  };

  const handleCompleteSubmit = async () => {
    if (!capturedBlob || !activeEmployee) {
      setEnrollmentError('Chưa có ảnh khuôn mặt để lưu.');
      return;
    }

    setIsSubmitting(true);
    setEnrollmentError(null);

    try {
      const res = await employeeService.registerFace(activeEmployee.id, capturedBlob);
      if (res?.data) {
        setFaceDetail(res.data);
        setStep('SUCCESS');
        if (onSuccess) {
          onSuccess(res.data);
        }
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setEnrollmentError('Thêm dữ liệu khuôn mặt không thành công. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      let errorMessage = 'Thêm dữ liệu khuôn mặt không thành công. Vui lòng thử lại.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { error?: { message?: string; code?: string } } };
        };
        const serverError = axiosErr.response?.data?.error;
        if (serverError?.message) {
          errorMessage = serverError.message;
        }
      }
      setEnrollmentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCameraStream();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
    setEnrollmentError(null);
    setCodeError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[580px] bg-white rounded-[14px] shadow-[0px_10px_40px_rgba(0,0,0,0.2)] border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#064343]/10 text-[#064343] flex items-center justify-center">
              <Scan className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#0A0A0A] leading-tight">
                Thêm dữ liệu khuôn mặt
              </h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Thiết lập nhận diện sinh trắc học Face++ cho hệ thống GymX
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0A0A0A] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 'CODE_INPUT' && (
            <form onSubmit={handleValidateUserCode} className="space-y-5">
              <div className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <span className="text-[12px] font-semibold text-[#064343] uppercase tracking-wider">
                  Bước 1: Định danh người dùng
                </span>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  Nhập mã nhân viên hoặc mã hội viên để kiểm tra tính hợp lệ và trạng thái dữ liệu
                  khuôn mặt trên hệ thống.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#202939] block">
                  Mã người dùng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userCode}
                    onChange={(e) => {
                      setUserCode(e.target.value.toUpperCase());
                      if (codeError) setCodeError(null);
                    }}
                    placeholder="VD: NV0028, NV0001..."
                    autoFocus
                    className={cn(
                      'w-full h-[46px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] font-medium tracking-wide uppercase transition-all outline-none',
                      codeError
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                    )}
                  />
                  {userCode && (
                    <button
                      type="button"
                      onClick={() => setUserCode('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0A0A0A]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {codeError && (
                  <div className="flex items-center gap-1.5 text-red-600 text-[13px] font-medium mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{codeError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-[40px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy (A-1)
                </button>
                <button
                  type="submit"
                  disabled={isValidatingCode || !userCode.trim()}
                  className="h-[40px] min-w-[110px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidatingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp tục</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'EXISTING_WARNING' && activeEmployee && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-[10px] bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[13px]">
                  <p className="font-semibold text-amber-900">Dữ liệu khuôn mặt đã tồn tại (E-2)</p>
                  <p className="text-amber-800 leading-relaxed">
                    Người dùng <span className="font-semibold">{activeEmployee.fullName}</span> (Mã:{' '}
                    <span className="font-semibold">{activeEmployee.employeeCode}</span>) đã có dữ
                    liệu sinh trắc học khuôn mặt đang hoạt động trên hệ thống.
                  </p>
                  {faceDetail?.enrolledAt && (
                    <p className="text-[12px] text-amber-700">
                      Đăng ký gần nhất:{' '}
                      {new Date(faceDetail.enrolledAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {activeEmployee.avatarUrl ? (
                    <Image
                      src={getMediaUrl(activeEmployee.avatarUrl)}
                      alt={activeEmployee.fullName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-bold text-slate-600 text-sm">
                      {activeEmployee.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-bold text-[#0A0A0A] truncate">
                    {activeEmployee.fullName}
                  </h4>
                  <p className="text-[12px] text-[#64748B]">
                    Mã: {activeEmployee.employeeCode} • Vị trí: {activeEmployee.position}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-medium shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Đã ghi nhận</span>
                </div>
              </div>

              <p className="text-[13px] text-[#525252] text-center">
                Bạn có muốn tiếp tục chụp lại để ghi đè và cập nhật khuôn mặt mới cho nhân viên này
                không?
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    if (initialEmployee) {
                      handleClose();
                    } else {
                      setStep('CODE_INPUT');
                    }
                  }}
                  className="h-[40px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy (Quay lại)
                </button>
                <button
                  type="button"
                  onClick={() => setStep('CAPTURE')}
                  className="h-[40px] min-w-[130px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tiếp tục thêm</span>
                </button>
              </div>
            </div>
          )}

          {step === 'CAPTURE' && activeEmployee && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#064343]/10 text-[#064343] flex items-center justify-center font-bold text-xs">
                    {activeEmployee.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0A0A0A] leading-tight">
                      {activeEmployee.fullName}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Mã: {activeEmployee.employeeCode} • {activeEmployee.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-[6px] border border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setCaptureSource('CAMERA')}
                    className={cn(
                      'px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1',
                      captureSource === 'CAMERA'
                        ? 'bg-[#064343] text-white'
                        : 'text-[#64748B] hover:text-[#0A0A0A]'
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Máy ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setCaptureSource('FILE');
                    }}
                    className={cn(
                      'px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1',
                      captureSource === 'FILE'
                        ? 'bg-[#064343] text-white'
                        : 'text-[#64748B] hover:text-[#0A0A0A]'
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải tệp</span>
                  </button>
                </div>
              </div>

              {captureSource === 'CAMERA' ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-4/3 bg-black rounded-[10px] overflow-hidden flex items-center justify-center border border-[#E2E8F0]">
                    {cameraLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-white z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
                        <span className="text-[13px]">Đang khởi động camera...</span>
                      </div>
                    )}

                    {cameraError ? (
                      <div className="p-6 text-center space-y-3 text-white max-w-[380px] z-20">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-[13px] text-slate-300">{cameraError}</p>
                        <button
                          type="button"
                          onClick={() => setCaptureSource('FILE')}
                          className="h-[36px] px-4 bg-white text-[#0A0A0A] text-[13px] font-medium rounded-[6px] hover:bg-slate-100"
                        >
                          Chuyển sang tải ảnh từ máy tính
                        </button>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover mirror -scale-x-100"
                        />
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                          <div className="w-[180px] h-[240px] sm:w-[220px] sm:h-[290px] border-2 border-dashed border-[#10B981]/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] transition-all animate-pulse" />
                          <span className="mt-3 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                            Căn chỉnh khuôn mặt vào giữa khung
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={startCameraStream}
                      disabled={cameraLoading}
                      className="text-[12px] text-[#64748B] hover:text-[#064343] flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Làm mới camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      disabled={cameraLoading || !!cameraError}
                      className="h-[44px] px-6 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium rounded-[8px] shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Chụp ảnh ngay</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-4/3 rounded-[10px] border-2 border-dashed border-[#CDD5DF] hover:border-[#064343] bg-[#F8FAFC] hover:bg-slate-50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center text-[#64748B] group-hover:text-[#064343] transition-colors mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-[14px] font-medium text-[#0A0A0A]">
                      Nhấp để chọn ảnh khuôn mặt
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-1 max-w-[280px]">
                      Hỗ trợ định dạng JPG, PNG, WEBP. Dung lượng tối đa 5MB. Ảnh rõ nét, chụp thẳng,
                      đủ ánh sáng.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {enrollmentError && (
                <div className="p-3.5 rounded-[8px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-[13px] text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Không thể xử lý khuôn mặt</p>
                    <p className="text-red-800">{enrollmentError}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-[40px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy (A-1)
                </button>
              </div>
            </div>
          )}

          {step === 'PREVIEW' && previewUrl && activeEmployee && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-[#0A0A0A]">
                    Xem trước ảnh khuôn mặt vừa chụp
                  </h4>
                  <p className="text-[12px] text-[#64748B]">
                    Tệp: {capturedFileName} ({Math.round((capturedBlob?.size || 0) / 1024)} KB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isSubmitting}
                  className="text-[13px] text-[#064343] hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Chụp lại</span>
                </button>
              </div>

              <div className="relative w-full aspect-4/3 bg-slate-900 rounded-[10px] overflow-hidden border border-[#E2E8F0] flex items-center justify-center">
                <Image
                  src={previewUrl}
                  alt="Ảnh khuôn mặt đã chụp"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              {enrollmentError && (
                <div className="p-3.5 rounded-[8px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-[13px] text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-red-900">
                      Thêm dữ liệu khuôn mặt không thành công (E-3)
                    </p>
                    <p className="text-red-800">{enrollmentError}</p>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-[6px] text-[12px] font-medium transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Thử lại (E-3.1)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isSubmitting}
                  className="h-[40px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Chụp lại
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSubmit}
                  disabled={isSubmitting}
                  className="h-[40px] min-w-[130px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hoàn tất (Bước 7)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && activeEmployee && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[18px] font-bold text-[#0A0A0A]">
                  Đăng ký khuôn mặt thành công!
                </h4>
                <p className="text-[13px] text-[#64748B] max-w-[360px] mx-auto">
                  Dữ liệu sinh trắc học của{' '}
                  <span className="font-semibold text-[#0A0A0A]">{activeEmployee.fullName}</span> (Mã:{' '}
                  {activeEmployee.employeeCode}) đã được đồng bộ với Face++ và sẵn sàng cho điểm
                  danh tự động.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-[38px] px-6 bg-[#064343] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#053737] transition-colors"
                >
                  Đóng & Quay lại (Bước 8)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeFaceEnrollmentModal;
