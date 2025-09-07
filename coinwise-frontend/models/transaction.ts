export type TransactionModel = {
  id?: string;
  amount: number;
  date: string;
  description: string;
  user_id?: string;
  category?: string;
  merchant?: string;
  currency: string;
  sender?: string;
  receiver?: string;
  type: "expense" | "income" | "transfer" | "deposit";
};

export type PaginatedResponse = {
  data: TransactionModel[];
  page: number;
  total_pages: number;
};
