import { useState } from "react";

export const useStatsTabs = () => {
  const [activeTab, setActiveTab] = useState<"spending" | "income" | "savings">(
    "spending"
  );
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  return {
    activeTab,
    setActiveTab,
    chartType,
    setChartType,
  };
};
