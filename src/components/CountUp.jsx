import { useEffect, useRef, useState } from "react";
import { money } from "../utils";

// Shows a naira amount that counts up to its value.
export default function CountUp({ value }) {
  const [shown, setShown] = useState(0);
  const startFrom = useRef(0); // where the last count stopped

  useEffect(() => {
    const start = startFrom.current;
    const startTime = performance.now();
    let frame;

    const step = (now) => {
      const progress = Math.min((now - startTime) / 900, 1); // 0 to 1 over 0.9 seconds
      const eased = 1 - Math.pow(1 - progress, 3); // slows down at the end
      const current = Math.round(start + (value - start) * eased);
      setShown(current);
      startFrom.current = current;
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{money(shown)}</>;
}
