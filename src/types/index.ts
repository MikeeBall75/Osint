export interface SearchResultItem {
  source: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  credits: number;
}
