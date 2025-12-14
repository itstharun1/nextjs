// pages/login.jsx
"use client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const [bannerTextValue, setBannerTextValue] = useState("");
	const [number, setNumber] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE = process.env.NEXT_PUBLIC_API || "";

	const fetchBannerText = async () => {
		try {
			const res = await fetch(`${API_BASE}/api/bannertext`);
			if (!res.ok) return; // silently ignore banner fetch failure
			const data = await res.json();
			setBannerTextValue(String(data?.offervalue ?? ""));
		} catch (err) {
			console.log("banner fetch error:", err);
		}
	};

	useEffect(() => {
		fetchBannerText();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [API_BASE]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		// Basic client validation
		const phoneTrim = String(number || "").trim();
		if (!phoneTrim) return setError("Please enter phone number.");
		if (!/^\+?\d{7,15}$/.test(phoneTrim))
			return setError("Enter a valid phone number.");
		if (!password) return setError("Please enter password.");

		setLoading(true);
		try {
			// Adjust endpoint if your backend uses a different login route
			const res = await fetch(`${API_BASE}/api/owners/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone: phoneTrim, password }),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				return setError(data.message || "Invalid credentials");
			}

			// success:
			const json = data; // already parsed above
			const token = json?.data?.token;
			const owner = json?.data?.owner;

			if (token) {
				localStorage.setItem("token", token);
				localStorage.setItem("owner", JSON.stringify(owner));
				localStorage.setItem("isOwnerLoggedIn", "true");
				localStorage.setItem("ownerId",number);
				console.log("Login successful:", owner);
				// Redirect to dashboard or homepage
				window.location.href = "/addhostels";
			}
		} catch (err) {
			console.error("login error:", err);
			setError("Network error. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Head>
				<title>Login — HostelsManager</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-linear-to-r from-blue-500 via-indigo-200 to-yellow-300 flex items-center justify-center p-6">
				<div className="w-full max-w-6xl shadow-xl rounded-2xl overflow-hidden bg-white/30 backdrop-blur-md">
					<div className="flex flex-col md:flex-row">
						{/* LEFT PANEL - logo + title - HIDDEN ON SMALL SCREENS */}
						<aside className="hidden md:flex md:w-1/2 items-center justify-center p-12 bg-linear-to-b from-blue-600 via-blue-400 to-indigo-200">
							<div className="text-center">
								<div className="mx-auto mb-6 w-28 h-28 rounded-full bg-white/20 flex items-center justify-center shadow-lg" />

								<h2 className="text-3xl font-extrabold text-white mb-2">
									Hostels<span className="text-yellow-300">Manager</span>
								</h2>
								<p className="text-white/90 max-w-xs mx-auto">
									Designed for hostel owners — list your property, manage
									operations effortlessly, and promote your hostel on a secure
									and trusted platform.
								</p>

								<div className="mt-6 flex items-center justify-center gap-3">
									<span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm">
										{bannerTextValue ? `${bannerTextValue}% OFF` : "Offer"}
									</span>
									<button className="px-4 py-2 rounded-lg border border-white/30 text-white bg-black/20">
										Explore Hostels
									</button>
								</div>
							</div>
						</aside>

						{/* RIGHT PANEL - LOGIN FORM (always visible) */}
						<main className="w-full md:w-1/2 p-8 md:p-12 bg-white/80">
							<div className="max-w-md mx-auto">
								<h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
									Welcome back
								</h3>
								<p className="text-sm text-slate-600 mb-6">
									Sign in to your account to continue to HostelsManager.
								</p>

								<form
									onSubmit={handleSubmit}
									className="space-y-4"
									aria-label="Login form"
								>
									<label className="block">
										<span className="text-sm text-slate-600">Number</span>
										<input
											type="tel"
											name="number"
											value={number}
											onChange={(e) => setNumber(e.target.value)}
											className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
											placeholder="9701000000"
											required
										/>
									</label>

									<label className="block">
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-600">Password</span>
										</div>
										<input
											type="password"
											name="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
											placeholder="Enter your password"
											required
										/>
									</label>

									<div className="flex items-center justify-between text-sm">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												name="remember"
												className="h-4 w-4 text-indigo-600"
											/>
											<span className="text-slate-600">Remember me</span>
										</label>
									</div>

									{error && <div className="text-red-600 text-sm">{error}</div>}

									<div>
										<button
											type="submit"
											disabled={loading}
											className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-slate-900 text-white font-medium hover:opacity-95 disabled:opacity-60"
										>
											{loading ? "Signing in..." : "Sign in"}
										</button>
									</div>

									<div className="pt-2 text-center text-sm text-slate-600">
										Don’t have an account?{" "}
										<a className="text-indigo-600 hover:underline" href="#">
											Contact Admin
										</a>
									</div>
								</form>

								<div className="mt-6 text-xs text-slate-500 text-center md:hidden">
									By signing in you agree to our{" "}
									<a className="text-indigo-600 underline" href="#">
										Terms
									</a>{" "}
									and{" "}
									<a className="text-indigo-600 underline" href="#">
										Privacy Policy
									</a>
									.
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		</>
	);
}
