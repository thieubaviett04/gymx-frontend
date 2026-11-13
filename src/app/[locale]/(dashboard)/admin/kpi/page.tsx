'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { kpiService } from '@/lib/api/modules/kpiService';
import { violationService } from '@/lib/api/modules/violationService';
import { getErrorMessage } from '@/lib/utils/error-helper';
import {
  KpiTopBar,
  KpiProgressToolbar,
  KpiProgressTable,
  AssignKpiSlidePanel,
  EmployeeKpiDetailSlidePanel,
  KpiTemplateFormCard,
  KpiTemplateToolbar,
  KpiTemplateTable,
  KpiTemplateDetailSlidePanel,
  KpiPagination,
} from '@/components/admin/kpi';
import type {
  KpiRole,
  KpiStatus,
  KpiTemplateStatus,
  EmployeeKpiProgressSummary,
  KpiTemplateSummary,
  CreateKpiTemplatePayload,
  UpdateKpiTemplatePayload,
  AssignKpiPayload,
} from '@/types/kpi';

export default function AdminKpiPage() {
  const queryClient = useQueryClient();
  const today = new Date();

  const [activeTab, setActiveTab] = useState<'progress' | 'templates'>('progress');

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<'ALL' | KpiRole>('ALL');
  const [status, setStatus] = useState<'ALL' | KpiStatus>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [templateSearch, setTemplateSearch] = useState('');
  const [templateRole, setTemplateRole] = useState<KpiRole | 'ALL'>('ALL');
  const [templateStatus, setTemplateStatus] = useState<KpiTemplateStatus | 'ALL'>('ALL');
  const [templatePageIndex, setTemplatePageIndex] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(10);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedViewKpiId, setSelectedViewKpiId] = useState<string | null>(null);

  const [selectedViewTemplateId, setSelectedViewTemplateId] = useState<string | null>(null);
  const [selectedEditTemplateId, setSelectedEditTemplateId] = useState<string | null>(null);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<KpiTemplateSummary | null>(null);

  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    data: kpiData,
    isLoading: isKpiLoading,
  } = useQuery({
    queryKey: [
      'admin-employee-kpis',
      { month, year, search, position, status, pageIndex, pageSize },
    ],
    queryFn: async () => {
      const res = await kpiService.getEmployeeKpis({
        month,
        year,
        search: search.trim() || undefined,
        position: position !== 'ALL' ? position : undefined,
        status: status !== 'ALL' ? status : undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
    enabled: activeTab === 'progress',
  });

  const {
    data: templateData,
    isLoading: isTemplateLoading,
  } = useQuery({
    queryKey: [
      'admin-kpi-templates',
      {
        search: templateSearch,
        targetRole: templateRole,
        status: templateStatus,
        pageIndex: templatePageIndex,
        pageSize: templatePageSize,
      },
    ],
    queryFn: async () => {
      const res = await kpiService.getTemplates({
        search: templateSearch.trim() || undefined,
        targetRole: templateRole !== 'ALL' ? templateRole : undefined,
        status: templateStatus !== 'ALL' ? templateStatus : undefined,
        pageIndex: templatePageIndex,
        pageSize: templatePageSize,
      });
      return res.data;
    },
    enabled: activeTab === 'templates',
  });

  const { data: templatesLookupData } = useQuery({
    queryKey: ['admin-kpi-templates-lookup'],
    queryFn: async () => {
      const res = await kpiService.getTemplatesLookup();
      return res.data || [];
    },
  });

  const { data: employeesLookupData } = useQuery({
    queryKey: ['admin-employees-lookup'],
    queryFn: async () => {
      const res = await violationService.getEmployeesLookup();
      return res.data || [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: (payload: AssignKpiPayload) => kpiService.assignKpi(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employee-kpis'] });
      const { assignedCount, skippedCount, message } = res.data;
      let msg = message;
      if (!msg) {
        if (assignedCount === 0) {
          msg = 'Tất cả nhân viên đã có KPI trong chu kỳ này.';
        } else {
          msg = `Giao KPI thành công cho ${assignedCount} nhân viên.`;
          if (skippedCount > 0) {
            msg += ` Bỏ qua ${skippedCount} nhân viên đã có KPI trong kỳ.`;
          }
        }
      }
      if (assignedCount === 0 || msg.includes('Tất cả nhân viên đã có KPI')) {
        showToast('warning', msg);
      } else {
        showToast('success', msg);
      }
      setIsAssignModalOpen(false);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (payload: CreateKpiTemplatePayload) => kpiService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates-lookup'] });
      showToast('success', 'Đã tạo mẫu KPI mới thành công.');
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err);
      const isDuplicate = msg.includes('đã tồn tại') || msg.includes('trùng');
      showToast(isDuplicate ? 'warning' : 'error', msg);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateKpiTemplatePayload }) =>
      kpiService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates-lookup'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-template-detail'] });
      showToast('success', 'Đã cập nhật mẫu KPI thành công.');
      setSelectedEditTemplateId(null);
      setSelectedViewTemplateId(null);
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err);
      const isDuplicate = msg.includes('đã tồn tại') || msg.includes('trùng');
      showToast(isDuplicate ? 'warning' : 'error', msg);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => kpiService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kpi-templates-lookup'] });
      showToast('success', 'Đã xóa mẫu KPI thành công.');
      setDeleteTemplateTarget(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
      setDeleteTemplateTarget(null);
    },
  });

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-7">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={
              toast.type === 'success'
                ? 'success'
                : toast.type === 'warning'
                ? 'warning'
                : 'danger'
            }
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <KpiTopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPageIndex(1);
          setTemplatePageIndex(1);
        }}
        onOpenAssignModal={() => setIsAssignModalOpen(true)}
      />

      {activeTab === 'progress' && (
        <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                      Tiến độ KPI nhân sự
                    </h2>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                    Dữ liệu thực tế, chỉ tiêu doanh thu, buổi dạy PT và tỷ lệ đạt chỉ tiêu trong tháng
                  </p>
                </div>

                <KpiProgressToolbar
                  month={month}
                  year={year}
                  onMonthChange={(m) => {
                    setMonth(m);
                    setPageIndex(1);
                  }}
                  onYearChange={(y) => {
                    setYear(y);
                    setPageIndex(1);
                  }}
                  search={search}
                  onSearchChange={(val) => {
                    setSearch(val);
                    setPageIndex(1);
                  }}
                  position={position}
                  onPositionChange={(pos) => {
                    setPosition(pos);
                    setPageIndex(1);
                  }}
                  status={status}
                  onStatusChange={(st) => {
                    setStatus(st);
                    setPageIndex(1);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <KpiProgressTable
                  items={kpiData?.items || []}
                  isLoading={isKpiLoading}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  month={month}
                  year={year}
                  onClearFilter={() => {
                    setSearch('');
                    setStatus('ALL');
                    setPosition('ALL');
                    setPageIndex(1);
                  }}
                  onView={(kpi) => setSelectedViewKpiId(kpi.id)}
                />
              </div>
            </div>

            {kpiData && (
              <KpiPagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                totalCount={kpiData.totalCount}
                totalPages={kpiData.totalPages}
                hasPreviousPage={kpiData.hasPreviousPage}
                hasNextPage={kpiData.hasNextPage}
                onPageChange={(p) => setPageIndex(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPageIndex(1);
                }}
                unitLabel="nhân sự"
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <KpiTemplateFormCard
            onSubmit={async (payload) => {
              await createTemplateMutation.mutateAsync(payload);
            }}
            isSubmitting={createTemplateMutation.isPending}
          />

          <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
            <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
              <div>
                <div className="flex items-center">
                  <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                    Danh mục mẫu KPI
                  </h2>
                </div>
                <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                  Danh sách các mẫu chỉ tiêu định mức áp dụng cho nhân sự theo từng vị trí
                </p>
              </div>

              <KpiTemplateToolbar
                searchValue={templateSearch}
                onSearchChange={(val) => {
                  setTemplateSearch(val);
                  setTemplatePageIndex(1);
                }}
                selectedRole={templateRole}
                onRoleChange={(r) => {
                  setTemplateRole(r);
                  setTemplatePageIndex(1);
                }}
                selectedStatus={templateStatus}
                onStatusChange={(s) => {
                  setTemplateStatus(s);
                  setTemplatePageIndex(1);
                }}
              />
            </div>

            <KpiTemplateTable
              items={templateData?.items || []}
              isLoading={isTemplateLoading}
              pageIndex={templatePageIndex}
              pageSize={templatePageSize}
              onView={(template) => setSelectedViewTemplateId(template.id)}
              onEdit={(template) => setSelectedEditTemplateId(template.id)}
              onDelete={(template) => setDeleteTemplateTarget(template)}
            />

            {templateData && (
              <KpiPagination
                pageIndex={templatePageIndex}
                pageSize={templatePageSize}
                totalCount={templateData.totalCount}
                totalPages={templateData.totalPages}
                hasPreviousPage={templateData.hasPreviousPage}
                hasNextPage={templateData.hasNextPage}
                onPageChange={(p) => setTemplatePageIndex(p)}
                onPageSizeChange={(s) => {
                  setTemplatePageSize(s);
                  setTemplatePageIndex(1);
                }}
                unitLabel="mẫu KPI"
              />
            )}
          </div>
        </div>
      )}

      <AssignKpiSlidePanel
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        templates={templatesLookupData || []}
        employees={employeesLookupData || []}
        onSubmit={(payload) => assignMutation.mutate(payload)}
        isSubmitting={assignMutation.isPending}
      />

      <EmployeeKpiDetailSlidePanel
        isOpen={!!selectedViewKpiId}
        onClose={() => setSelectedViewKpiId(null)}
        kpiId={selectedViewKpiId}
      />

      <KpiTemplateDetailSlidePanel
        isOpen={Boolean(selectedViewTemplateId || selectedEditTemplateId)}
        onClose={() => {
          setSelectedViewTemplateId(null);
          setSelectedEditTemplateId(null);
        }}
        templateId={selectedEditTemplateId || selectedViewTemplateId}
        mode={selectedEditTemplateId ? 'edit' : 'view'}
        onSave={async (id, payload) => {
          await updateTemplateMutation.mutateAsync({ id, payload });
        }}
        isSaving={updateTemplateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteTemplateTarget}
        title="Xóa mẫu KPI"
        description={
          deleteTemplateTarget ? (
            <span>
              Bạn có chắc chắn muốn xóa mẫu KPI{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{deleteTemplateTarget.name}&quot;
              </strong>{' '}
              không? Các nhân viên đã được giao theo mẫu này trước đó sẽ không bị ảnh hưởng.
            </span>
          ) : (
            'Bạn có chắc chắn muốn xóa mẫu KPI này?'
          )
        }
        confirmText="Xác nhận xóa"
        cancelText="Đóng"
        type="danger"
        isLoading={deleteTemplateMutation.isPending}
        onConfirm={async () => {
          if (deleteTemplateTarget) {
            await deleteTemplateMutation.mutateAsync(deleteTemplateTarget.id);
          }
        }}
        onClose={() => setDeleteTemplateTarget(null)}
      />
    </div>
  );
}
