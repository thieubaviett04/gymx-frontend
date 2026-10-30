"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Loader2, User, Briefcase, Award } from "lucide-react";
import { Button } from "@/components/ui";
import type {
  CreateEmployeePayload,
  EmployeeDetail,
  UpdateEmployeePayload,
} from "@/types/employee";
import { EMPLOYEE_POSITIONS, EMPLOYEE_STATUSES } from "@/types/employee";

interface EmployeeFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  employee?: EmployeeDetail | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreateEmployeePayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateEmployeePayload) => Promise<void>;
}

// Danh sách chuyên môn HLV phổ biến
const SPECIALIZATION_OPTIONS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Gym & Thể hình (Bodybuilding)",
  },
  { id: "22222222-2222-2222-2222-222222222222", name: "Yoga & Thiền định" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Pilates" },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Cardio & Giảm mỡ (HIIT)",
  },
  { id: "55555555-5555-5555-5555-555555555555", name: "Kickboxing / Võ thuật" },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Phục hồi chức năng & Chấn thương",
  },
];

export function EmployeeFormDialog({
  isOpen,
  mode,
  employee,
  isLoading = false,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}: EmployeeFormDialogProps) {
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState("NAM");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState("TRAINER");
  const [baseSalaryRate, setBaseSalaryRate] = useState<number>(8000000);
  const [hiredAt, setHiredAt] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("ACTIVE");

  // HLV specific fields
  const [specializationId, setSpecializationId] = useState(
    SPECIALIZATION_OPTIONS[0].id,
  );
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [salaryCoefficient, setSalaryCoefficient] = useState<number>(1.2);
  const [description, setDescription] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Điền dữ liệu khi mở ở chế độ Edit
  useEffect(() => {
    if (mode === "edit" && employee) {
      setFullName(employee.fullName || "");
      setEmail(employee.email || "");
      setPhoneNumber(employee.phoneNumber || "");
      setNationalId(employee.nationalId || "");
      setGender(employee.gender || "NAM");
      setDateOfBirth(employee.dateOfBirth || "");
      setAddress(employee.address || "");
      setPosition((employee.position || "TRAINER").toUpperCase());
      setBaseSalaryRate(employee.baseSalaryRate || 0);
      setEmploymentStatus(
        (employee.employmentStatus || "ACTIVE").toUpperCase(),
      );
      setHiredAt(employee.hiredAt || "");

      if (employee.trainerInfo) {
        setSpecializationId(
          employee.trainerInfo.specializationId || SPECIALIZATION_OPTIONS[0].id,
        );
        setExperienceYears(employee.trainerInfo.experienceYears ?? 1);
        setSalaryCoefficient(employee.trainerInfo.salaryCoefficient ?? 1.0);
        setDescription(employee.trainerInfo.description || "");
      }
    } else {
      // Reset form default create
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setNationalId("");
      setGender("NAM");
      setDateOfBirth("");
      setAddress("");
      setPosition("TRAINER");
      setBaseSalaryRate(8000000);
      setHiredAt(new Date().toISOString().split("T")[0]);
      setEmploymentStatus("ACTIVE");
      setSpecializationId(SPECIALIZATION_OPTIONS[0].id);
      setExperienceYears(2);
      setSalaryCoefficient(1.2);
      setDescription("");
    }
    setErrors({});
    setServerError(null);
  }, [mode, employee, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const err: Record<string, string> = {};

    if (!fullName.trim()) err.fullName = "Vui lòng nhập họ và tên.";
    if (!email.trim()) {
      err.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = "Email không đúng định dạng.";
    }

    if (mode === "create") {
      if (!nationalId.trim()) {
        err.nationalId = "Vui lòng nhập số CCCD.";
      } else if (!/^\d{9,12}$/.test(nationalId.trim())) {
        err.nationalId = "Số CCCD phải gồm 9 đến 12 chữ số.";
      }
    }

    if (
      phoneNumber &&
      !/^(0|\+84)[0-9]{9,10}$/.test(phoneNumber.replace(/\s/g, ""))
    ) {
      err.phoneNumber = "Số điện thoại không hợp lệ (10 chữ số).";
    }

    if (!position) err.position = "Vui lòng chọn vai trò làm việc.";
    if (baseSalaryRate <= 0 || isNaN(baseSalaryRate)) {
      err.baseSalaryRate = "Mức lương cơ bản phải lớn hơn 0 VNĐ.";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      if (mode === "create") {
        const payload: CreateEmployeePayload = {
          fullName: fullName.trim(),
          email: email.trim(),
          nationalId: nationalId.trim(),
          position: position.trim().toUpperCase(),
          baseSalaryRate: Number(baseSalaryRate),
          phoneNumber: phoneNumber.trim() || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth || undefined,
          address: address.trim() || undefined,
          hiredAt: hiredAt || undefined,
        };

        if (position === "TRAINER") {
          payload.specializationId = specializationId;
          payload.experienceYears = Number(experienceYears);
          payload.salaryCoefficient = Number(salaryCoefficient);
          payload.description = description.trim() || undefined;
        }

        await onSubmitCreate(payload);
      } else if (mode === "edit" && employee) {
        const payload: UpdateEmployeePayload = {
          fullName: fullName.trim(),
          email: email.trim(),
          position: position.trim().toUpperCase(),
          baseSalaryRate: Number(baseSalaryRate),
          employmentStatus,
          phoneNumber: phoneNumber.trim() || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth || undefined,
          address: address.trim() || undefined,
        };

        if (position === "TRAINER") {
          payload.specializationId = specializationId;
          payload.experienceYears = Number(experienceYears);
          payload.salaryCoefficient = Number(salaryCoefficient);
          payload.description = description.trim() || undefined;
        }

        await onSubmitUpdate(employee.id, payload);
      }
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.description ||
        err?.response?.data?.error?.message ||
        err?.message ||
        "Có lỗi xảy ra khi lưu thông tin nhân viên.";
      setServerError(message);
    }
  };

  const isTrainer = position === "TRAINER";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] my-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Modal matching Figma 46:998 */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              {mode === "create"
                ? "Thêm nhân viên mới"
                : "Cập nhật thông tin nhân viên"}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {mode === "create"
                ? "Hệ thống sẽ tự động tạo tài khoản và gửi email mật khẩu tạm thời."
                : "Chỉnh sửa thông tin hành chính, mức lương và trạng thái của nhân viên."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with scroll */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)] space-y-5">
            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Khối 1: Thông tin cơ bản */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064343]">
                <User className="w-3.5 h-3.5" />
                <span>Thông tin cá nhân</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Họ và tên */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Trần Minh Khoa"
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-1 ${
                      errors.fullName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-[#E2E8F0] focus:border-[#064343] focus:ring-[#064343]"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Email công việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="khoa.tm@gymx.vn"
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-1 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-[#E2E8F0] focus:border-[#064343] focus:ring-[#064343]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0901 234 567"
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-1 ${
                      errors.phoneNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-[#E2E8F0] focus:border-[#064343] focus:ring-[#064343]"
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Số CCCD / CMND */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Số CCCD / CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="001201000123"
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                      errors.nationalId
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-[#E2E8F0] focus:border-[#064343] focus:ring-[#064343]"
                    }`}
                  />
                  {errors.nationalId && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.nationalId}
                    </p>
                  )}
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                  >
                    <option value="NAM">Nam</option>
                    <option value="NU">Nữ</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Địa chỉ thường trú
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/TP"
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                  />
                </div>
              </div>
            </div>

            {/* Khối 2: Công việc & Lương */}
            <div className="space-y-3.5 pt-3 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064343]">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Vị trí làm việc & Mức lương</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Vai trò */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Vai trò / Chức danh <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                  >
                    {EMPLOYEE_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mức lương cơ bản */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="1000000"
                    value={baseSalaryRate}
                    onChange={(e) => setBaseSalaryRate(Number(e.target.value))}
                    className={`w-full h-10 px-3 rounded-lg border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-1 ${
                      errors.baseSalaryRate
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-[#E2E8F0] focus:border-[#064343] focus:ring-[#064343]"
                    }`}
                  />
                  {errors.baseSalaryRate && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.baseSalaryRate}
                    </p>
                  )}
                </div>

                {/* Ngày vào làm (Create mode) */}
                {mode === "create" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Ngày vào làm
                    </label>
                    <input
                      type="date"
                      value={hiredAt}
                      onChange={(e) => setHiredAt(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    />
                  </div>
                )}

                {/* Trạng thái làm việc (Edit mode) */}
                {mode === "edit" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Trạng thái làm việc{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    >
                      {EMPLOYEE_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Khối 3: Thông tin dành riêng cho Huấn luyện viên (Trainer) */}
            {isTrainer && (
              <div className="space-y-3.5 pt-3 border-t border-[#F1F5F9] bg-[#F8FAFC] p-3.5 rounded-xl border border-dashed border-[#CBD5E1]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064343]">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hồ sơ huấn luyện viên (Trainer Profile)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Chuyên môn */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Chuyên môn huấn luyện
                    </label>
                    <select
                      value={specializationId}
                      onChange={(e) => setSpecializationId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    >
                      {SPECIALIZATION_OPTIONS.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Số năm kinh nghiệm */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Số năm kinh nghiệm
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={experienceYears}
                      onChange={(e) =>
                        setExperienceYears(Number(e.target.value))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    />
                  </div>

                  {/* Hệ số lương */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Hệ số lương (KPI/Rating)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={salaryCoefficient}
                      onChange={(e) =>
                        setSalaryCoefficient(Number(e.target.value))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    />
                  </div>

                  {/* Mô tả giới thiệu HLV */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Giới thiệu / Bằng cấp chuyên môn
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Chứng chỉ HLV, thành tích thi đấu hoặc phương pháp huấn luyện..."
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons matching Figma 46:988 */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="min-w-[85px] h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#525252] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] h-10 px-5 bg-[#064343] hover:bg-[#053737] text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === "create" ? "Tạo nhân viên" : "Lưu thay đổi"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
