
import { configureStore } from '@reduxjs/toolkit';
import reportsReducer from './reportsSlice';

export const store = configureStore({
  reducer: {
    reports: reportsReducer,
  },
});

// Kiểu dữ liệu toàn bộ Redux Store
export type RootState = ReturnType<typeof store.getState>;

// Kiểu dữ liệu dispatch
export type AppDispatch = typeof store.dispatch;
