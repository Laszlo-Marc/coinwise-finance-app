export type BudgetModel = {
  id?: string;
  user_id?: string;
  category: string;
  amount: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  title: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  notificationsEnabled?: boolean;
  notificationsThreshold?: number;
  spent: number;
  remaining: number;
  description?: string;
};
