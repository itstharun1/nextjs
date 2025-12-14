"use client";
import React, { useEffect, useState } from "react";

/**
 * FeatureCardsLoader
 * - fetchFeatureCards() gets data from backend and stores in state
 * - UI displays cards from state
 */
export default function FeatureCardsLoader() {
	const API_BASE = process.env.NEXT_PUBLIC_API || "";
	const [cards, setCards] = useState([]); // stored API data
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Reusable function to fetch and store feature cards
	async function fetchFeatureCards() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`${API_BASE}/api/featurecards?limit=50&page=1&visible=true`
			);
			if (!res.ok) throw new Error(`API error ${res.status}`);
			const data = await res.json();
			// backend returns { items, total, page, limit }
			const items = Array.isArray(data.items)
				? data.items
				: Array.isArray(data)
				? data
				: [];
			const mapped = items.map((it) => ({
				id: it._id || it.id,
				title: it.title || "",
				subtitle: it.subtitle || "",
				bullets: Array.isArray(it.bullets) ? it.bullets : [],
				icon: it.icon || "",
				ctaText: it.ctaText || "",
				ctaLink: it.ctaLink || "",
				visible: it.visible ?? true,
			}));
			setCards(mapped);
		} catch (err) {
			console.error("fetchFeatureCards:", err);
			setError(err.message || "Failed to load feature cards");
			setCards([]);
		} finally {
			setLoading(false);
		}
	}

	// Fetch on mount (and whenever API_BASE changes)
	useEffect(() => {
		fetchFeatureCards();
	}, [API_BASE]);

	// Basic presentational card — small helper
	function Card({ item }) {
		return (
			<div>
				<article className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center text-black">
							{/* icon could be a url or text key */}
							{item.icon && item.icon.startsWith("http") ? (
								<img
									src={item.icon}
									alt={item.title}
									className="w-full h-full object-cover rounded-sm"
								/>
							) : (
								<div className="text-sm font-bold">
									{(item.icon && item.icon[0]) || (item.title && item.title[0])}
								</div>
							)}
						</div>

						<div className="flex-1">
							<h3 className="font-semibold text-black">{item.title}</h3>
							<p className="text-sm text-black/70 mt-1">{item.subtitle}</p>

							{item.bullets && item.bullets.length > 0 && (
								<ul className="mt-2 text-sm text-black/70 list-disc list-inside space-y-1">
									{item.bullets.map((b, i) => (
										<li key={i}>{b}</li>
									))}
								</ul>
							)}

							{item.ctaText && (
								<div className="mt-3">
									{item.ctaLink ? (
										<a
											href={item.ctaLink}
											className="inline-block px-3 py-1 bg-black text-white rounded-sm"
										>
											{item.ctaText}
										</a>
									) : (
										<button
											className="inline-block px-3 py-1 bg-black text-white rounded-sm"
											onClick={() => alert(item.ctaText)}
										>
											{" "}
											{item.ctaText}{" "}
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</article>
			</div>
		);
	}

	return (
		<section className="py-6">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Feature Cards</h2>
					<div className="flex items-center gap-2">
						<button
							onClick={fetchFeatureCards}
							className="px-3 py-1 bg-black text-white rounded"
						>
							Refresh
						</button>
					</div>
				</div>

				{loading ? (
					<div className="text-center text-gray-600">Loading...</div>
				) : error ? (
					<div className="text-center text-red-600">Error: {error}</div>
				) : cards.length === 0 ? (
					<div className="text-center text-gray-600">
						No feature cards found.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{cards.map((c) => (
							<Card item={c} key={c.id} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
