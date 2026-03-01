"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
    /** ISO date string (e.g. "2026-03-15") or full ISO datetime; time defaults to 00:00:00 UTC */
    targetDate: string;
    /** Optional label when countdown reaches zero */
    completedLabel?: string;
    className?: string;
}

function getTimeLeft(target: Date) {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds, isComplete: false };
}

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

export function CountdownTimer({
    targetDate,
    completedLabel = "Race day!",
    className = "",
}: CountdownTimerProps) {
    const target = new Date(targetDate.includes("T") ? targetDate : `${targetDate}T00:00:00.000Z`);
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

    useEffect(() => {
        const t = new Date(targetDate.includes("T") ? targetDate : `${targetDate}T00:00:00.000Z`);
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(t));
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (timeLeft.isComplete) {
        return (
            <div
                className={`inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-linear-to-r from-red-600/20 to-rose-700/20 px-6 py-4 text-red-400 font-bold ${className}`}
                role="status"
                aria-live="polite"
            >
                {completedLabel}
            </div>
        );
    }

    const units = [
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
    ];

    return (
        <div
            className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${className}`}
            role="timer"
            aria-live="polite"
            aria-label={`Countdown to race: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
        >
            {units.map(({ value, label }) => (
                <div
                    key={label}
                    className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
                        {pad(value)}
                    </span>
                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider mt-0.5">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}
