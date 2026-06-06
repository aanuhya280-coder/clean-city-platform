import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Report, ReportImage, ReportStatus } from '../types';

async function fetchReports(filters?: { status?: string; search?: string }): Promise<Report[]> {
  let query = supabase
    .from('reports')
    .select('*, profiles(full_name, email), report_images(*)')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.search) query = query.ilike('address', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function fetchReportById(id: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, profiles(full_name, email), report_images(*), status_history(*, profiles(full_name))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function createReport(report: {
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  user_id: string;
}): Promise<Report> {
  const { data, error } = await supabase.from('reports').insert(report).select().single();
  if (error) throw error;
  return data;
}

async function uploadImage(reportId: string, file: File): Promise<ReportImage> {
  const ext = file.name.split('.').pop();
  const path = `${reportId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('report-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('report-images').getPublicUrl(path);
  const { data, error } = await supabase
    .from('report_images')
    .insert({ report_id: reportId, image_url: urlData.publicUrl })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  notes: string,
  changedBy: string
): Promise<void> {
  const { data: report } = await supabase.from('reports').select('status').eq('id', reportId).single();
  if (!report) throw new Error('Report not found');

  const { error: historyError } = await supabase.from('status_history').insert({
    report_id: reportId,
    previous_status: report.status,
    new_status: newStatus,
    notes,
    changed_by: changedBy,
  });
  if (historyError) throw historyError;

  const { error: updateError } = await supabase
    .from('reports')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId);
  if (updateError) throw updateError;
}

async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  if (error) throw error;
}

async function fetchReportStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  recent: { date: string; count: number }[];
}> {
  const { data, error } = await supabase.from('reports').select('status, created_at');
  if (error) throw error;
  const reports = data ?? [];

  const byStatus: Record<string, number> = {};
  const byDate: Record<string, number> = {};

  for (const r of reports) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const date = r.created_at.slice(0, 10);
    byDate[date] = (byDate[date] || 0) + 1;
  }

  const recent = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  return { total: reports.length, byStatus, recent };
}

export function useReports(filters?: { status?: string; search?: string }) {
  return useQuery({ queryKey: ['reports', filters], queryFn: () => fetchReports(filters) });
}

export function useReport(id: string) {
  return useQuery({ queryKey: ['report', id], queryFn: () => fetchReportById(id), enabled: !!id });
}

export function useReportStats() {
  return useQuery({ queryKey: ['report-stats'], queryFn: fetchReportStats, refetchInterval: 30000 });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, file }: { reportId: string; file: File }) => uploadImage(reportId, file),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['report', vars.reportId] }),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, newStatus, notes, changedBy }: { reportId: string; newStatus: ReportStatus; notes: string; changedBy: string }) =>
      updateReportStatus(reportId, newStatus, notes, changedBy),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['report', vars.reportId] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}
