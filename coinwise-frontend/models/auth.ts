export type User = {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at?: string;
};

export type AuthState = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
  error: string | null;
};
