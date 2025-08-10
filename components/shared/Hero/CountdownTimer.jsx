import { useEffect, useState } from "react";

export const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      <div className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[40px] text-center">
        {String(timeLeft.hours).padStart(2, "0")}
      </div>
      <span className="text-orange-500 font-bold">:</span>
      <div className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[40px] text-center">
        {String(timeLeft.minutes).padStart(2, "0")}
      </div>
      <span className="text-orange-500 font-bold">:</span>
      <div className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[40px] text-center">
        {String(timeLeft.seconds).padStart(2, "0")}
      </div>
    </div>
  );
};
