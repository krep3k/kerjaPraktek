"use client";
import { useEffect, useRef } from "react";
import { SessionProvider, signOut } from "next-auth/react";

const IDLE_TIMEOUT = 60 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

function AutoLogout({ children }: { children: React.ReactNode }) {
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
            timerRef.current = window.setTimeout(() => {
                signOut({ callbackUrl: "/login?reason=idle" });
            }, IDLE_TIMEOUT);
        };

        resetTimer();
        ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
            ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, []);

    return <>{children}</>;
}

export default function AuthProvider({children} : {children: React.ReactNode}) {
    return (
        <SessionProvider refetchInterval={300}>
            <AutoLogout>{children}</AutoLogout>
        </SessionProvider>
    );
}