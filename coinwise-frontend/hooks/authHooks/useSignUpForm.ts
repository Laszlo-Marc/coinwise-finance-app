import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

type UseSignUpFormProps = {
  checkUserExists: (email: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
};

export const useSignUpForm = ({
  checkUserExists,
  signUp,
}: UseSignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailValid, setEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Number");
    return errors;
  };

  const handleEmailBlur = async () => {
    if (!email) return;

    const isValidFormat = validateEmail(email);
    setEmailValid(isValidFormat);

    if (isValidFormat) {
      try {
        const exists = await checkUserExists(email);
        if (exists) {
          Alert.alert("Email in Use", "Try signing in or use another email.");
        }
      } catch (error) {
        Alert.alert("Error", "Could not verify email. Try again later.");
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordErrors(validatePassword(text));
  };

  const handleSignUp = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !fullName.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      Alert.alert("Password Requirements", errors.join("\n"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      Alert.alert("Success", "Check your email to confirm.", [
        { text: "OK", onPress: () => router.replace("./sign-in") },
      ]);
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    password,
    confirmPassword,
    setConfirmPassword,
    loading,
    passwordErrors,
    emailValid,
    handleEmailBlur,
    handlePasswordChange,
    handleSignUp,
  };
};
