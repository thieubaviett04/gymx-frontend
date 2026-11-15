"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, ConfirmDialog } from "@/components/ui";
import { employeeService } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils/error-helper";
import type {
  EmployeeDetail,
  EmployeeSummary,
} from "@/types/employee";
import {
  EmployeeToolbar,
  EmployeeTable,
  EmployeePagination,
  EmployeeDetailDialog,
} from "@/components/admin/employees";
import { ConnectionErrorState } from "@/components/shared";

export default function AdminEmployeesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeEmployee, setActiveEmployee] = useState<EmployeeDetail | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeSummary | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    try {
      const flashMsg = sessionStorage.getItem("gymx_employee_flash");
      if (flashMsg) {
        sessionStorage.removeItem("gymx_employee_flash");
        setTimeout(() => {
          showToast("success", flashMsg);
        }, 50);
      }

      const autoViewId = sessionStorage.getItem("gymx_employee_view_id");
      if (autoViewId) {
        sessionStorage.removeItem("gymx_employee_view_id");
        (async () => {
          try {
            setIsFetchingDetail(true);
            const res = await employeeService.byId(autoViewId);
            setActiveEmployee(res.data);
            setIsDetailOpen(true);
          } catch {
          } finally {
            setIsFetchingDetail(false);
          }
        })();
      }
    } catch {}
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "admin-employees",
      { search, position, status, pageIndex, pageSize },
    ],
    queryFn: async () => {
      const res = await employeeService.list({
        search: search.trim() || undefined,
        position: position || undefined,
        status: status || undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: (res) => {
      if (data?.items && data.items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      showToast("success", res.message || "Xóa nhân viên thành công.");
      setIsDeleteOpen(false);
      setDeletingEmployee(null);
    },
    onError: (err: unknown) => {
      showToast("error", getErrorMessage(err));
    },
  });

  const handleOpenCreate = () => {
    router.push("/admin/employees/create");
  };

  const handleOpenEdit = (emp: EmployeeSummary) => {
    router.push(`/admin/employees/${emp.id}/edit`);
  };

  const handleOpenView = (emp: EmployeeSummary) => {
    router.push(`/admin/employees/${emp.id}`);
  };

  const handleOpenDelete = (emp: EmployeeSummary) => {
    setDeletingEmployee(emp);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await deleteMutation.mutateAsync(deletingEmployee.id);
    } catch {
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[90vw] md:max-w-[620px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === "success" ? "success" : "danger"}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[90vw] md:max-w-[620px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white pr-3"
          >
            <p className="text-[13px] font-normal !font-normal text-[#202939] leading-snug break-words">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <EmployeeToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(1);
        }}
        selectedPosition={position}
        onPositionChange={(pos) => {
          setPosition(pos);
          setPageIndex(1);
        }}
        selectedStatus={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPageIndex(1);
        }}
        onAddNew={handleOpenCreate}
      />

      <div className="bg-white rounded-[8px] p-4 sm:p-[16px_24px] shadow-xs flex-1 flex flex-col justify-between">
        {isError ? (
          <ConnectionErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <EmployeeTable
                items={data?.items || []}
                isLoading={isLoading || isFetchingDetail}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onClearFilter={
                  search || position || status
                    ? () => {
                        setSearch("");
                        setPosition("");
                        setStatus("");
                        setPageIndex(1);
                      }
                    : undefined
                }
              />
            </div>

            {data && data.totalCount > 0 && (
              <EmployeePagination
                pageIndex={data.pageIndex}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages}
                hasPreviousPage={data.hasPreviousPage}
                hasNextPage={data.hasNextPage}
                onPageChange={(page) => setPageIndex(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageIndex(1);
                }}
              />
            )}
          </>
        )}
      </div>

      <EmployeeDetailDialog
        isOpen={isDetailOpen}
        employee={activeEmployee}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(emp) => {
          setIsDetailOpen(false);
          router.push(`/admin/employees/${emp.id}/edit`);
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        size="sm"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setIsDeleteOpen(false);
          setDeletingEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
        state="delete"
        title="Xác nhận xóa nhân viên"
        description={
          deletingEmployee ? (
            <span>
              Bạn có chắc muốn xóa{" "}
              <span className="text-[#064343] font-medium">
                &quot;{deletingEmployee.employeeCode}&quot;
              </span>{" "}
              chứ?
            </span>
          ) : (
            "Bạn có chắc muốn xóa nhân viên này chứ?"
          )
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
