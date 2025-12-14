"use client";
import "./components.css";
import dynamic from "next/dynamic";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User2, Star } from "lucide-react";

// NOTE: we no longer have a static 'reviews' array here.
// Data will come from backend and stored in state.

export default function ReviewsInfinite() {
	const API_BASE = process.env.NEXT_PUBLIC_API || "";

	const containerRef = useRef(null);
	const groupRef = useRef(null);
	const rafRef = useRef(null);
	const isPointerDown = useRef(false);
	const startX = useRef(0);
	const scrollStart = useRef(0);

	// reviews state
	const [reviews, setReviews] = useState([]);
	const [loadingReviews, setLoadingReviews] = useState(false);
	const [reviewsError, setReviewsError] = useState(null);

	const [isReady, setIsReady] = useState(false);

	// Fetch reviews from backend
	async function fetchReviews() {
		setLoadingReviews(true);
		setReviewsError(null);

		try {
			// request visible reviews, first page with a larger limit for carousel
			const res = await fetch(
				`${API_BASE}/api/reviewcards?limit=50&page=1&visible=true`
			);
			if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
			const data = await res.json();
			// backend returns { items, total, page, limit }
			const items = Array.isArray(data.items) ? data.items : [];
			// Map backend fields to the names used in this component
			const mapped = items.map((it) => ({
				id: it._id || it.id,
				name: it.personName || it.name || "Anonymous",
				rating: Number(it.personRating ?? 0),
				text: it.personDescription || it.text || "",
				photo: it.personPhoto || "",
			}));
			setReviews(mapped);
		} catch (err) {
			console.error(err);
			setReviewsError(err.message || "Failed to load reviews");
			setReviews([]);
		} finally {
			setLoadingReviews(false);
			// re-initialize carousel positioning when reviews change
			// we wait a frame so layout settles
			requestAnimationFrame(() => {
				const container = containerRef.current;
				const group = groupRef.current;
				if (!container || !group) return;
				const groupWidth = group.offsetWidth;
				if (!groupWidth) return;
				container.scrollLeft = groupWidth;
				setIsReady(true);
			});
		}
	}

	// expose refresh function optionally (callable later)
	// e.g., you can call fetchReviews() from parent via ref or after admin actions
	useEffect(() => {
		fetchReviews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [API_BASE]);

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
				if (!groupWidth) {
					ticking = false;
					return;
				}

				// If we've scrolled beyond the duplicated boundaries, wrap
				if (container.scrollLeft >= groupWidth * 2) {
					container.scrollLeft -= groupWidth;
				} else if (container.scrollLeft <= 0) {
					container.scrollLeft += groupWidth;
				}

				ticking = false;
			});
		}

		container.addEventListener("scroll", onScroll, { passive: true });
		return () => container.removeEventListener("scroll", onScroll);
	}, [isReady, reviews]);

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

		container.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);

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

	// small helper to render star icons
	const renderStars = (rating) =>
		Array.from({ length: 5 }).map((_, idx) => (
			<Star
				key={idx}
				className={`h-4 w-4 ${
					idx < rating ? "text-yellow-500" : "text-black/30"
				}`}
			/>
		));

	// fallback UI when no reviews
	const fallbackReviews = [
		{
			id: "f1",
			name: "Rahul Sharma",
			rating: 5,
			text: "Excellent system — managing beds and payments is effortless. My occupancy increased within a week.",
		},
		{
			id: "f2",
			name: "Aisha Khan",
			rating: 4,
			text: "Clean UI, fast reminders and great mobile experience. Support was quick to help set up.",
		},
		{
			id: "f3",
			name: "Vikram Patel",
			rating: 5,
			text: "I love the automated invoicing. Saves me hours every month and tenants find it simple too.",
		},
	];

	const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

	return (
		<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-9">
			<div className="max-w-8xl mx-auto px-6 md:px-10">
				<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
						<div className="flex-1">
							<h2 className="text-2xl md:text-3xl font-extrabold text-black leading-tight">
								Trusted by hostel owners & tenants
							</h2>
							<p className="mt-2 text-black/75 text-sm md:text-base max-w-2xl">
								Real reviews from customers using our platform to manage beds,
								bookings and payments. See how they improved operations and
								occupancy.
							</p>
						</div>

						<div className="flex items-center gap-3">
							<Link
								href="/auth/register"
								className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg font-semibold shadow"
							>
								Try Free for 30 days
							</Link>
							<a
								href="#features"
								className="inline-flex items-center px-4 py-2 bg-black/10 text-black rounded-lg"
							>
								Learn more
							</a>
						</div>
					</div>

					{/* Scrolling reviews container - duplicate groups inside */}
					<div
						ref={containerRef}
						className="reviews-scroll-container overflow-x-auto whitespace-nowrap no-scrollbar -mx-2 px-2"
						tabIndex={0}
						aria-label="Customer reviews carousel (scroll horizontally)"
					>
						<div ref={groupRef} className="reviews-group inline-flex gap-4">
							{displayReviews.map((r, i) => (
								<article
									key={`g1-${r.id}-${i}`}
									className="review-card min-w-[260px] md:min-w-[320px] bg-gradient-to-br from-white/70 to-white/40 border border-white/30 rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur-sm inline-block m-2"
								>
									<div className="flex items-center gap-3">
										<div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center border border-white/20 overflow-hidden">
											{r.photo ? (
												<img
													src={r.photo}
													alt={r.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<User2 className="h-6 w-6 text-black/80" />
											)}
										</div>
										<div>
											<h3 className="text-sm md:text-base font-semibold text-black">
												{r.name}
											</h3>
											<div className="flex items-center gap-1 mt-1" aria-hidden>
												{renderStars(r.rating)}
												<span className="sr-only">
													{r.rating} out of 5 stars
												</span>
											</div>
										</div>
									</div>
									<p className="mt-4 text-black/75 text-sm md:text-sm leading-relaxed">
										{r.text}
									</p>
								</article>
							))}
						</div>

						{/* duplicate for infinite effect */}
						<div className="reviews-group inline-flex gap-4" aria-hidden>
							{displayReviews.map((r, i) => (
								<article
									key={`g2-${r.id}-${i}`}
									className="review-card min-w-[260px] md:min-w-[320px] bg-gradient-to-br from-white/70 to-white/40 border border-white/30 rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur-sm inline-block m-2"
									aria-hidden
								>
									<div className="flex items-center gap-3">
										<div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center border border-white/20 overflow-hidden">
											{r.photo ? (
												<img
													src={r.photo}
													alt={r.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<User2 className="h-6 w-6 text-black/80" />
											)}
										</div>
										<div>
											<h3 className="text-sm md:text-base font-semibold text-black">
												{r.name}
											</h3>
											<div className="flex items-center gap-1 mt-1" aria-hidden>
												{renderStars(r.rating)}
											</div>
										</div>
									</div>
									<p className="mt-4 text-black/75 text-sm md:text-sm leading-relaxed">
										{r.text}
									</p>
								</article>
							))}
						</div>
					</div>

					<div className="mt-6 flex items-center justify-between">
						<p className="text-xs text-black/60">
							Drag, swipe or scroll horizontally. The list loops seamlessly.
						</p>
						<div>
							{loadingReviews ? (
								<span className="text-sm text-gray-600">
									Loading reviews...
								</span>
							) : reviewsError ? (
								<span className="text-sm text-red-600">
									Error: {reviewsError}
								</span>
							) : (
								<button
									onClick={fetchReviews}
									className="text-sm px-3 py-1 bg-black text-white rounded"
								>
									Refresh
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
