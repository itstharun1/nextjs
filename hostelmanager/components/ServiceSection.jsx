// components/ServicesSection.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiMapPin, FiSearch, FiFilter } from "react-icons/fi";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API || "";
export async function fetchHostelsAPI({
	q,
	minPrice,
	maxPrice,
	sort,
	page = 1,
	limit = 3,
}) {
	if (!API_BASE) throw new Error("NEXT_PUBLIC_API not set");

	const params = { page, limit };

	if (q && q.trim()) params.q = q.trim();
	if (minPrice !== undefined && minPrice !== "" && minPrice !== null) {
		const m = Number(minPrice);
		if (!Number.isNaN(m)) params.minPrice = m;
	}
	if (maxPrice !== undefined && maxPrice !== "" && maxPrice !== null) {
		const M = Number(maxPrice);
		if (!Number.isNaN(M)) params.maxPrice = M;
	}
	if (sort) params.sort = sort;

	const res = await axios.get(`${API_BASE}/api/hostels`, { params });
	return res.data; // { success, data, meta }
}

export default function ServicesSection() {
	const [query, setQuery] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [sortBy, setSortBy] = useState(""); // price-asc | price-desc
	const [page, setPage] = useState(1);
	const [hostels, setHostels] = useState([]);
	const [meta, setMeta] = useState({ total: 0, page: 1, limit: 3, pages: 1 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const LIMIT = 3; // fixed per page as requested

	// Debounce search input
	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1); // reset page on new query
			fetchHostels(1);
		}, 450);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, minPrice, maxPrice, sortBy]);

	useEffect(() => {
		// fetch when page changes
		fetchHostels(page);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	async function fetchHostels(requestPage = 1) {
		if (!API_BASE) {
			setError("API base not configured (NEXT_PUBLIC_API)");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const params = {
				page: requestPage,
				limit: LIMIT,
			};

			if (query.trim()) params.q = query.trim();
			if (minPrice) params.minPrice = minPrice;
			if (maxPrice) params.maxPrice = maxPrice;
			if (sortBy) params.sort = sortBy;

			const res = await axios.get(`${API_BASE}/api/hostels`, {
				params,
				timeout: 10000,
			});

			if (res.status === 200 && res.data) {
				setHostels(res.data.data || []);
				setMeta(
					res.data.meta || {
						total: 0,
						page: requestPage,
						limit: LIMIT,
						pages: 1,
					}
				);
			} else {
				setHostels([]);
				setMeta({ total: 0, page: requestPage, limit: LIMIT, pages: 1 });
			}
		} catch (err) {
			console.error("fetchHostels error", err);
			setError(
				err.response?.data?.message || err.message || "Failed to load hostels"
			);
			setHostels([]);
			setMeta({ total: 0, page: requestPage, limit: LIMIT, pages: 1 });
		} finally {
			setLoading(false);
		}
	}

	function handleReset() {
		setQuery("");
		setMinPrice("");
		setMaxPrice("");
		setSortBy("");
		setPage(1);
		fetchHostels(1);
	}

	function prevPage() {
		if (meta.page > 1) {
			setPage((p) => p - 1);
		}
	}

	function nextPage() {
		if (meta.page < meta.pages) {
			setPage((p) => p + 1);
		}
	}

	const showEmpty = !loading && hostels.length === 0;

	return (
		<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-6">
			<div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
				<div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h3 className="text-2xl md:text-3xl font-semibold text-black">
								Find Hostels by Location & Price
							</h3>
							<p className="mt-2 text-sm text-black/75 max-w-xl">
								Search verified hostels near you — filter by location, price
								range and features. Start with pre-listed hostels.
							</p>
						</div>

						<div className="text-sm text-black/70 hidden md:block">
							<span className="font-semibold">Instant results</span> · Verified
							listings · Secure booking
						</div>
					</div>

					{/* SEARCH BAR */}
					<div className="mt-6">
						<form onSubmit={(e) => e.preventDefault()} className="w-full">
							<div className="flex flex-col md:flex-row items-stretch gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex items-center bg-white rounded-md border border-black/10 px-3 py-2 shadow-sm">
										<FiMapPin className="text-black/70 w-5 h-5 mr-2" />
										<input
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											placeholder="Search by city, area or hostel name (e.g., Hyderabad, Banjara Hills)"
											className="w-full bg-transparent outline-none text-black/90 placeholder-black/60 text-sm"
										/>
										<button
											type="button"
											onClick={() => {
												setPage(1);
												fetchHostels(1);
											}}
											className="ml-2 inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-1 text-sm"
										>
											<FiSearch className="w-4 h-4" />
											Search
										</button>
									</div>
								</div>

								<div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
									<div className="flex gap-3 w-full md:w-auto">
										<input
											type="number"
											value={minPrice}
											onChange={(e) => setMinPrice(e.target.value)}
											placeholder="Min ₹"
											className="w-full md:w-28 bg-white/90 rounded-md border border-black/10 px-3 py-2 text-black/90 text-sm"
										/>
										<input
											type="number"
											value={maxPrice}
											onChange={(e) => setMaxPrice(e.target.value)}
											placeholder="Max ₹"
											className="w-full md:w-28 bg-white/90 rounded-md border border-black/10 px-3 py-2 text-black/90 text-sm"
										/>
									</div>

									<div className="flex gap-3 w-full md:w-auto">
										<select
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
											className="w-full md:w-auto bg-white/90 rounded-md border border-black/10 px-3 py-2 text-sm text-black/90"
										>
											<option value="">Sort</option>
											<option value="price-asc">Price: Low → High</option>
											<option value="price-desc">Price: High → Low</option>
											<option value="created-desc">Newest</option>
											<option value="created-asc">Oldest</option>
										</select>

										<button
											type="button"
											onClick={handleReset}
											className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-black/90 text-white px-3 py-2 rounded-md text-sm"
											aria-label="Clear filters"
										>
											<FiFilter className="w-4 h-4" />
											Reset
										</button>
									</div>
								</div>
							</div>
						</form>
					</div>

					{/* RESULTS */}
					<div className="mt-8">
						{loading ? (
							<div className="p-8 text-center text-black/70">
								Loading hostels…
							</div>
						) : error ? (
							<div className="p-4 text-red-600">{error}</div>
						) : showEmpty ? (
							<div className="p-8 text-center text-black/70">
								No hostels match your filters.
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{hostels.map((p) => (
										<article
											key={p.id || p._id}
											className="bg-white/95 rounded-xl shadow-md overflow-hidden border border-black/5"
										>
											<div className="h-40 bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center text-black/40">
												{p.images && p.images.length > 0 ? (
													<img
														src={p.images[0]}
														alt={p.name}
														className="object-cover w-full h-full"
													/>
												) : p.img ? (
													<img
														src={p.img}
														alt={p.name}
														className="object-cover w-full h-full"
													/>
												) : (
													<div className="text-sm">Image</div>
												)}
											</div>

											<div className="p-4">
												<h4 className="text-lg font-semibold text-black">
													{p.name}
												</h4>
												<div className="text-sm text-black/70 mt-1">
													{p.location} • {p.beds ?? "-"} beds
												</div>

												<div className="mt-3 flex items-center justify-between">
													<div>
														<div className="text-sm text-black/80">
															Starting
														</div>
														<div className="text-lg font-bold text-black">
															₹{" "}
															{(p.minRent ?? p.priceFrom ?? 0).toLocaleString()}
														</div>
													</div>

													<div className="text-right">
														<div className="text-sm text-black/80">Up to</div>
														<div className="text-lg font-semibold text-black">
															₹ {(p.maxRent ?? p.priceTo ?? 0).toLocaleString()}
														</div>
													</div>
												</div>

												<div className="mt-4 flex items-center justify-between gap-3">
													<Link
														href={`/hosteldetailview?hostelId=${encodeURIComponent(
															p.id || p._id
														)}`}
													>
														<button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold">
															View
														</button>
													</Link>

													<button className="px-3 py-2 border border-black/10 rounded-md text-black/80 text-sm">
														Book Now
													</button>
												</div>
											</div>
										</article>
									))}
								</div>

								{/* Pagination */}
								<div className="mt-6 flex items-center justify-between">
									<div className="text-sm text-black/70">
										Showing page{" "}
										<span className="font-semibold">{meta.page}</span> of{" "}
										<span className="font-semibold">{meta.pages}</span> —{" "}
										<span className="font-medium">{meta.total}</span> total
									</div>

									<div className="flex items-center gap-2">
										<button
											onClick={prevPage}
											disabled={meta.page <= 1}
											className={`px-4 py-2 rounded-md text-sm ${
												meta.page <= 1
													? "bg-white/40 text-black/40 border"
													: "bg-black text-white"
											}`}
										>
											Prev
										</button>
										<button
											onClick={nextPage}
											disabled={meta.page >= meta.pages}
											className={`px-4 py-2 rounded-md text-sm ${
												meta.page >= meta.pages
													? "bg-white/40 text-black/40 border"
													: "bg-black text-white"
											}`}
										>
											Next
										</button>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
