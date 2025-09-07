export type GoalModel = {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  category: string;
};
