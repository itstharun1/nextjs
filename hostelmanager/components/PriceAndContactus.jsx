// components/PricingContact.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Check, Mail, Phone } from "lucide-react";
import Link from "next/link";

/**
 * Two card layout: Pricing + Contact Us
 * - Uses Tailwind classes consistent with your theme
 * - Adds robust backdrop blur with vendor prefix + fallback
 * - Responsive and accessible
 */

export default function PricingContact() {
	const [ready, setReady] = useState(false);

	// small ready flag to avoid layout flicker while fonts/CSS settle
	useEffect(() => {
		// short delay to let CSS render; adjust to 10-120 ms if needed
		const t = setTimeout(() => setReady(true), 60);
		return () => clearTimeout(t);
	}, []);

	return (
		<section className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-5">
			<div className="max-w-8xl mx-auto px-6 md:px-10">
				<div className="bg-white/12 backdrop-blur-md -webkit-backdrop-filter rounded-3xl border border-white/20 p-6 md:p-10 shadow-2xl">
					<div className="flex flex-col md:flex-row gap-6 items-start">
						{/* Pricing Card */}
						<div
							className={`w-full md:w-1/2 rounded-2xl p-6 md:p-8 border border-white/30 shadow-lg relative overflow-hidden ${
								ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
							} transition-all duration-350`}
						>
							{/* Backdrop + fallback element */}
							<div
								className="absolute inset-0 -z-10 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md"
								aria-hidden
							/>
							<div
								className="absolute inset-0 -z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
								aria-hidden
							/>

							<div className="flex items-center justify-between">
								<h3 className="text-lg md:text-xl font-extrabold text-black">
									Pricing
								</h3>
								<span className="inline-flex items-center gap-2 text-sm bg-black text-white px-3 py-1 rounded-full">
									Popular
								</span>
							</div>

							<p className="mt-3 text-black/75">
								Simple plans that scale with your hostels. No hidden fees,
								monthly or yearly billing available.
							</p>

							{/* Plans */}
							<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="rounded-xl border border-white/25 p-4 bg-gradient-to-br from-white/80 to-white/60">
									<div className="flex items-baseline justify-between gap-3">
										<div>
											<h4 className="text-lg font-semibold text-black">
												Starter
											</h4>
											<p className="text-xs text-black/60">
												Small hostels — basic features
											</p>
										</div>
										<div className="text-right">
											<div className="text-xl font-extrabold text-black">
												₹499
											</div>
											<div className="text-xs text-black/60">per month</div>
										</div>
									</div>
									<ul className="mt-3 text-sm text-black/70 space-y-2">
										<li className="flex items-center gap-2">
											<Check className="w-4 h-4" /> Manage up to 20 beds
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-4 h-4" /> Basic analytics
										</li>
									</ul>
								</div>

								<div className="rounded-xl border border-white/25 p-4 bg-gradient-to-br from-white/90 to-white/70 shadow-md">
									<div className="flex items-baseline justify-between gap-3">
										<div>
											<h4 className="text-lg font-semibold text-black">Pro</h4>
											<p className="text-xs text-black/60">
												Growing hostels — automation & payments
											</p>
										</div>
										<div className="text-right">
											<div className="text-xl font-extrabold text-black">
												₹999
											</div>
											<div className="text-xs text-black/60">per month</div>
										</div>
									</div>
									<ul className="mt-3 text-sm text-black/70 space-y-2">
										<li className="flex items-center gap-2">
											<Check className="w-4 h-4" /> Unlimited beds
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-4 h-4" /> Automated reminders &
											invoicing
										</li>
										<li className="flex items-center gap-2">
											<Check className="w-4 h-4" /> Priority support
										</li>
									</ul>
								</div>
							</div>

							<div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
								<Link
									href="/auth/register"
									className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg font-semibold shadow"
								>
									Start Free Trial
								</Link>
								<a
									href="#contact"
									className="inline-flex items-center justify-center px-5 py-3 bg-black/10 text-black rounded-lg"
								>
									Talk to Sales
								</a>
							</div>
						</div>

						{/* Contact Card */}
						<div
							id="contact"
							className={`w-full md:w-1/2 rounded-2xl p-6 md:p-8 border border-white/30 shadow-lg relative overflow-hidden ${
								ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
							} transition-all duration-350`}
						>
							{/* Backdrop + fallback element */}
							<div
								className="absolute inset-0 -z-10 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md"
								aria-hidden
							/>
							<div
								className="absolute inset-0 -z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
								aria-hidden
							/>

							<div className="flex items-center justify-between">
								<h3 className="text-lg md:text-xl font-extrabold text-black">
									Contact Us
								</h3>
								<span className="inline-flex items-center gap-2 text-sm bg-black/10 text-black px-3 py-1 rounded-full">
									We are here to help
								</span>
							</div>

							<p className="mt-3 text-black/75">
								Questions about pricing, onboarding or a custom plan? Drop us a
								message — we reply within 24 hours.
							</p>

							<ContactForm />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

/* Contact form component (client-side only) */
function ContactForm() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [status, setStatus] = useState(null);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((s) => ({ ...s, [name]: value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setSubmitting(true);
		setStatus(null);

		// Basic client-side validation
		if (!form.name || !form.email || !form.message) {
			setStatus({ ok: false, message: "Please fill name, email and message." });
			setSubmitting(false);
			return;
		}

		// Demo: no backend here. We'll simulate an async request.
		try {
			await new Promise((res) => setTimeout(res, 700));
			setStatus({
				ok: true,
				message: "Thanks! We'll get back to you within 24 hours.",
			});
			setForm({ name: "", email: "", phone: "", message: "" });
		} catch (err) {
			setStatus({
				ok: false,
				message: "Something went wrong. Try again later.",
			});
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mt-5">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<label className="block">
					<span className="sr-only">Name</span>
					<input
						name="name"
						value={form.name}
						onChange={handleChange}
						placeholder="Your name"
						className="w-full rounded-lg border border-white/20 bg-white/80 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
						required
					/>
				</label>
				<label className="block">
					<span className="sr-only">Email</span>
					<input
						name="email"
						type="email"
						value={form.email}
						onChange={handleChange}
						placeholder="Email address"
						className="w-full rounded-lg border border-white/20 bg-white/80 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
						required
					/>
				</label>
				<label className="block md:col-span-2">
					<span className="sr-only">Phone</span>
					<input
						name="phone"
						value={form.phone}
						onChange={handleChange}
						placeholder="Phone (optional)"
						className="w-full rounded-lg border border-white/20 bg-white/80 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
					/>
				</label>
				<label className="block md:col-span-2">
					<span className="sr-only">Message</span>
					<textarea
						name="message"
						rows={4}
						value={form.message}
						onChange={handleChange}
						placeholder="How can we help?"
						className="w-full rounded-lg border border-white/20 bg-white/80 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
						required
					/>
				</label>
			</div>

			<div className="mt-4 flex items-center gap-3">
				<button
					type="submit"
					disabled={submitting}
					className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg font-medium shadow disabled:opacity-60"
				>
					{submitting ? "Sending…" : "Send message"}
				</button>

				<div className="flex flex-col md:flex-row gap-3">
					<a
						href="mailto:support@example.com"
						className="inline-flex items-center gap-2 px-4 py-2 bg-black/10 text-black rounded-lg text-sm"
					>
						<Mail className="w-4 h-4" /> Email
					</a>

					<a
						href="tel:+911234567890"
						className="inline-flex items-center gap-2 px-4 py-2 bg-black/10 text-black rounded-lg text-sm"
					>
						<Phone className="w-4 h-4" /> Call
					</a>
				</div>
			</div>

			{status && (
				<div
					className={`mt-3 text-sm ${
						status.ok ? "text-green-700" : "text-rose-600"
					}`}
				>
					{status.message}
				</div>
			)}
		</form>
	);
}
