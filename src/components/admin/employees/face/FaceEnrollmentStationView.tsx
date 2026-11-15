'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FolderOpenIcon,
  Check,
} from 'lucide-react';
import {
  Badge,
  Alert,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { EmptySearchState } from '@/components/shared';
import employeeService from '@/lib/api/modules/employeeService';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { getMediaUrl } from '@/lib/utils/media-url';
import type { EmployeeSummary } from '@/types/employee';

function formatPosition(pos: string): string {
  const upper = (pos || '').toUpperCase().trim();
  switch (upper) {
    case 'TRAINER':
      return 'Trainer';
    case 'RECEPTIONIST':
      return 'Lễ tân';
    case 'ADMIN':
      return 'Quản trị viên';
    case 'MANAGER':
      return 'Quản lý';
    case 'STAFF':
      return 'Tạp vụ';
    default:
      return pos || 'Nhân viên';
  }
}

function FaceEnrollmentStationContent() {
  const searchParams = useSearchParams();
  const urlEmployeeId = searchParams.get('employeeId') || searchParams.get('id');
  const urlEmployeeCode = searchParams.get('employeeCode') || searchParams.get('code');

  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);

  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgress, setSubmitProgress] = useState<number>(0);
  const submitProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialAutoSelectedRef = useRef<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (submitProgressTimerRef.current) {
        clearInterval(submitProgressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
      setPageIndex(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => {
    if (submitError || submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitError(null);
        setSubmitSuccess(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [submitError, submitSuccess]);

  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true);
    try {
      const res = await employeeService.list({
        search: search.trim() || undefined,
        pageIndex: 1,
        pageSize: 150,
      });
      if (res?.data?.items) {
        setEmployees(res.data.items);
      }
    } catch {
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees;
  const totalCount = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedEmployees = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, pageIndex, pageSize]);

  useEffect(() => {
    if (!employees.length || selectedEmployee || hasInitialAutoSelectedRef.current) return;

    if (urlEmployeeId) {
      const matched = employees.find((e) => e.id.toLowerCase() === urlEmployeeId.toLowerCase());
      if (matched) {
        hasInitialAutoSelectedRef.current = true;
        setSelectedEmployee(matched);
        return;
      }
    }

    if (urlEmployeeCode) {
      const matched = employees.find(
        (e) => e.employeeCode.toLowerCase() === urlEmployeeCode.toLowerCase()
      );
      if (matched) {
        hasInitialAutoSelectedRef.current = true;
        setSelectedEmployee(matched);
        return;
      }
    }
  }, [employees, urlEmployeeId, urlEmployeeCode, selectedEmployee]);

  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const captureFrameBlob = useCallback((): Blob | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let blobResult: Blob | null = null;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    blobResult = new Blob([u8arr], { type: mime });
    return blobResult;
  }, []);

  const stopAutoScan = useCallback(() => {
    if (autoScanTimerRef.current) {
      clearTimeout(autoScanTimerRef.current);
      autoScanTimerRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setScanProgress(0);
  }, []);

  const triggerAutoScan = useCallback(() => {
    stopAutoScan();
    setIsScanning(true);
    setScanProgress(0);

    const startTime = Date.now();
    const duration = 2200;

    scanIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(progress);
    }, 40);

    autoScanTimerRef.current = setTimeout(() => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      setIsScanning(false);
      setScanProgress(100);

      const blob = captureFrameBlob();
      if (blob) {
        setCapturedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setSubmitError(null);
        playSuccessChime();
      }
    }, duration);
  }, [stopAutoScan, captureFrameBlob, playSuccessChime]);

  const stopCameraStream = useCallback(() => {
    stopAutoScan();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopAutoScan]);

  const startCameraStream = useCallback(async () => {
    if (streamRef.current && streamRef.current.getTracks().some((t) => t.readyState === 'live')) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      setCameraLoading(false);
      setCameraError(null);
      triggerAutoScan();
      return;
    }

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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraLoading(false);
          triggerAutoScan();
        };
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
      const msg = isNotAllowed
        ? 'Quyền truy cập camera bị từ chối. Vui lòng cho phép quyền trong trình duyệt.'
        : 'Không thể khởi động camera. Vui lòng kiểm tra lại thiết bị.';
      setCameraError(msg);
      setCameraLoading(false);
    }
  }, [triggerAutoScan]);

  useEffect(() => {
    if (selectedEmployee && !previewUrl) {
      startCameraStream();
    } else if (!selectedEmployee) {
      stopCameraStream();
    }
  }, [selectedEmployee, previewUrl, startCameraStream, stopCameraStream]);

  useEffect(() => {
    return () => {
      stopAutoScan();
      stopCameraStream();
    };
  }, [stopAutoScan, stopCameraStream]);

  const handleToggleEmployee = (emp: EmployeeSummary) => {
    stopAutoScan();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee(null);
      stopCameraStream();
    } else {
      setSelectedEmployee(emp);
      if (streamRef.current && videoRef.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        videoRef.current.play().catch(() => {});
        triggerAutoScan();
      } else {
        startCameraStream();
      }
    }
  };

  const handleRetake = () => {
    stopAutoScan();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
      triggerAutoScan();
    } else {
      startCameraStream();
    }
  };

  const executeEnrollment = async (blob: Blob, targetEmployee: EmployeeSummary) => {
    setIsSubmitting(true);
    setSubmitProgress(15);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (submitProgressTimerRef.current) {
      clearInterval(submitProgressTimerRef.current);
    }

    submitProgressTimerRef.current = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev >= 92) return prev;
        const inc = Math.floor(Math.random() * 8) + 3;
        return Math.min(92, prev + inc);
      });
    }, 120);

    try {
      const res = await employeeService.registerFace(targetEmployee.id, blob);
      if (submitProgressTimerRef.current) {
        clearInterval(submitProgressTimerRef.current);
      }
      setSubmitProgress(100);

      if (res?.data) {
        setSubmitSuccess(`Đã lưu thành công dữ liệu khuôn mặt cho ${targetEmployee.fullName}!`);
        playSuccessChime();

        setEmployees((prevList) =>
          prevList.map((emp) =>
            emp.id === targetEmployee.id ? { ...emp, hasFaceEnrolled: true } : emp
          )
        );

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setCapturedBlob(null);
        setSelectedEmployee(null);
        stopCameraStream();
        stopAutoScan();
        setScanProgress(0);

        fetchEmployees();
      }
    } catch (err: unknown) {
      if (submitProgressTimerRef.current) {
        clearInterval(submitProgressTimerRef.current);
      }
      setSubmitProgress(0);
      const msg = getErrorMessage(err) || 'Đăng ký khuôn mặt thất bại. Vui lòng thử lại.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {(submitError || submitSuccess) && (
        <div className="fixed top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] w-auto max-w-[92vw] md:max-w-[680px] pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200 px-4">
          <Alert
            size="sm"
            variant={submitSuccess ? 'success' : 'danger'}
            onClose={() => {
              setSubmitError(null);
              setSubmitSuccess(null);
            }}
            className="w-auto min-w-[320px] max-w-[92vw] md:max-w-[680px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white pr-3"
          >
            <p className="text-[13px] font-normal !font-normal text-[#202939] leading-snug break-words">
              {submitError || submitSuccess}
            </p>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1">
        <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col min-h-[740px] lg:min-h-[780px]">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Chọn nhân viên
            </h2>
            <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
              Chọn nhân viên để thu thập dữ liệu sinh trắc học
            </p>
          </div>

          <div className="relative w-full mt-4">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo mã NV, họ tên, số điện thoại..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-[40px] pl-10 pr-8 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0A0A0A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0A0A0A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[460px] overflow-y-auto mt-4 overflow-x-auto">
            {isLoadingEmployees ? (
              <div className="py-16 text-center text-[#64748B]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#064343]" />
                <span className="text-[13px]">Đang tải danh sách nhân viên...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-8 flex items-center justify-center">
                <EmptySearchState
                  title="Không tìm thấy nhân viên"
                  message="Vui lòng thử lại với từ khóa tìm kiếm khác."
                  onClearFilter={localSearch ? () => setLocalSearch('') : undefined}
                  className="min-h-0"
                />
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-[4px] table-fixed">
                <thead>
                  <tr className="bg-white">
                    <th className="py-2.5 px-1 text-[13px] font-medium leading-[17px] text-[#0A0A0A] select-none whitespace-nowrap w-[38px] min-w-[38px] max-w-[38px] text-center">
                      <span className="sr-only">Chọn</span>
                    </th>
                    <th className="py-2.5 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-left select-none whitespace-nowrap relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[14px] before:bg-[#CDD5DF] after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[14px] after:bg-[#CDD5DF] w-[80px] min-w-[80px] max-w-[80px]">
                      Mã NV
                    </th>
                    <th className="py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-left select-none whitespace-nowrap relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[14px] after:bg-[#CDD5DF]">
                      Tên nhân viên
                    </th>
                    <th className="py-2.5 px-2.5 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-left select-none whitespace-nowrap relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[14px] after:bg-[#CDD5DF] w-[95px] min-w-[95px] max-w-[95px]">
                      Vai trò
                    </th>
                    <th className="py-2.5 px-2 text-[13px] font-medium leading-[17px] text-[#0A0A0A] text-center select-none whitespace-nowrap w-[95px] min-w-[95px] max-w-[95px]">
                      FaceID
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {paginatedEmployees.map((emp) => {
                    const isSelected = selectedEmployee?.id === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => handleToggleEmployee(emp)}
                        className={`transition-colors cursor-pointer h-[42px] ${
                          isSelected
                            ? 'bg-[#064343]/15 ring-1.5 ring-[#064343] font-semibold text-[#064343]'
                            : 'bg-[#F0F5F5] hover:bg-[#E3EDED] text-[#202939]'
                        }`}
                      >
                        <td className="h-[42px] px-1 py-0 align-middle text-center rounded-l-[6px]">
                          <div
                            className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors mx-auto pointer-events-none ${
                              isSelected
                                ? 'bg-[#064343] border-[#064343] text-white shadow-xs'
                                : 'bg-white border-[#D0D5DD]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                        </td>
                        <td className="h-[42px] px-2.5 py-0 align-middle text-[13px] text-[#064343] font-normal truncate">
                          {emp.employeeCode}
                        </td>
                        <td className="h-[42px] px-3 py-0 align-middle text-[13px] text-[#202939] font-normal truncate">
                          {emp.fullName}
                        </td>
                        <td className="h-[42px] px-2.5 py-0 align-middle text-[13px] text-[#202939] font-normal truncate">
                          {formatPosition(emp.position)}
                        </td>
                        <td className="h-[42px] px-2 py-0 align-middle text-center rounded-r-[6px]">
                          <Badge
                            variant={emp.hasFaceEnrolled ? 'active' : 'inactive'}
                            className="text-[12px] px-2.5 py-0.5 font-normal shrink-0"
                          >
                            {emp.hasFaceEnrolled ? 'Đã có' : 'Chưa có'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalCount > 0 && (
            <div className="pt-3 pb-1 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#64748B] mt-auto">
              <div className="flex items-center gap-2 text-[#2F3D50] text-[13px]">
                <span>Hiển thị</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setPageIndex(1);
                  }}
                >
                  <SelectTrigger className="w-[82px] h-[34px] px-2.5 bg-white border border-[#D0D5DD] rounded-[8px] text-[13px] font-normal text-[#2F3D50] shadow-2xs hover:border-[#CBD5E1] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] data-[state=open]:border-[#064343] data-[state=open]:ring-1 data-[state=open]:ring-[#064343] cursor-pointer [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-[#064343] [&>svg]:stroke-[2.2]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[82px]">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>
                  trong tổng <strong className="font-semibold text-[#0F172A]">{totalCount}</strong> bản ghi
                </span>
              </div>

              <div className="inline-flex items-center -space-x-[1px]">
                <button
                  type="button"
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-l-[8px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4 text-[#2F3D50]" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageIndex) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="w-8 h-8 flex items-center justify-center border border-[#CDD5DF] bg-white text-[#64748B] text-[12px]">
                            ...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPageIndex(p)}
                          className={`w-8 h-8 flex items-center justify-center border border-[#CDD5DF] text-[13px] font-medium transition-colors cursor-pointer ${
                            pageIndex === p
                              ? 'bg-[#064343] text-white border-[#064343] z-10'
                              : 'bg-white text-[#2F3D50] hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={pageIndex >= totalPages}
                  onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-r-[8px] border border-[#CDD5DF] bg-white text-[#2F3D50] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Trang tiếp"
                >
                  <ChevronRight className="w-4 h-4 text-[#2F3D50]" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col min-h-[740px] lg:min-h-[780px]">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                Quét khuôn mặt
              </h2>
              {selectedEmployee ? (
                <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                  Đang chọn:{' '}
                  <strong className="font-semibold text-[#064343]">
                    {selectedEmployee.fullName}
                  </strong>
                  <span className="text-[#64748B] ml-1">({selectedEmployee.employeeCode})</span>
                </p>
              ) : (
                <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                  Chưa chọn nhân viên để bật máy ảnh
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto shrink-0 -mt-1">
              <button
                type="button"
                onClick={handleRetake}
                disabled={!selectedEmployee || cameraLoading || isSubmitting}
                className="h-[38px] px-4 min-w-[76px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] enabled:hover:bg-slate-50 transition-colors flex items-center justify-center enabled:cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Quét lại</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (capturedBlob && selectedEmployee) {
                    executeEnrollment(capturedBlob, selectedEmployee);
                  }
                }}
                disabled={!capturedBlob || !selectedEmployee || isSubmitting}
                className="h-[38px] px-4 min-w-[110px] bg-[#064343] enabled:hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors flex items-center justify-center gap-1.5 enabled:cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <FolderOpenIcon className="w-4 h-4 text-white" />
                    <span>Lưu khuôn mặt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="my-auto flex-1 flex flex-col items-center justify-center py-4 w-full">
            {!selectedEmployee ? (
              <div className="w-full max-w-[540px] h-[440px] sm:h-[480px] rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center shadow-2xs">
                <div className="w-[48px] h-[48px] flex items-center justify-center text-[#064343] mb-3">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M1.625 44.8125C2.52244 44.8125 3.25 45.5401 3.25 46.4375V53.625C3.25 57.5537 6.44631 60.75 10.375 60.75H17.5625C18.4599 60.75 19.1875 61.4776 19.1875 62.375C19.1875 63.2724 18.4599 64 17.5625 64H10.375C4.65425 64 0 59.3457 0 53.625V46.4375C0 45.5401 0.727562 44.8125 1.625 44.8125ZM62.375 44.8125C63.2724 44.8125 64 45.5401 64 46.4375V53.625C64 59.3457 59.3457 64 53.625 64H46.4375C45.5401 64 44.8125 63.2724 44.8125 62.375C44.8125 61.4776 45.5401 60.75 46.4375 60.75H53.625C57.5537 60.75 60.75 57.5537 60.75 53.625V46.4375C60.75 45.5401 61.4776 44.8125 62.375 44.8125ZM40.9238 44.8232C41.6085 44.1909 42.6762 44.2333 43.3086 44.918C43.9408 45.6026 43.8984 46.6694 43.2139 47.3018C40.1523 50.1296 36.1701 51.6875 32 51.6875C27.8298 51.6875 23.8467 50.1296 20.7852 47.3018C20.1009 46.6693 20.0592 45.6025 20.6914 44.918C21.3238 44.2334 22.3904 44.191 23.0752 44.8232C25.5113 47.0735 28.6812 48.3125 32 48.3125C35.3186 48.3125 38.4878 47.0733 40.9238 44.8232ZM33.6875 22.4375C34.6195 22.4375 35.375 23.193 35.375 24.125V36.125C35.375 38.5029 33.4404 40.4375 31.0625 40.4375H29.6875C28.7555 40.4375 28 39.682 28 38.75C28 37.818 28.7555 37.0625 29.6875 37.0625H31.0625C31.5794 37.0625 32 36.6419 32 36.125V24.125C32 23.193 32.7555 22.4375 33.6875 22.4375ZM18.9688 22.4375C19.8489 22.4375 20.5625 23.1511 20.5625 24.0312V28.8438C20.5625 29.7239 19.8489 30.4375 18.9688 30.4375C18.0886 30.4375 17.375 29.7239 17.375 28.8438V24.0312C17.375 23.1511 18.0886 22.4375 18.9688 22.4375ZM45.4062 22.4375C46.2864 22.4375 47 23.1511 47 24.0312V28.8438C47 29.7239 46.2864 30.4375 45.4062 30.4375C44.5261 30.4375 43.8125 29.7239 43.8125 28.8438V24.0312C43.8125 23.1511 44.5261 22.4375 45.4062 22.4375ZM17.5625 0C18.4599 0 19.1875 0.727562 19.1875 1.625C19.1875 2.52244 18.4599 3.25 17.5625 3.25H10.375C6.44631 3.25 3.25 6.44625 3.25 10.375V17.5625C3.25 18.4599 2.52244 19.1875 1.625 19.1875C0.727562 19.1875 0 18.4599 0 17.5625V10.375C0 4.65419 4.65425 0 10.375 0H17.5625ZM53.625 0C59.3457 0 64 4.65419 64 10.375V17.5625C64 18.4599 63.2724 19.1875 62.375 19.1875C61.4776 19.1875 60.75 18.4599 60.75 17.5625V10.375C60.75 6.44625 57.5537 3.25 53.625 3.25H46.4375C45.5401 3.25 44.8125 2.52244 44.8125 1.625C44.8125 0.727562 45.5401 0 46.4375 0H53.625Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h4 className="text-[15px] font-semibold text-[#0A0A0A] leading-tight">Chưa chọn nhân viên</h4>
                <p className="text-[12px] text-[#64748B] mt-1 max-w-[240px] leading-relaxed">
                  Tích chọn nhân viên bên trái để bật máy ảnh
                </p>
              </div>
            ) : previewUrl ? (
              <div className="relative w-full max-w-[540px] h-[440px] sm:h-[480px] rounded-[12px] overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-xs">
                <Image
                  src={previewUrl}
                  alt="Face preview"
                  fill
                  className="object-contain"
                  unoptimized
                />

                {isSubmitting && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 px-6">
                    <span className="text-[16px] font-semibold text-white tracking-wide">
                      Đang phân tích...
                    </span>
                    <div className="w-56 sm:w-64 h-2 bg-white/20 rounded-full overflow-hidden mt-3 shadow-inner">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${submitProgress}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-slate-300 mt-2 font-medium">
                      {submitProgress}% • Vui lòng đợi giây lát
                    </span>
                  </div>
                )}

                {!isSubmitting && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-[6px] bg-black/70 backdrop-blur-xs text-white text-[12px] font-medium flex items-center gap-1.5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#06D7A0]" />
                    <span>Quét khuôn mặt hoàn tất</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-[540px] h-[440px] sm:h-[480px] rounded-[12px] overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-xs">
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                  onLoadedMetadata={() => {
                    videoRef.current?.play().catch(() => {});
                    setCameraLoading(false);
                    triggerAutoScan();
                  }}
                />

                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-slate-950/80 backdrop-blur-xs">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#10B981] mb-2" />
                    <p className="text-[13px] text-slate-300">Đang khởi động webcam...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center max-w-[360px] mx-auto z-20 bg-slate-950/95">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-[13px] text-white font-medium mb-3">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-[6px] text-[12px] transition-all cursor-pointer"
                    >
                      Thử kết nối lại
                    </button>
                  </div>
                )}

                {!cameraLoading && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                    <div className="relative w-[220px] h-[280px] sm:w-[245px] sm:h-[315px] rounded-[50%] border-2 border-[#10B981] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] transition-all flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 border-2 border-dashed border-[#10B981]/60 rounded-[50%] animate-spin duration-3000" />
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[#10B981]/25 transition-all duration-75"
                        style={{ height: `${scanProgress}%` }}
                      />
                      <div className="absolute top-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[#10B981] text-[10px] font-semibold tracking-wide border border-[#10B981]/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span>FaceID Scan {scanProgress}%</span>
                      </div>
                    </div>
                    <span className="mt-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        {isScanning
                          ? `Đang quét mẫu khuôn mặt (${scanProgress}%)... Vui lòng giữ thẳng mặt`
                          : 'Căn chỉnh khuôn mặt vào giữa khung'}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaceEnrollmentStationView() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex-1 flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#064343]" />
        </div>
      }
    >
      <FaceEnrollmentStationContent />
    </Suspense>
  );
}
