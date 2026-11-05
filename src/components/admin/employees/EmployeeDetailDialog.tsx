"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Calendar,
  FileText,
  Award,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditPencilIcon, FolderOpenIcon } from "@/components/ui/icons";
import { employeeService } from "@/lib/api";
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  Badge,
} from "@/components/ui";
import type { EmployeeDetail, UpdateEmployeePayload } from "@/types/employee";
import { SPECIALIZATION_OPTIONS } from "./CreateEmployeeForm";

interface EmployeeDetailDialogProps {
  isOpen: boolean;
  employee: EmployeeDetail | null;
  onClose: () => void;
  onEdit?: (emp: EmployeeDetail) => void;
}

/**
 * Format chức vụ sang nhãn hiển thị chuẩn
 */
function formatPosition(pos?: string | null): string {
  if (!pos) return "—";
  const upper = pos.toUpperCase().trim();
  switch (upper) {
    case "TRAINER":
      return "Huấn luyện viên";
    case "RECEPTIONIST":
      return "Lễ tân";
    case "ADMIN":
      return "Quản trị viên";
    case "MANAGER":
      return "Quản lý";
    case "STAFF":
      return "Tạp vụ / Nhân viên";
    default:
      return pos;
  }
}

/**
 * Format ngày DD/MM/YYYY chuẩn Figma
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format ngày giờ DD/MM/YYYY • HH:mm chuẩn Figma
 */
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} • ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format mức lương theo định dạng 9.500.000 ₫ chuẩn Figma
 */
function formatSalary(val?: number | null): string {
  if (val === undefined || val === null) return "—";
  return new Intl.NumberFormat("vi-VN").format(val) + " ₫";
}

/**
 * Component hiển thị cặp Label - Value chuẩn Typography Figma #1415:1955
 */
