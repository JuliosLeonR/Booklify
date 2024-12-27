import { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
    message: string;
    type: "success" | "error";
}

interface NotificationContextType {
    notification: Notification | null;
    setNotification: (notification: Notification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null);

    return (
        <NotificationContext.Provider value={{ notification, setNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}