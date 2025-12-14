"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * HostelFloorsManager (App Router)
 *
 * - Fetches hostel by ownerId (prop -> search param -> localStorage)
 * - Displays floors as cards and provides "Add Rooms" navigation to:
 *    /addrooms/[ownerId]/[floorId]
 *
 * NOTE: This is an App Router client component.
 */

export default function HostelFloorsManager({ ownerId: ownerIdProp = "" }) {
	const searchParams = useSearchParams();
	// determine ownerId from prop or search param; localStorage read is done in useEffect
	const ownerIdFromUrl = searchParams ? searchParams.get("ownerId") : null;

	const [ownerId, setOwnerId] = useState(ownerIdProp || ownerIdFromUrl || "");
	const [loading, setLoading] = useState(true);
	const [hostel, setHostel] = useState(null);
	const [error, setError] = useState("");

	const API_BASE = process.env.NEXT_PUBLIC_API || "";

	// If ownerId not provided via prop or URL, try localStorage once on mount
	useEffect(() => {
		if (!ownerId) {
			try {
				const ls =
					typeof window !== "undefined"
						? localStorage.getItem("ownerId")
						: null;
				if (ls) setOwnerId(ls);
			} catch (err) {
				// ignore
			}
		}
	}, [ownerId]);

	// Fetch hostel when ownerId becomes available
	useEffect(() => {
		if (!ownerId) {
			setError("Owner ID not provided.");
			setLoading(false);
			return;
		}

		let mounted = true;

		async function fetchHostel() {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(
					`${API_BASE}/api/hostels/${encodeURIComponent(ownerId)}`
				);
				if (!res.ok) {
					if (res.status === 404) {
						if (!mounted) return;
						setHostel(null);
						setError("No hostel found for this owner.");
						setLoading(false);
						return;
					}
					const text = await res.text();
					throw new Error(`API error ${res.status}: ${text}`);
				}
				const json = await res.json();
				const doc = json.data ? json.data : json;
				if (!mounted) return;
				setHostel(doc);
				setLoading(false);
			} catch (err) {
				console.error("fetchHostel error", err);
				if (!mounted) return;
				setError("Failed to load hostel. Please try again.");
				setLoading(false);
			}
		}

		fetchHostel();
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ownerId, API_BASE]);

	// normalize floors: accept new `floors` array of objects or legacy `floorNames` array of strings
	function getNormalizedFloors(doc) {
		if (!doc) return [];
		if (Array.isArray(doc.floors) && doc.floors.length > 0) {
			return doc.floors.map((f, i) => ({
				floorName: f.floorName || f.name || `Floor ${i + 1}`,
				floorId: f.floorId || f.id || `floor_${i + 1}`,
				ownerId: f.ownerId || doc.id || ownerId,
			}));
		}
		if (Array.isArray(doc.floorNames) && doc.floorNames.length > 0) {
			return doc.floorNames.map((f, i) => {
				if (typeof f === "string") {
					return {
						floorName: f,
						floorId: `floor_${i + 1}`,
						ownerId: doc.id || ownerId,
					};
				}
				return {
					floorName: f.floorName || f.name || `Floor ${i + 1}`,
					floorId: f.floorId || f.id || `floor_${i + 1}`,
					ownerId: f.ownerId || doc.id || ownerId,
				};
			});
		}
		return [];
	}

	function getAddRoomsHref(ownerIdParam, floorId) {
		return `/addroomswithbeds/${encodeURIComponent(
			ownerIdParam
		)}/${encodeURIComponent(floorId)}`;
	}

	return (
		<div className="max-w-6xl mx-auto p-6 text-black">
			<div className="flex items-center justify-center gap-3 m-4">
				<Link
					href="/hosteldashboard"
					aria-label="View Dashboard"
					className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-700 to-amber-400 text-white shadow-lg
             hover:scale-[1.02] transform transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-blue-300/40"
				>
					<span className="text-sm font-semibold">View Dashboard</span>
				</Link>
			</div>

			<header className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-semibold text-slate-900">
						Manage Floors
					</h2>
					<p className="text-sm text-black/70">
						Add rooms to a floor by clicking the button on a floor card.
					</p>
				</div>

				<div>
					<span className="text-xs text-black/70">Owner ID</span>
					<div className="mt-1 text-sm font-medium text-slate-800">
						{ownerId || "—"}
					</div>
				</div>
			</header>

			{loading && (
				<div className="py-10 flex items-center justify-center">
					<div className="text-slate-600">Loading floors…</div>
				</div>
			)}

			{!loading && error && (
				<div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
					{error}
				</div>
			)}

			{!loading && !error && !hostel && (
				<div className="rounded-md border border-yellow-200 bg-yellow-50 p-6 text-slate-700">
					No hostel found. Create a hostel first.
				</div>
			)}

			{!loading && hostel && (
				<>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium text-slate-800">
								{hostel.name}
							</h3>
							<div className="text-sm text-black/70">{hostel.location}</div>
						</div>

						<div className="text-sm text-slate-600">
							Floors:{" "}
							<span className="font-semibold">
								{getNormalizedFloors(hostel).length}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{getNormalizedFloors(hostel).map((floor) => (
							<div
								key={floor.floorId}
								className="w-full mx-auto px-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 md:p-12 shadow-xl"
							>
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
										{floor.floorName
											? floor.floorName.charAt(0).toUpperCase()
											: "F"}
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-semibold text-slate-900">
											{floor.floorName}
										</h4>
										<div className="text-xs text-slate-500 mt-1">
											Floor ID:{" "}
											<span className="font-mono">{floor.floorId}</span>
										</div>
										<div className="text-sm text-slate-600 mt-2">
											Owner:{" "}
											<span className="font-medium">{floor.ownerId}</span>
										</div>
									</div>
								</div>

								<div className="mt-4 flex items-center justify-between gap-3">
									{/* App Router - Link accepts className directly */}
									<Link
										href={`/addroomswithbeds?ownerId=${ownerId}&floorId=${floor.floorId}&floorName=${floor.floorName}`}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm hover:scale-105 transform transition"
									>
										+ View/Add Rooms
									</Link>

									<div className="text-xs text-slate-500">
										Tap to manage rooms
									</div>
								</div>
							</div>
						))}
					</div>

					{getNormalizedFloors(hostel).length === 0 && (
						<div className="mt-6 rounded-md border border-dashed border-slate-200 p-6 text-center">
							<p className="text-slate-700 mb-3">No floors yet.</p>
							<Link
								href={`/addrooms/${encodeURIComponent(ownerId)}/new`}
								className="inline-block px-4 py-2 bg-slate-900 text-white rounded-md"
							>
								Create first floor & Add rooms
							</Link>
						</div>
					)}
				</>
			)}
		</div>
	);
}
