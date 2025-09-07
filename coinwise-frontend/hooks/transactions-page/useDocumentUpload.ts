// hooks/useDocumentUpload.ts
import { useStatsContext } from "@/contexts/StatsContext";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export type ProcessingStage =
  | "anonymizing"
  | "extracting_sections"
  | "normalizing"
  | "extracting_transactions"
  | "done"
  | "";

export function useDocumentUpload(
  uploadBankStatement: (data: FormData) => Promise<any>
) {
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { refreshSummary } = useStatsContext();
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const uploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const document = result.assets[0];
      setIsLoading(true);
      setProcessingStage("anonymizing");
      await delay(1000);

      setProcessingStage("extracting_sections");
      await delay(1000);

      setProcessingStage("normalizing");
      await delay(1000);

      setProcessingStage("extracting_transactions");

      const formData = new FormData();
      formData.append("file", {
        uri: document.uri,
        name: document.name || "upload.pdf",
        type: document.mimeType || "application/pdf",
      } as any);

      await uploadBankStatement(formData);
      await refreshSummary();
      setProcessingStage("done");
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setProcessingStage("");
      }, 1000);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setIsLoading(false);
      setProcessingStage("");
      Alert.alert("Upload Failed", err.message || "Unknown error occurred.");
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    uploadDocument,
    isLoading,
    processingStage,
  };
}
