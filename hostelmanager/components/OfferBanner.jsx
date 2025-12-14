"use client";
import React, { useEffect, useState } from "react";
const OfferBanner = () => {
	const API_BASE =  process.env.NEXT_PUBLIC_API;

	// State to store banner data
	const [bannerText, setBannerText] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [form, setForm] = useState({
		title: "",
		subtitle: "",
		offertext: "",
		offervalue: "",
	});

	// Reusable function to fetch banner text
	const fetchBannerText = async () => {
		console.log("API_BASE is", API_BASE);
		setLoading(true);
		setError(null);

		try {
			const res = await fetch(`${API_BASE}/api/bannertext`);
			if (!res.ok) throw new Error("Failed to fetch banner text");

			const data = await res.json();

			// Save the response in state
			setBannerText(data);

			// Populate form from API
			setForm({
				title: data?.title || "",
				subtitle: data?.subtitle || "",
				offertext: data?.offertext || "",
				offervalue: data?.offervalue || "",
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Call once when page loads
	useEffect(() => {
		fetchBannerText();
	}, [API_BASE]);

	return (
		<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 pt-14 md:pt-20 pb-6">
			<div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
				{/* Glass Card */}
				<div className="w-full mx-auto px-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 md:p-12 shadow-xl">
					{/* TOP CONTENT */}
					<div className="flex flex-col md:flex-row items-center justify-between gap-8">
						{/* TEXT SIDE */}
						<div className="text-center md:text-left flex-1">
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-snug">
								{form.title || "Discover Your Perfect Hostel Stay Today!"}
							</h2>

							<p className="mt-3 text-black/80 text-sm md:text-base max-w-xl mx-auto md:mx-0">
								{form.subtitle ||
									"Explore top-rated hostels with unbeatable offers. Book now and save big on your next adventure!"}
							</p>
						</div>

						{/* RIGHT SIDE (BADGE + BUTTONS) */}
						<div className="flex flex-col items-center md:items-end gap-4">
							{/* 50% OFF BADGE */}
							<div
								className="inline-flex items-center justify-center rounded-full 
                bg-gradient-to-r from-red-500 to-orange-400
                text-white font-bold px-6 py-2 text-xl shadow-md"
							>
								{form.offervalue || "10"} % OFF
							</div>

							{/* CTA BUTTONS */}
							<div className="flex gap-3">
								<button className="px-5 py-2 rounded-lg bg-black text-white font-semibold hover:scale-[1.03] transition">
									Explore Hostels
								</button>

								<button className="px-5 py-2 rounded-lg bg-black/20 border border-black/30 text-black font-medium hover:bg-black/10 transition">
									Add Property
								</button>
							</div>
						</div>
					</div>

					{/* BOTTOM SMALL NOTE */}
					<p className="text-center md:text-left mt-6 text-xs text-black/70 tracking-wide">
						{form.offertext ||
							"Offer valid for new bookings only. Terms and conditions apply."}
					</p>
				</div>
			</div>
		</section>
	);
};

export default OfferBanner;
