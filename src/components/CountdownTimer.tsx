'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const targetDate = new Date('2026-11-21T15:00:00+02:00').getTime();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const items = [
    { label: 'Jours', value: timeLeft.days },
    { label: 'Heures', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 text-center opacity-40">
        {[0, 0, 0, 0].map((_, i) => (
          <div key={i} className="p-3 bg-[#1c1d1e] rounded border border-white/5">
            <div className="text-2xl font-serif text-[#eabe7c]">--</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-3 bg-black/70 rounded-md border border-white/20 text-center backdrop-blur-md shadow-md"
        >
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#eabe7c] tracking-tight drop-shadow-sm">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/90 font-bold mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
