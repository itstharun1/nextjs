// app/hostelsview/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = (
	process.env.NEXT_PUBLIC_API || "http://localhost:4000"
).replace(/\/+$/, "");

export default function HostelsViewPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const hostelId = searchParams.get("hostelId");

	const [hostel, setHostel] = useState(null);
	const [floors, setFloors] = useState([]); // [{ floorId, floorName, rooms: [...] }]
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!hostelId) return;
		let cancelled = false;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				// 1) fetch hostel document
				const hres = await axios.get(
					`${API_BASE}/api/hostels/${encodeURIComponent(hostelId)}`
				);
				const hostelDoc = hres?.data?.data ?? hres?.data ?? null;
				if (!hostelDoc) {
					throw new Error("Hostel not found");
				}

				if (cancelled) return;
				setHostel(hostelDoc);

				// Normalize floors
				const rawFloors = Array.isArray(hostelDoc.floors)
					? hostelDoc.floors
					: Array.isArray(hostelDoc.floorNames)
					? hostelDoc.floorNames.map((name, i) => ({
							floorName:
								typeof name === "string"
									? name
									: name.floorName || `Floor ${i + 1}`,
							floorId:
								(typeof name === "object" && (name.floorId || name.id)) ||
								`floor_${i + 1}`,
					  }))
					: [];

				if (rawFloors.length === 0) {
					setFloors([]);
					setLoading(false);
					return;
				}

				// 2) fetch rooms for all floors in parallel for speed
				const roomPromises = rawFloors.map(async (f) => {
					const floorId = f.floorId || f._id || f.id;
					try {
						const rres = await axios.get(`${API_BASE}/api/addroomandbeds`, {
							params: { floorId },
						});
						const roomsJson = rres?.data ?? {};
						const rooms = Array.isArray(roomsJson.rooms)
							? roomsJson.rooms
							: Array.isArray(roomsJson)
							? roomsJson
							: [];
						return {
							floorId,
							floorName: f.floorName || `Floor ${floorId}`,
							rooms,
						};
					} catch (err) {
						return {
							floorId,
							floorName: f.floorName || `Floor ${floorId}`,
							rooms: [],
							_error: err?.response?.data?.message || err.message,
						};
					}
				});

				const floorsWithRooms = await Promise.all(roomPromises);
				if (!cancelled) setFloors(floorsWithRooms);
			} catch (err) {
				if (!cancelled)
					setError(
						err?.response?.data?.message ||
							err.message ||
							"Failed to load hostel"
					);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		load();
		return () => {
			cancelled = true;
		};
	}, [hostelId]);

	function countAvailableBeds(beds = []) {
		return beds.reduce((acc, b) => {
			const occupied = !!(b.occupantName || b.occupantEmail);
			return acc + (occupied ? 0 : 1);
		}, 0);
	}

	// If no hostelId, guide the user back
	if (!hostelId) {
		return (
			<div className="p-8">
				<div className="text-lg font-semibold">Hostel not selected</div>
				<p className="mt-2 text-sm text-black/70">
					Open the hostels listing and click{" "}
					<span className="font-medium">View</span> for a hostel.
				</p>
				<div className="mt-4">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 bg-black text-white rounded-md"
					>
						Go back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 py-6">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-semibold">Hostel overview</h1>
						<p className="text-sm text-black/70 mt-1">
							Shows floors, rooms and bed availability for the selected hostel.
						</p>
					</div>

					<div className="text-right">
						<div className="text-sm text-black/80">Hostel</div>
						<div className="font-semibold text-lg">{hostel?.name ?? "—"}</div>
					</div>
				</div>

				<div className="space-y-6">
					{loading ? (
						<div className="p-6 bg-white rounded-xl shadow">Loading…</div>
					) : error ? (
						<div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
					) : floors.length === 0 ? (
						<div className="p-6 bg-white rounded-xl shadow">
							No floors available for this hostel.
						</div>
					) : (
						floors.map((f) => {
							const totalBeds = (f.rooms || []).reduce(
								(s, r) => s + (r.beds ? r.beds.length : 0),
								0
							);
							const availableBeds = (f.rooms || []).reduce(
								(s, r) => s + countAvailableBeds(r.beds),
								0
							);

							return (
								<section
									key={f.floorId || f.floorName}
									className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg"
								>
									<div className="flex items-center justify-between mb-4">
										<div>
											<h2 className="text-lg font-semibold">{f.floorName}</h2>
											<div className="text-sm text-black/70">
												Rooms: {(f.rooms || []).length} • Beds: {totalBeds} •
												Available: {availableBeds}
											</div>
										</div>
										
									</div>

									<div className="overflow-x-auto">
										<table className="w-full text-sm table-auto">
											<thead>
												<tr className="text-left text-black/70 border-b">
													<th className="py-2">Room</th>
													<th className="py-2">Total beds</th>
													<th className="py-2">Available</th>
													<th className="py-2">Status</th>
												</tr>
											</thead>

											<tbody>
												{(f.rooms || []).map((r) => {
													const total = r.beds ? r.beds.length : 0;
													const avail = countAvailableBeds(r.beds);
													const isFull = avail === 0;
													return (
														<tr
															key={r.roomId || r._id}
															className="align-top border-b last:border-b-0"
														>
															<td className="py-3">
																<div className="font-medium">
																	{r.roomName || "Unnamed room"}
																</div>
																
															</td>
															<td className="py-3">{total}</td>
															<td className="py-3">{avail}</td>
															<td className="py-3">
																<span
																	className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
																		isFull
																			? "bg-red-600 text-white"
																			: "bg-green-700 text-white"
																	}`}
																>
																	{isFull ? "Full" : "Has space"}
																</span>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</section>
							);
						})
					)}
				</div>

				<div className="mt-6">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 bg-white border rounded-md"
					>
						Back
					</button>
				</div>
			</div>
		</div>
	);
}

function truncateId(id = "") {
	if (!id) return "";
	const s = String(id);
	return s.length > 12 ? `${s.slice(0, 8)}...${s.slice(-4)}` : s;
}
