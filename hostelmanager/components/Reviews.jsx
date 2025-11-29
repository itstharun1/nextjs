// File: components/ReviewsInfinite.jsx

"use client";
import "./components.css";
import dynamic from "next/dynamic";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User2, Star } from "lucide-react";

// Reviews data
const reviews = [
  { name: "Rahul Sharma", rating: 5, text: "Excellent system — managing beds and payments is effortless. My occupancy increased within a week." },
  { name: "Aisha Khan", rating: 4, text: "Clean UI, fast reminders and great mobile experience. Support was quick to help set up." },
  { name: "Vikram Patel", rating: 5, text: "I love the automated invoicing. Saves me hours every month and tenants find it simple too." },
  { name: "Neha Verma", rating: 4, text: "Easy to add properties and manage beds. Analytics are clear and actionable." },
  { name: "Sahil Gupta", rating: 5, text: "Stable, fast and reliable. The booking flow is seamless for students and working professionals." },
];

export default function ReviewsInfinite() {
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const rafRef = useRef(null);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [isReady, setIsReady] = useState(false);

  // Set initial scroll to the width of one group (so we sit in the middle copy)
  useEffect(() => {
    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group) return;

    // Wait a frame so layout settles
    requestAnimationFrame(() => {
      const groupWidth = group.offsetWidth;
      // If width is zero (very small screens) wait a bit
      if (!groupWidth) return;
      container.scrollLeft = groupWidth;
      setIsReady(true);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Scroll handler that wraps scroll position for infinite effect
  useEffect(() => {
    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(() => {
        const groupWidth = group.offsetWidth;
        // Safety: if groupWidth is 0, ignore
        if (!groupWidth) {
          ticking = false;
          return;
        }

        // When scrolling beyond the duplicated boundaries, wrap
        if (container.scrollLeft >= groupWidth * 2) {
          // jumped past second copy: move back by one group
          container.scrollLeft -= groupWidth;
        } else if (container.scrollLeft <= 0) {
          // jumped before first copy: move forward by one group
          container.scrollLeft += groupWidth;
        }

        ticking = false;
      });
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [isReady]);

  // Pointer drag to scroll (desktop & touch friendly)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onPointerDown(e) {
      isPointerDown.current = true;
      startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      scrollStart.current = container.scrollLeft;
      container.classList.add("dragging");
    }

    function onPointerMove(e) {
      if (!isPointerDown.current) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - startX.current;
      container.scrollLeft = scrollStart.current - dx;
    }

    function onPointerUp() {
      isPointerDown.current = false;
      container.classList.remove("dragging");
    }

    // pointer events
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // touch fallback for very old browsers
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  return (
    <section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-9">
      <div className="max-w-8xl mx-auto px-6 md:px-10">
        <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black leading-tight">Trusted by hostel owners & tenants</h2>
              <p className="mt-2 text-black/75 text-sm md:text-base max-w-2xl">Real reviews from customers using our platform to manage beds, bookings and payments. See how they improved operations and occupancy.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg font-semibold shadow">Try Free for 30 days</Link>
              <a href="#features" className="inline-flex items-center px-4 py-2 bg-black/10 text-black rounded-lg">Learn more</a>
            </div>
          </div>

          {/* Scrolling reviews container - duplicate groups inside */}
          <div
            ref={containerRef}
            className="reviews-scroll-container overflow-x-auto whitespace-nowrap no-scrollbar -mx-2 px-2"
            tabIndex={0}
            aria-label="Customer reviews carousel (scroll horizontally)">
            <div ref={groupRef} className="reviews-group inline-flex gap-4">
              {reviews.map((r, i) => (
                <article key={`g1-${i}`} className="review-card min-w-[260px] md:min-w-[320px] bg-gradient-to-br from-white/70 to-white/40 border border-white/30 rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur-sm inline-block m-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center border border-white/20">
                      <User2 className="h-6 w-6 text-black/80" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-black">{r.name}</h3>
                      <div className="flex items-center gap-1 mt-1" aria-hidden>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < r.rating ? "text-yellow-500" : "text-black/30"}`} />
                        ))}
                        <span className="sr-only">{r.rating} out of 5 stars</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-black/75 text-sm md:text-sm leading-relaxed">{r.text}</p>
                </article>
              ))}
            </div>

            {/* duplicate for infinite effect */}
            <div className="reviews-group inline-flex gap-4" aria-hidden>
              {reviews.map((r, i) => (
                <article key={`g2-${i}`} className="review-card min-w-[260px] md:min-w-[320px] bg-gradient-to-br from-white/70 to-white/40 border border-white/30 rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur-sm inline-block" aria-hidden>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center border border-white/20">
                      <User2 className="h-6 w-6 text-black/80" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-black">{r.name}</h3>
                      <div className="flex items-center gap-1 mt-1" aria-hidden>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < r.rating ? "text-yellow-500" : "text-black/30"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-black/75 text-sm md:text-sm leading-relaxed">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-black/60">Drag, swipe or scroll horizontally. The list loops seamlessly.</p>
        </div>
      </div>
    </section>
  );
}


