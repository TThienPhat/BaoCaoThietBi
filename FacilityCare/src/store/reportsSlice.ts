
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Report } from '../api/reports';

interface ReportsState {
  items: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  items: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Thay toàn bộ danh sách báo cáo
    setReports(state, action: PayloadAction<Report[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Thêm báo cáo mới vào đầu danh sách
    addReport(state, action: PayloadAction<Report>) {
      const newReport = action.payload;

      const exists = state.items.some(
        (item) => item.id === newReport.id,
      );

      if (!exists) {
        state.items.unshift(newReport);
      }
    },

    // Cập nhật một báo cáo
    updateReport(state, action: PayloadAction<Report>) {
      const updatedReport = action.payload;

      const index = state.items.findIndex(
        (item) => item.id === updatedReport.id,
      );

      if (index !== -1) {
        state.items[index] = updatedReport;
      } else {
        state.items.unshift(updatedReport);
      }
    },

    // Quản lý trạng thái tải dữ liệu
    setReportsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    // Lưu thông báo lỗi
    setReportsError(
      state,
      action: PayloadAction<string | null>,
    ) {
      state.error = action.payload;
      state.loading = false;
    },

    // Xóa lỗi hiện tại
    clearReportsError(state) {
      state.error = null;
    },

    // Xóa toàn bộ danh sách trong bộ nhớ
    clearReports(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setReports,
  addReport,
  updateReport,
  setReportsLoading,
  setReportsError,
  clearReportsError,
  clearReports,
} = reportsSlice.actions;

export default reportsSlice.reducer;
