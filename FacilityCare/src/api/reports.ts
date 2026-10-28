
export type ReportStatus = 'pending' | 'in_progress' | 'resolved';

export type Severity = 'low' | 'medium' | 'high';

export interface Report {
  id?: string;
  title: string;
  category: string;
  description: string;
  location: string;
  severity: Severity;
  status: ReportStatus;
  createdAt: string;
  reporter: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
}

export type CreateReportInput = Omit<Report, 'id'>;

// URL resource MockAPI của bạn
const API_URL = 'https://6abba2a9b2118ed7abb91afe.mockapi.io/products';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_URL.startsWith('https://')) {
    throw new Error('API_URL không hợp lệ. Hãy kiểm tra lại URL MockAPI.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `API lỗi ${response.status}${message ? `: ${message}` : ''}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getReports(): Promise<Report[]> {
  return request<Report[]>('');
}

export async function getReportById(id: string): Promise<Report> {
  return request<Report>(`/${encodeURIComponent(id)}`);
}

export async function createReport(
  report: CreateReportInput,
): Promise<Report> {
  return request<Report>('', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
): Promise<Report> {
  return request<Report>(`/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
