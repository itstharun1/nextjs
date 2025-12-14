"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import FeatureCardsLoader from "./FeaturesCard";

/* client-only analytics */
const MiniAnalytics = dynamic(() => import("./MiniAnalytics"), { ssr: false });

/* Page */
export default function OurServicesPage() {
	const [demoMsg, setDemoMsg] = useState("");

	const handleCta = (label) => {
		setDemoMsg(`${label} clicked — demo / signup flow can open here.`);
		setTimeout(() => setDemoMsg(""), 3500);
	};

	return (
		<main className="w-full">
			{/* HERO (wide glass card like your screenshot) */}
			<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 pt-7 pb-2">
				<div className="w-full px-0">
					<div className="max-w-8xl mx-auto px-6 md:px-10">
						<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-3xl p-10 md:p-14 shadow-2xl">
							<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
								<div className="flex-1 pr-2">
									<h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black leading-tight">
										Hostel management made simple —{" "}
										<span className="block">from beds to bookings</span>
									</h1>

									<p className="mt-4 text-black/75 text-sm md:text-base max-w-2xl">
										Add properties, manage beds, auto-remind tenants, accept
										payments, and monitor revenue — all from your phone or
										computer. Start a 30-day free trial and see instant
										benefits.
									</p>

									<div className="mt-6 flex items-center gap-3">
										<Link
											href="/auth/register"
											className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg font-semibold shadow"
										>
											Start Free Trial
										</Link>
										<a
											href="#cards"
											className="inline-flex items-center px-5 py-3 bg-black/10 text-black rounded-lg"
										>
											See Services
										</a>
									</div>
								</div>

								{/* Right mini analytics framed like screenshot */}
								<div className="w-full md:w-72">
									<div className="bg-white/20 rounded-xl p-4 border border-white/10 shadow-sm">
										<MiniAnalytics />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SERVICES GRID */}
			<section
				id="cards"
				className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-5"
			>
				<div className="w-full px-0">
					<div className="max-w-9xl mx-auto px-6 md:px-6">
						<div className="text-center mb-8">
							<h2 className="text-2xl md:text-3xl font-semibold text-black">
								What we provide
							</h2>
							<p className="text-black/75 text-sm max-w-2xl mx-auto mt-2">
								Everything an owner needs to run a hostel: property setup, room
								& bed-level control, automated payments and reminders, tenant
								KYC, simple analytics, and promotion.
							</p>
						</div>
						<FeatureCardsLoader />

						{/* Short features & Live Dashboard preview (bigger glass panel like screenshot) */}
						<div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
							<div className="lg:col-span-2">
								<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
									<h3 className="text-lg font-semibold text-black">
										Live Dashboard (Preview)
									</h3>
									<p className="text-sm text-black/70 mt-2">
										Quick snapshot of revenue & occupancy. Click View Analytics
										for a full dashboard.
									</p>

									<div className="mt-6 bg-white/10 rounded-xl p-6 border border-white/10">
										<div className="flex items-center justify-between">
											<div>
												<div className="text-sm text-black/70">
													Monthly revenue
												</div>
												<div className="text-xl font-bold text-black">
													₹ 152,300
												</div>
											</div>

											<div className="text-right">
												<div className="text-sm text-black/70">Occupancy</div>
												<div className="text-xl font-semibold text-black">
													78%
												</div>
											</div>
										</div>

										<div className="mt-6">
											<div className="h-28 flex items-end gap-2">
												{/* simple bars */}
												{[60, 72, 88, 54, 76, 82, 100].map((h, i) => (
													<div
														key={i}
														className="w-3 bg-black/80 rounded-sm"
														style={{ height: `${h}px` }}
													/>
												))}
											</div>

											<div className="text-xs text-black/70 mt-3">
												Trends shown for last 7 periods • Exportable CSV/PDF
											</div>
										</div>
									</div>
								</div>
							</div>

							<aside className="space-y-4">
								<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-sm">
									<div className="text-sm text-black/70">Total properties</div>
									<div className="text-2xl font-bold text-black">3</div>
								</div>

								<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-sm">
									<div className="text-sm text-black/70">Total beds</div>
									<div className="text-2xl font-bold text-black">124</div>
								</div>
							</aside>
						</div>

						{/* CTA */}
						<div className="mt-12 text-center">
							<h3 className="text-xl font-semibold text-black">
								Ready to manage your hostel the easy way?
							</h3>
							<p className="text-sm text-black/75 mt-2">
								Start your 30-day free trial today — no complicated setup.
							</p>

							<div className="mt-4 flex justify-center gap-3">
								<Link
									href="/auth/register"
									className="px-6 py-3 bg-black text-white rounded-lg font-semibold shadow"
								>
									Start Free Trial
								</Link>
								<Link
									href="/contact"
									className="px-6 py-3 bg-black/10 text-black rounded-lg"
								>
									Contact Sales
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* toast */}
			{demoMsg && (
				<div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded-lg shadow">
					{demoMsg}
				</div>
			)}
		</main>
	);
}