function InfoItem({
  label,
  value,
  isHighlight = false,
}: {
  label: string;
  value?: React.ReactNode;
  isHighlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <span
        className={`text-[14px] leading-relaxed break-words ${
          isHighlight
            ? "font-semibold text-[#064343]"
            : "font-medium text-[#011010]"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/**
 * EmployeeDetailDialog - Khung xem & sửa trực tiếp chi tiết nhân viên (Slide-over drawer chuẩn Figma #1415:1955)
 */
export function EmployeeDetailDialog({
  isOpen,
  employee: initialEmployee,
  onClose,
}: EmployeeDetailDialogProps) {
  const queryClient = useQueryClient();

  // Dữ liệu nhân viên hiển thị (cập nhật ngay khi sửa xong không cần reload trang)
  const [employee, setEmployee] = useState<EmployeeDetail | null>(initialEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "trainer" | "schedule" | "notes"
  >("general");

  // Form states phục vụ In-Place Edit
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [baseSalaryRate, setBaseSalaryRate] = useState<number | string>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("ACTIVE");

  // Trainer form states
  const [specializationId, setSpecializationId] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | string>("");
  const [pricePerSession, setPricePerSession] = useState<number | string>("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const resetFormFromEmployee = (emp: EmployeeDetail) => {
    setFullName(emp.fullName || "");
    setEmail(emp.email || "");
    setPosition((emp.position || "").toUpperCase());
    setPhoneNumber(emp.phoneNumber || "");
    setBaseSalaryRate(
      emp.baseSalaryRate !== undefined && emp.baseSalaryRate !== null
        ? emp.baseSalaryRate
        : ""
    );
    setDateOfBirth(emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "");
    setGender(emp.gender || "");
    setAddress(emp.address || "");
    setEmploymentStatus((emp.employmentStatus || "ACTIVE").toUpperCase());

    // Thông tin HLV
    setSpecializationId(emp.trainerInfo?.specializationId || "");
    setExperienceYears(
      emp.trainerInfo?.experienceYears !== undefined &&
        emp.trainerInfo?.experienceYears !== null
        ? emp.trainerInfo.experienceYears
        : ""
    );
    setPricePerSession(
      emp.trainerInfo?.pricePerSession !== undefined &&
        emp.trainerInfo?.pricePerSession !== null
        ? emp.trainerInfo.pricePerSession
        : ""
    );
    setDescription(emp.trainerInfo?.description || "");
  };

  // Đồng bộ hóa khi mở dialog hoặc khi `initialEmployee` thay đổi
  useEffect(() => {
    if (initialEmployee) {
      setEmployee(initialEmployee);
      resetFormFromEmployee(initialEmployee);
      setIsEditing(false);
      setErrors({});
      setToast(null);
      setActiveTab("general");
    }
  }, [initialEmployee, isOpen]);

  // Lắng nghe phím ESC để đóng drawer (chỉ đóng khi không bận pending)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isEditing, onClose]);

  // Mutation cập nhật nhân viên trực tiếp ngay trên Slide Panel
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateEmployeePayload) =>
      employeeService.update(employee!.id, payload),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      // Lấy dữ liệu chi tiết mới nhất để hiển thị lại ở chế độ View
      try {
        const fresh = await employeeService.byId(employee!.id);
        setEmployee(fresh.data);
        resetFormFromEmployee(fresh.data);
      } catch {}

      setToast({
        type: "success",
        message: res.message || "Cập nhật thông tin nhân viên thành công!",
      });
      setTimeout(() => setToast(null), 3000);
      setIsEditing(false);
      setErrors({});
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        const beErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.errors)) {
          const lowerKey = k.toLowerCase();
          const msg = Array.isArray(v) ? v[0] : String(v);
          if (lowerKey === "fullname") beErrors.fullName = msg;
          else if (lowerKey === "email") beErrors.email = msg;
          else if (lowerKey === "phonenumber") beErrors.phoneNumber = msg;
          else if (lowerKey === "position") beErrors.position = msg;
          else if (lowerKey === "basesalaryrate") beErrors.baseSalaryRate = msg;
          else if (lowerKey === "address") beErrors.address = msg;
          else if (lowerKey === "specializationid") beErrors.specializationId = msg;
          else if (lowerKey === "experienceyears") beErrors.experienceYears = msg;
          else if (lowerKey === "pricepersession") beErrors.pricePerSession = msg;
          else if (lowerKey === "salarycoefficient") beErrors.pricePerSession = msg;
        }
        setErrors(beErrors);
      }
      setToast({
        type: "error",
        message:
          data?.error?.description ||
          data?.message ||
          "Có lỗi xảy ra khi cập nhật nhân viên.",
      });
      setTimeout(() => setToast(null), 4000);
    },
  });

  const handleCancelEdit = () => {
    if (employee) {
      resetFormFromEmployee(employee);
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setToast(null);
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Họ tên không được để trống.";
    if (!email.trim()) newErrors.email = "Email không được để trống.";
    if (!position) newErrors.position = "Vui lòng chọn vai trò làm việc.";
    if (
      baseSalaryRate === "" ||
      isNaN(Number(baseSalaryRate)) ||
      Number(baseSalaryRate) < 0
    ) {
      newErrors.baseSalaryRate = "Mức lương cơ bản phải là số không âm.";
    }

    if (position === "TRAINER") {
      if (!specializationId)
        newErrors.specializationId = "Vui lòng chọn chuyên môn HLV.";
      if (
        experienceYears === "" ||
        isNaN(Number(experienceYears)) ||
        Number(experienceYears) <= 0
      ) {
        newErrors.experienceYears = "Năm kinh nghiệm của HLV phải lớn hơn 0.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload: UpdateEmployeePayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      position: position.toUpperCase(),
      baseSalaryRate: Number(baseSalaryRate),
      employmentStatus: employmentStatus.toUpperCase(),
      phoneNumber: phoneNumber.trim() || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
    };

    if (position === "TRAINER") {
      payload.specializationId = specializationId;
      payload.experienceYears = Number(experienceYears);
      payload.pricePerSession =
        pricePerSession !== "" ? Number(pricePerSession) : undefined;
      payload.description = description.trim() || undefined;
    }

    updateMutation.mutate(payload);
  };

  const isTrainer =
    (isEditing ? position : employee?.position)?.toUpperCase() === "TRAINER";

  useEffect(() => {
    if (!isTrainer && activeTab === "trainer") {
      setActiveTab("general");
    }
  }, [isTrainer, activeTab]);

  if (!isOpen || !employee) return null;

  const isActive =
    (employee.employmentStatus || "").toUpperCase() === "ACTIVE" ||
    (employee.employmentStatus || "").toUpperCase() === "HOAT_DONG";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết nhân viên"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={() => {
        if (!updateMutation.isPending) {
          if (isEditing) handleCancelEdit();
          else onClose();
        }
      }}
    >
      {/* Slide-over Container chuẩn kích thước 880px và hiệu ứng shadow Figma #1415:1955 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[880px] max-w-full bg-white h-full shadow-[-12px_0px_40px_0px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Toast thông báo tại chỗ khi lưu thành công / thất bại */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 w-auto max-w-[90%]">
            <Alert
              size="sm"
              variant={toast.type === "success" ? "success" : "danger"}
              onClose={() => setToast(null)}
              className="shadow-md border border-[#E5E5E5] bg-white py-2 px-3.5"
            >
              <p className="text-[13px] font-normal text-[#202939] leading-snug">
                {toast.message}
              </p>
            </Alert>
          </div>
        )}

        {/* 1. Header (#1415:1957) */}
        <div className="pt-6 pb-2 pr-6 pl-0 flex items-center justify-between shrink-0">
          {/* Thanh stroke 4px sát mép ngoài bên trái như thiết kế */}
          <div className="flex items-center h-[26px] border-l-[4px] border-[#064343] pl-5">
            <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEditing ? "Chỉnh sửa thông tin nhân viên" : "Chi tiết nhân viên"}
            </h2>
          </div>

          {/* Nút đóng tròn 32x32px */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleCancelEdit();
              else onClose();
            }}
            disabled={updateMutation.isPending}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Dòng thông tin Metadata Tóm tắt (#1415:1976 - Khoảng cách phân khối rõ ràng) */}
        <div className="px-6 mt-3.5 mb-2 flex items-center flex-wrap gap-x-5 gap-y-2 shrink-0 bg-white">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-[#64748B]">
              Mã nhân viên:
            </span>
            <span className="font-semibold text-[14px] text-[#064343]">
              {employee.employeeCode}
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-[#64748B]">
              Ngày tạo:
            </span>
            <span className="text-[14px] font-medium text-[#202939]">
              {formatDateTime(employee.createdDate)}
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-[#64748B]">
              Chức danh:
            </span>
            <span className="text-[14px] font-semibold text-[#064343]">
              {formatPosition(isEditing ? position : employee.position)}
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-[#64748B]">
              Trạng thái:
            </span>
            <Badge
              variant={
                (isEditing ? employmentStatus : employee.employmentStatus)?.toUpperCase() ===
                "ACTIVE"
                  ? "active"
                  : "discontinued"
              }
              className="text-[13px] font-normal leading-[18px] px-3 py-[4px] rounded-[6px]"
            >
              {(isEditing ? employmentStatus : employee.employmentStatus)?.toUpperCase() ===
              "ACTIVE"
                ? "Đang làm việc"
                : "Đã nghỉ việc"}
            </Badge>
          </div>
        </div>

        {/* Divider phân cách rõ ràng giữa Metadata bar và Tabs (#1415:2010) */}
        <div className="mx-6 h-[1px] bg-[#E2E8F0] my-4" />

        {/* 3. Hệ thống Tabs chuẩn Figma #1415:2011 */}
        <div className="px-6 pb-5 flex items-center gap-2 overflow-x-auto shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium"
            }`}
          >
            Thông tin chung
          </button>

          {isTrainer && (
            <button
              type="button"
              onClick={() => setActiveTab("trainer")}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer ${
                activeTab === "trainer"
                  ? "bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold"
                  : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium"
              }`}
            >
              Chuyên môn & Đánh giá
            </button>
          )}

          {!isEditing && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer ${
                  activeTab === "schedule"
                    ? "bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold"
                    : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium"
                }`}
              >
                Lịch sử
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold"
                    : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium"
                }`}
              >
                Ghi chú
              </button>
            </>
          )}
        </div>

        {/* 4. Nội dung chi tiết (View Mode vs. In-Place Edit Mode) */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8 space-y-8">
          {activeTab === "general" && (
            <>
              {/* KHỐI 1: THÔNG TIN CƠ BẢN (#1415:2021) */}
              <div className="bg-white">
                <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN CƠ BẢN
                  </h4>
                </div>

                {!isEditing ? (
                  // ── Chế độ XEM ĐỌC (View Mode) ──
                  <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    <InfoItem
                      label="Họ và tên nhân viên"
                      value={employee.fullName}
                    />
                    <InfoItem
                      label="Mã nhân viên"
                      value={employee.employeeCode}
                    />
                    <InfoItem
                      label="Giới tính"
                      value={
                        employee.gender === "NAM"
                          ? "Nam"
                          : employee.gender === "NU"
                          ? "Nữ"
                          : employee.gender === "KHAC"
                          ? "Khác"
                          : employee.gender || "—"
                      }
                    />
                    <InfoItem
                      label="Ngày sinh"
                      value={
                        employee.dateOfBirth
                          ? employee.dateOfBirth.split("T")[0]
                          : "—"
                      }
                    />
                    <InfoItem
                      label="Trạng thái"
                      value={isActive ? "Đang làm việc" : "Đã nghỉ việc"}
                    />
                    <InfoItem
                      label="Vai trò"
                      value={formatPosition(employee.position)}
                    />
                  </div>
                ) : (
                  // ── Chế độ SỬA TRỰC TIẾP (In-Place Edit Mode) ──
                  <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    {/* Họ và tên (*) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Họ và tên nhân viên <span className="text-[#EE0033]">*</span>
                      </label>
                      <div
                        className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all ${
                          errors.fullName
                            ? "border-red-400 bg-red-50/20"
                            : "border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]"
                        }`}
                      >
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            setErrors((p) => ({ ...p, fullName: "" }));
                          }}
                          placeholder="Nhập họ và tên"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Mã nhân viên (Khóa) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Mã nhân viên (Hệ thống)
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] text-[#202939] cursor-not-allowed">
                        {employee.employeeCode}
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Giới tính
                      </label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-[42px] w-full rounded-[8px] border-[#CDD5DF] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NAM">Nam</SelectItem>
                          <SelectItem value="NU">Nữ</SelectItem>
                          <SelectItem value="KHAC">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ngày sinh */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Ngày sinh
                      </label>
                      <DatePicker
                        value={dateOfBirth}
                        onChange={setDateOfBirth}
                        placeholder="Chọn ngày sinh"
                      />
                    </div>

                    {/* Trạng thái làm việc */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Trạng thái <span className="text-[#EE0033]">*</span>
                      </label>
                      <Select
                        value={employmentStatus}
                        onValueChange={setEmploymentStatus}
                      >
                        <SelectTrigger className="h-[42px] w-full rounded-[8px] border-[#CDD5DF] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Đang làm việc</SelectItem>
                          <SelectItem value="INACTIVE">Đã nghỉ việc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Vai trò (*) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Vai trò <span className="text-[#EE0033]">*</span>
                      </label>
                      <Select
                        value={position}
                        onValueChange={(val) => {
                          setPosition(val);
                          setErrors((p) => ({ ...p, position: "" }));
                        }}
                      >
                        <SelectTrigger
                          className={`h-[42px] w-full rounded-[8px] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                            errors.position ? "border-red-400 bg-red-50/20" : "border-[#CDD5DF]"
                          }`}
                        >
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                          <SelectItem value="TRAINER">Huấn luyện viên</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.position && (
                        <p className="text-xs text-red-500 mt-0.5">{errors.position}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 2: THÔNG TIN LIÊN LẠC & LƯƠNG (#1415:2059) */}
              <div className="bg-white">
                <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN LIÊN LẠC & LƯƠNG
                  </h4>
                </div>

                {!isEditing ? (
                  // ── Chế độ XEM ĐỌC ──
                  <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    <InfoItem
                      label="Số điện thoại di động"
                      value={employee.phoneNumber || "—"}
                    />
                    <InfoItem
                      label="Email công vụ"
                      value={employee.email || "—"}
                    />
                    <InfoItem
                      label="Địa chỉ thường trú"
                      value={employee.address || "—"}
                    />
                    <InfoItem
                      label="Số CCCD"
                      value={employee.nationalId || "—"}
                    />
                    <InfoItem
                      label="Mức lương cơ bản (VNĐ)"
                      value={formatSalary(employee.baseSalaryRate)}
                      isHighlight
                    />
                  </div>
                ) : (
                  // ── Chế độ SỬA TRỰC TIẾP ──
                  <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    {/* Số điện thoại */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Số điện thoại di động
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-white border border-[#CDD5DF] rounded-[8px] flex items-center focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Nhập số điện thoại"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                        />
                      </div>
                    </div>

                    {/* Email công vụ (*) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Email công vụ <span className="text-[#EE0033]">*</span>
                      </label>
                      <div
                        className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all ${
                          errors.email
                            ? "border-red-400 bg-red-50/20"
                            : "border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]"
                        }`}
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((p) => ({ ...p, email: "" }));
                          }}
                          placeholder="Nhập email"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
                      )}
                    </div>

                    {/* Địa chỉ thường trú */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Địa chỉ thường trú
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-white border border-[#CDD5DF] rounded-[8px] flex items-center focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Nhập địa chỉ"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                        />
                      </div>
                    </div>

                    {/* Số CCCD (Khóa - Định danh pháp lý) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Số CCCD (Cố định)
                      </label>
                      <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center text-[14px] text-[#202939] cursor-not-allowed">
                        {employee.nationalId || "—"}
                      </div>
                    </div>

                    {/* Mức lương cơ bản (*) */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Mức lương cơ bản <span className="text-[#EE0033]">*</span>
                      </label>
                      <div
                        className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center justify-between ${
                          errors.baseSalaryRate
                            ? "border-red-400 bg-red-50/20"
                            : "border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]"
                        }`}
                      >
                        <input
                          type="number"
                          min="0"
                          step="500000"
                          value={baseSalaryRate}
                          onChange={(e) => {
                            setBaseSalaryRate(e.target.value);
                            setErrors((p) => ({ ...p, baseSalaryRate: "" }));
                          }}
                          placeholder="Nhập mức lương"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                        />
                        <span className="text-[13px] text-[#064343] font-semibold pl-2 select-none">
                          VND
                        </span>
                      </div>
                      {errors.baseSalaryRate && (
                        <p className="text-xs text-red-500 mt-0.5">{errors.baseSalaryRate}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 3: THÔNG TIN KHÁC (#1415:2097) */}
              <div className="bg-white pb-2">
                <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN KHÁC
                  </h4>
                </div>

                <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                  <InfoItem
                    label="Ngày vào làm chính thức"
                    value={formatDate(employee.hiredAt)}
                  />
                  <InfoItem
                    label="Ngày tạo"
                    value={formatDateTime(employee.createdDate)}
                  />
                  <InfoItem
                    label="Ngày sửa gần nhất"
                    value={formatDateTime(employee.createdDate)}
                  />
                  <InfoItem
                    label="Ghi chú"
                    value={employee.trainerInfo?.description || "—"}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "trainer" && isTrainer && (
            <div className="bg-white pb-4">
              <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#064343]" />
                  HỒ SƠ CHUYÊN MÔN HUẤN LUYỆN VIÊN
                </h4>
                {isTrainer && (
                  <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    HLV Đủ điều kiện
                  </span>
                )}
              </div>

              {!isEditing ? (
                // ── Chế độ XEM ĐỌC HLV ──
                isTrainer ? (
                  <div className="pl-5 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                      <InfoItem
                        label="Chuyên môn huấn luyện"
                        value={
                          employee.trainerInfo?.specializationName ||
                          "Gym & Thể hình"
                        }
                      />
                      <InfoItem
                        label="Kinh nghiệm thực tế"
                        value={
                          employee.trainerInfo?.experienceYears
                            ? `${employee.trainerInfo.experienceYears} năm kinh nghiệm`
                            : "1 năm kinh nghiệm"
                        }
                      />
                      <InfoItem
                        label="Giá buổi tập"
                        value={
                          employee.trainerInfo?.pricePerSession !== undefined &&
                          employee.trainerInfo?.pricePerSession !== null
                            ? `${Number(employee.trainerInfo.pricePerSession).toLocaleString("vi-VN")} VND`
                            : "0 VND"
                        }
                      />
                      <InfoItem
                        label="Đánh giá trung bình từ học viên"
                        value={
                          employee.trainerInfo?.ratingAvg &&
                          employee.trainerInfo.ratingAvg > 0
                            ? `${employee.trainerInfo.ratingAvg} / 5 ⭐ (${
                                employee.trainerInfo.ratingCount || 0
                              } lượt)`
                            : "Chưa có đánh giá"
                        }
                      />
                    </div>

                    {employee.trainerInfo?.description && (
                      <div className="pt-4 border-t border-[#F1F5F9]">
                        <InfoItem
                          label="Giới thiệu năng lực & Bằng cấp chi tiết"
                          value={employee.trainerInfo.description}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pl-5 py-8 text-center text-[#64748B]">
                    <p className="text-[14px]">
                      Nhân viên thuộc bộ phận{" "}
                      <strong className="text-[#011010]">
                        {formatPosition(employee.position)}
                      </strong>
                      .
                    </p>
                    <p className="text-[13px] mt-1 text-[#94A3B8]">
                      Hồ sơ chuyên môn chỉ áp dụng cho nhóm Huấn luyện viên
                      (Trainer).
                    </p>
                  </div>
                )
              ) : (
                // ── Chế độ SỬA TRỰC TIẾP HLV ──
                isTrainer ? (
                  <div className="pl-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                      {/* Chuyên môn (*) */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                          Chuyên môn HLV <span className="text-[#EE0033]">*</span>
                        </label>
                        <Select
                          value={specializationId}
                          onValueChange={(val) => {
                            setSpecializationId(val);
                            setErrors((p) => ({ ...p, specializationId: "" }));
                          }}
                        >
                          <SelectTrigger
                            className={`h-[42px] w-full rounded-[8px] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] focus:border-[#064343] focus:ring-1 focus:ring-[#064343] ${
                              errors.specializationId
                                ? "border-red-400 bg-red-50/20"
                                : "border-[#CDD5DF]"
                            }`}
                          >
                            <SelectValue placeholder="Chọn chuyên môn" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPECIALIZATION_OPTIONS.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.specializationId && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {errors.specializationId}
                          </p>
                        )}
                      </div>

                      {/* Số năm kinh nghiệm (*) */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                          Số năm kinh nghiệm <span className="text-[#EE0033]">*</span>
                        </label>
                        <div
                          className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center ${
                            errors.experienceYears
                              ? "border-red-400 bg-red-50/20"
                              : "border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]"
                          }`}
                        >
                          <input
                            type="number"
                            min="1"
                            value={experienceYears}
                            onChange={(e) => {
                              setExperienceYears(e.target.value);
                              setErrors((p) => ({ ...p, experienceYears: "" }));
                            }}
                            placeholder="Nhập số năm kinh nghiệm"
                            className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                          />
                        </div>
                        {errors.experienceYears && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {errors.experienceYears}
                          </p>
                        )}
                      </div>

                      {/* Giá buổi tập */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <label className="text-[13px] font-medium text-[#202939]">
                          Giá buổi tập
                        </label>
                        <div className="h-[42px] px-3.5 py-2 bg-white border border-[#CDD5DF] rounded-[8px] flex items-center justify-between focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                          <input
                            type="number"
                            min="0"
                            step="10000"
                            value={pricePerSession}
                            onChange={(e) => setPricePerSession(e.target.value)}
                            placeholder="Nhập giá buổi tập"
                            className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                          />
                          <div className="flex items-center gap-2 pl-2 select-none">
                            <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                            <span className="text-[13px] font-semibold text-[#064343]">VND</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mô tả giới thiệu */}
                    <div className="flex flex-col gap-1.5 min-w-0 pt-2">
                      <label className="text-[13px] font-medium text-[#202939]">
                        Mô tả giới thiệu chuyên môn & Thành tích
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập thông tin giới thiệu, chứng chỉ, giải thưởng của HLV..."
                        className="w-full p-3 bg-white border border-[#CDD5DF] rounded-[8px] text-[14px] text-[#202939] placeholder:text-[#697586] outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pl-5 py-8 text-center text-[#64748B]">
                    <p className="text-[14px]">
                      Nhân viên thuộc bộ phận{" "}
                      <strong className="text-[#011010]">
                        {formatPosition(position)}
                      </strong>
                      .
                    </p>
                    <p className="text-[13px] mt-1 text-[#94A3B8]">
                      Chọn vai trò Huấn luyện viên ở Tab Thông tin chung để mở hồ sơ này.
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {!isEditing && activeTab === "schedule" && (
            <div className="bg-white py-12 text-center">
              <Calendar className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
              <h5 className="text-[15px] font-semibold text-[#011010]">
                Lịch sử ca làm & Chấm công
              </h5>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-[420px] mx-auto">
                Chưa có dữ liệu chấm công hoặc ca làm việc được ghi nhận trong
                kỳ hiện tại cho nhân viên này.
              </p>
            </div>
          )}

          {!isEditing && activeTab === "notes" && (
            <div className="bg-white py-12 text-center">
              <FileText className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
              <h5 className="text-[15px] font-semibold text-[#011010]">
                Ghi chú nội bộ
              </h5>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-[420px] mx-auto">
                Chưa có ghi chú nội bộ nào được quản trị viên lưu lại cho nhân
                viên này.
              </p>
            </div>
          )}
        </div>

        {/* 5. Footer Actions: Chuyển đổi giữa View Mode và In-Place Edit Mode */}
        <div className="h-[70px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end shrink-0">
          {!isEditing ? (
            // ── Footer Chế độ Xem: [Đóng] & [Chỉnh sửa] ──
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-[40px] px-5 min-w-[84px] bg-white border border-[#E2E8F0] rounded-[10px] text-[14px] font-normal leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span>Đóng</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-[40px] px-5 min-w-[124px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[14px] font-normal leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <EditPencilIcon className="w-5 h-5" color="#FFFFFF" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          ) : (
            // ── Footer Chế độ Sửa tại chỗ: [Hủy bỏ] & [Lưu thay đổi] ──
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="h-[40px] px-5 min-w-[84px] bg-white border border-[#E2E8F0] rounded-[10px] text-[14px] font-normal leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                <span>Hủy bỏ</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="h-[40px] px-5 min-w-[130px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[14px] font-normal leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <FolderOpenIcon className="w-4 h-4 text-white" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
