import { useEffect } from "react";

// Makes every card fade in the first time it scrolls into view.
export default function useScrollReveal(page) {
  useEffect(() => {
    const cards = document.querySelectorAll(".pg .card");

    const watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            watcher.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card, index) => {
      card.classList.add("js-reveal");
      card.style.transitionDelay = (index % 4) * 80 + "ms"; // one after another
      watcher.observe(card);
    });

    return () => watcher.disconnect();
  }, [page]); // run again each time the page changes
}
