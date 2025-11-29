// components/ServicesSection.jsx
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import { FiMapPin, FiSearch, FiFilter } from "react-icons/fi";

const SAMPLE_PROPERTIES = [
	{
		id: 1,
		name: "BlueSky Residency",
		location: "Hyderabad",
		beds: 3,
		priceFrom: 2500,
		priceTo: 4500,
		img: "", // optional image url
	},
	{
		id: 2,
		name: "Sunrise PG",
		location: "Secunderabad",
		beds: 1,
		priceFrom: 1800,
		priceTo: 3200,
		img: "",
	},
	{
		id: 3,
		name: "Green Residency",
		location: "Banjara Hills",
		beds: 4,
		priceFrom: 4200,
		priceTo: 6500,
		img: "",
	},
	{
		id: 4,
		name: "CityStay Hostels",
		location: "Hitech City",
		beds: 2,
		priceFrom: 3000,
		priceTo: 5200,
		img: "",
	},
];

export default function ServicesSection() {
	const [query, setQuery] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [onlyVerified, setOnlyVerified] = useState(false); // example filter
	const [sortBy, setSortBy] = useState(""); // example sort

	// simple filter logic on sample data
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		let list = SAMPLE_PROPERTIES.filter((p) => {
			if (q) {
				const matchesName = p.name.toLowerCase().includes(q);
				const matchesLocation = p.location.toLowerCase().includes(q);
				if (!matchesName && !matchesLocation) return false;
			}
			if (minPrice) {
				if (p.priceTo < Number(minPrice)) return false;
			}
			if (maxPrice) {
				if (p.priceFrom > Number(maxPrice)) return false;
			}
			// onlyVerified not used in sample data; keep for real data
			return true;
		});

		if (sortBy === "price-asc") {
			list = list.sort((a, b) => a.priceFrom - b.priceFrom);
		} else if (sortBy === "price-desc") {
			list = list.sort((a, b) => b.priceTo - a.priceTo);
		}

		return list;
	}, [query, minPrice, maxPrice, sortBy]);

	return (
		<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-3">
			<div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
				{/* Glass container */}
				<div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg mx-0">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h3 className="text-2xl md:text-3xl font-semibold text-black">
								Find Hostels by Location & Price
							</h3>
							<p className="mt-2 text-sm text-black/75 max-w-xl">
								Search verified hostels near you — filter by location, price
								range and features. Start with pre-listed hostels from ₹1,800 to
								₹6,500.
							</p>
						</div>

						{/* Small USP / micro copy */}
						<div className="text-sm text-black/70">
							<span className="font-semibold">Instant results</span> · Verified
							listings · Secure booking
						</div>
					</div>

					{/* SEARCH BAR */}
					<div className="mt-6">
						<form onSubmit={(e) => e.preventDefault()} className="w-full">
							{/* Parent: Column on mobile, Row on md+ */}
							<div className="flex flex-col md:flex-row items-stretch gap-3">
								{/* Location / search input */}
								<div className="flex-1 min-w-0">
									<label className="sr-only">Search location or hostel</label>
									<div className="flex items-center bg-white/90 rounded-md border border-black/10 px-3 py-2 shadow-sm">
										<FiMapPin className="text-black/70 w-5 h-5 mr-2" />
										<input
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											placeholder="Search by city, area or hostel name (e.g., Hyderabad, Banjara Hills)"
											className="w-full bg-transparent outline-none text-black/90 placeholder-black/60 text-sm"
										/>
										<button
											type="button"
											className="ml-2 inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-1 text-sm"
										>
											<FiSearch className="w-4 h-4" />
											Search
										</button>
									</div>
								</div>

								{/* Price filters + Sort + Reset */}
								<div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
									{/* Price filters */}
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

									{/* Filter / sort + reset */}
									<div className="flex gap-3 w-full md:w-auto">
										<select
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
											className="w-full md:w-auto bg-white/90 rounded-md border border-black/10 px-3 py-2 text-sm text-black/90"
										>
											<option value="">Sort</option>
											<option value="price-asc">Price: Low → High</option>
											<option value="price-desc">Price: High → Low</option>
										</select>

										<button
											type="button"
											onClick={() => {
												setQuery("");
												setMinPrice("");
												setMaxPrice("");
												setSortBy("");
												setOnlyVerified(false);
											}}
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

					{/* RESULTS & PRE-LISTED CARDS */}
					<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
						{filtered.length === 0 ? (
							<div className="col-span-full text-center text-black/70 py-8">
								No hostels match your filters.
							</div>
						) : (
							filtered.slice(0, 3).map((p) => (
								<article
									key={p.id}
									className="bg-white/95 rounded-xl shadow-md overflow-hidden border border-black/5"
								>
									{/* image placeholder */}
									<div className="h-40 bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center text-black/40">
										{p.img ? (
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
											{p.location} • {p.beds} beds
										</div>

										<div className="mt-3 flex items-center justify-between">
											<div>
												<div className="text-sm text-black/80">Starting</div>
												<div className="text-lg font-bold text-black">
													₹ {p.priceFrom.toLocaleString()}
												</div>
											</div>

											<div className="text-right">
												<div className="text-sm text-black/80">Up to</div>
												<div className="text-lg font-semibold text-black">
													₹ {p.priceTo.toLocaleString()}
												</div>
											</div>
										</div>

										<div className="mt-4 flex items-center justify-between gap-3">
											<button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold">
												View
											</button>
											<button className="px-3 py-2 border border-black/10 rounded-md text-black/80 text-sm">
												Book Now
											</button>
										</div>
									</div>
								</article>
							))
						)}
					</div>

					{/* view more button */}
					<div className="mt-6 text-center">
						<button className="px-6 py-2 bg-black text-white rounded-md font-medium">
							View All Hostels
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
