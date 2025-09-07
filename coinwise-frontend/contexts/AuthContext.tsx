import { API_BASE_URL } from "@/constants/api";
import { AuthState, User } from "@/models/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

const API_URL = `${API_BASE_URL}/auth`;
type AuthContextType = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    full_name?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserExists: (email: string) => Promise<boolean>;
  checkSessionValidity: () => Promise<boolean>;
  refreshTokenFunction: () => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
  getStoredUserData: () => Promise<User | null>;
  deleteAccount: () => Promise<void>;
};

type JwtPayload = {
  exp: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    error: null,
  });
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const userTokenRef = useRef<string | null>(null);

  const deleteAccount = async () => {
    try {
      const userToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!userToken) {
        throw new Error("User is not authenticated");
      }
      await api.delete(`${API_URL}/account`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const storeTokens = async (accessToken: string, refreshToken: string) => {
    try {
      userTokenRef.current = accessToken;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);

      setState((prev) => ({
        ...prev,
        userToken: accessToken,
      }));
    } catch (error) {
      console.error("Error storing tokens:", error);
    }
  };

  const storeUserData = async (user: User) => {
    try {
      console.log("Storing user data:", user);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      setState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const getStoredUserData = async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const getTokenExpiry = (token: string): number => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      return decoded.exp * 1000;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return 0;
    }
  };

  const checkSessionValidity = async (): Promise<boolean> => {
    try {
      const userToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!userToken) {
        return false;
      }

      const expiry = getTokenExpiry(userToken);
      const now = Date.now();

      if (expiry <= now) {
        console.warn("Token has expired");
        return false;
      }

      userTokenRef.current = userToken;
      return true;
    } catch (error) {
      console.error("Error checking session validity:", error);
      return false;
    }
  };

  const isTokenValid = (token: string): boolean => {
    try {
      const expiry = getTokenExpiry(token);
      const now = Date.now();
      return expiry > now;
    } catch (e) {
      return false;
    }
  };

  const scheduleTokenRefresh = (token: string) => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    const expiry = getTokenExpiry(token);

    const currentTime = Date.now();
    const timeUntilRefresh = expiry - currentTime - 5 * 60 * 1000;
    if (timeUntilRefresh > 0) {
      const timeout = setTimeout(
        () => refreshTokenFunction(),
        timeUntilRefresh
      );
      setRefreshTimeout(timeout as unknown as NodeJS.Timeout);
      console.log(
        `Token refresh scheduled in ${timeUntilRefresh / 1000} seconds`
      );
    } else {
      refreshTokenFunction();
    }
  };

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (userTokenRef.current) {
          config.headers.Authorization = `Bearer ${userTokenRef.current}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await refreshTokenFunction();

            if (refreshed && state.userToken) {
              originalRequest.headers.Authorization = `Bearer ${state.userToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            await signOut();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    const loadStoredData = async () => {
      try {
        const [userToken, userData, refreshToken] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        ]);

        if (userToken && userData && isTokenValid(userToken)) {
          setState({
            ...state,
            userToken,
            user: JSON.parse(userData),
            isLoading: false,
          });

          scheduleTokenRefresh(userToken);
        } else if (refreshToken) {
          const refreshed = await refreshTokenFunction();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            userToken: refreshed ? prev.userToken : null,
            user: refreshed ? prev.user : null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            userToken: null,
            user: null,
          }));
        }
      } catch (error) {
        console.error("Failed to load authentication data", error);
        setState({
          ...state,
          isLoading: false,
          userToken: null,
          user: null,
        });
      }
    };

    loadStoredData();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [state.userToken]);

  const refreshTokenFunction = async (): Promise<boolean> => {
    if (tokenRefreshInProgress) {
      return false;
    }

    setTokenRefreshInProgress(true);

    try {
      const storedRefreshToken = await SecureStore.getItemAsync(
        REFRESH_TOKEN_KEY
      );

      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post(
        `${API_URL}/refresh-token`,
        {
          refresh_token: storedRefreshToken,
        },
        {
          timeout: 4000,
        }
      );

      const { access_token, refresh_token, user } = response.data;

      await storeTokens(access_token, refresh_token);
      await storeUserData(user);

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      scheduleTokenRefresh(access_token);

      setState((prev) => ({
        ...prev,
        userToken: access_token,
        user,
        error: null,
      }));

      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Token refresh error", error);
      return false;
    } finally {
      setTokenRefreshInProgress(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;

      await storeTokens(access_token, refresh_token);
      await storeUserData(user);

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      scheduleTokenRefresh(access_token);

      setState((prev) => ({
        ...prev,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      }));
      return access_token;
    } catch (error: any) {
      console.error("Sign in error", error);

      const errorMessage =
        error.response?.data?.detail ||
        "Failed to sign in. Please check your credentials and try again.";

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    full_name?: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        full_name,
      });

      const { access_token, refresh_token, user } = response.data;

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setState((prev) => ({
        ...prev,
        userToken: access_token,
        user,
        error: null,
        isSignout: false,
      }));
    } catch (error: any) {
      console.error("Sign up error", error);

      const errorMessage =
        error.response?.data?.detail ||
        "Failed to create account. Please try again.";

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      if (state.userToken) {
        try {
          await api.post(`${API_URL}/signout`);
          console.log("User signed out from API");
        } catch (error) {
          console.warn("Error during API signout:", error);
        }
      }

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        setRefreshTimeout(null);
      }

      await clearAuthData();

      delete api.defaults.headers.common["Authorization"];

      setState((prev) => ({
        ...prev,
        userToken: null,
        user: null,
        isSignout: true,
        error: null,
      }));
    } catch (error) {
      console.error("Sign out error", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to sign out properly",
      }));
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/user-exists`, {
        email,
      });

      return response.data.exists;
    } catch (error) {
      console.error("Check user exists error", error);
      throw new Error("Failed to check if user exists");
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`${API_URL}/profile`, profileData);

      const updatedUser = response.data;

      await storeUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("Update profile error", error);
      throw new Error("Failed to update profile");
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/password-reset`, {
        email,
      });
    } catch (error) {
      console.error("Reset password error", error);
      throw new Error("Failed to send password reset email");
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await api.post(`${API_URL}/password-update`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error("Update password error", error);
      throw new Error("Failed to update password");
    }
  };

  const clearError = () => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  const authContext: AuthContextType = {
    state,
    signIn,
    signUp,
    signOut,
    checkUserExists,
    refreshTokenFunction,
    updateProfile,
    resetPassword,
    checkSessionValidity,
    updatePassword,
    clearError,
    getStoredUserData,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthenticatedApi = () => {
  const { state } = useAuth();

  const authApi = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(state.userToken
        ? { Authorization: `Bearer ${state.userToken}` }
        : {}),
    },
  });

  return authApi;
};
