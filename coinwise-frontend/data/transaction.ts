interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  type: "income" | "expense" | "transfer" | "deposit";
 
  merchant: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export default Transaction;
