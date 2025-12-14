"use client";

/**
 * IncomeReport — view-only + call button version
 *
 * - Totals include all matching entries (history + current)
 * - Cards show only pending > 0
 * - "Call" button opens device dialer (tel:)
 * - "View Bed" button opens: /addroomswithbeds?ownerId=<ownerId>&floorId=<floorId>&roomId=<roomId>
 * - No payment APIs or "Mark Paid" buttons
 *
 * Usage: replace your current IncomeReport file with this.
 */

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ---------- Config ---------- */
const ROOT_API = (
	process.env.NEXT_PUBLIC_API || "http://localhost:4000"
).replace(/\/+$/, "");
const HOSTELS_ENDPOINT = `${ROOT_API}/api/hostels`;
const ADDROOMANDBEDS_ENDPOINT = `${ROOT_API}/api/addroomandbeds`;

/* ---------- Helpers ---------- */

function parseDateSafe(s) {
	if (!s) return null;
	const parts = String(s).split("-");
	if (parts.length >= 3) {
		const y = Number(parts[0]);
		const m = Number(parts[1]) - 1;
		const d = Number(parts[2].slice(0, 2));
		return new Date(y, m, d);
	}
	const date = new Date(s);
	return isNaN(date.getTime()) ? null : date;
}
function startOfDay(dt) {
	if (!dt) return null;
	const d = new Date(dt);
	d.setHours(0, 0, 0, 0);
	return d;
}
function endOfDay(dt) {
	if (!dt) return null;
	const d = new Date(dt);
	d.setHours(23, 59, 59, 999);
	return d;
}
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
	if (!aStart || !aEnd || !bStart || !bEnd) {
		if (bStart && bEnd && aStart && aEnd)
			return !(aEnd < bStart || bEnd < aStart);
		return false;
	}
	return !(aEnd < bStart || bEnd < aStart);
}
function fmtCurrency(n) {
	if (typeof n !== "number") n = Number(n) || 0;
	return n.toLocaleString("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	});
}
function defaultDateRange() {
	const now = new Date();
	const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const lastOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return {
		start: startOfDay(firstOfPrevMonth),
		end: endOfDay(lastOfCurrentMonth),
	};
}
function formatInputDate(dt) {
	if (!dt) return "";
	const d = new Date(dt);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/* ---------- Component ---------- */

export default function IncomeReport() {
	const [hostel, setHostel] = useState(null);
	const [floorsWithRooms, setFloorsWithRooms] = useState([]); // {floorId, floorName, rooms}
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const defRange = defaultDateRange();
	const [startDateInput, setStartDateInput] = useState(
		formatInputDate(defRange.start)
	);
	const [endDateInput, setEndDateInput] = useState(
		formatInputDate(defRange.end)
	);

	// allFound: all matching entries (history + current) used for totals
	const [allFound, setAllFound] = useState([]);
	// entries: pending-only shown as cards
	const [entries, setEntries] = useState([]);
	const [searching, setSearching] = useState(false);

	// totals computed from allFound
	const totals = useMemo(() => {
		const tot = {
			expected: 0,
			received: 0,
			pending: 0,
			countAll: 0,
			countPending: 0,
		};
		for (const e of allFound) {
			const expected = Number(e.actualAmount || 0);
			const received = Number(e.amountPaid || 0);
			const pending = Math.max(0, expected - received);
			tot.expected += expected;
			tot.received += received;
			tot.pending += pending;
			tot.countAll += 1;
			if (pending > 0) tot.countPending += 1;
		}
		return tot;
	}, [allFound]);

	/* ---------- Load hostel and rooms sequentially ---------- */
	useEffect(() => {
		let cancelled = false;
		async function loadAll() {
			setLoading(true);
			setError("");
			try {
				const ownerId =
					typeof window !== "undefined"
						? localStorage.getItem("ownerId")
						: null;
				if (!ownerId) {
					setError("ownerId not found in localStorage. Please set ownerId.");
					setLoading(false);
					return;
				}

				// fetch hostel
				const hResp = await axios.get(
					`${HOSTELS_ENDPOINT}/${encodeURIComponent(ownerId)}`
				);
				const hostelDoc = hResp?.data?.data ?? hResp?.data ?? null;
				if (!hostelDoc) {
					setError("No hostel data returned.");
					setLoading(false);
					return;
				}
				if (cancelled) return;
				setHostel(hostelDoc);

				const floors =
					Array.isArray(hostelDoc.floors) && hostelDoc.floors.length > 0
						? hostelDoc.floors
						: [];
				if (!floors.length) {
					setFloorsWithRooms([]);
					setLoading(false);
					return;
				}

				// sequentially fetch rooms for every floor
				const floorsAccum = [];
				for (const f of floors) {
					if (cancelled) break;
					const floorId = f.floorId || f._id || f.id;
					const floorName =
						f.floorName ||
						f.name ||
						`Floor ${String(floorId).slice(0, 6) || ""}`;
					if (!floorId) {
						floorsAccum.push({ floorId: null, floorName, rooms: [] });
						continue;
					}
					try {
						const roomsRes = await axios.get(ADDROOMANDBEDS_ENDPOINT, {
							params: { floorId },
						});
						const roomsJson = roomsRes?.data ?? {};
						const rooms = Array.isArray(roomsJson.rooms)
							? roomsJson.rooms
							: Array.isArray(roomsJson)
							? roomsJson
							: [];
						floorsAccum.push({ floorId, floorName, rooms });
					} catch (err) {
						console.error("Error loading rooms for floor", floorId, err);
						floorsAccum.push({
							floorId,
							floorName,
							rooms: [],
							_error: "Failed to load rooms",
						});
					}
				}

				if (!cancelled) {
					setFloorsWithRooms(floorsAccum);
					setLoading(false);
				}
			} catch (err) {
				console.error(err);
				if (!cancelled)
					setError(
						err?.response?.data?.message ||
							err?.message ||
							"Failed to load data"
					);
				setLoading(false);
			}
		}

		loadAll();
		return () => {
			cancelled = true;
		};
	}, []);

	/* ---------- Search: flatten history + current into entries ---------- */
	async function handleSearch(e) {
		e?.preventDefault?.();
		setSearching(true);
		setAllFound([]);
		setEntries([]);
		try {
			const start = startOfDay(parseDateSafe(startDateInput));
			const end = endOfDay(parseDateSafe(endDateInput));
			if (!start || !end || start > end) {
				alert("Invalid date range. Make sure start <= end.");
				setSearching(false);
				return;
			}

			const found = [];

			for (const floor of floorsWithRooms) {
				for (const room of floor.rooms || []) {
					for (const bed of room.beds || []) {
						// history
						const hist = Array.isArray(bed.history) ? bed.history : [];
						for (const h of hist) {
							const entryStart =
								parseDateSafe(h.joinDate) ||
								parseDateSafe(h.archivedAt) ||
								null;
							const entryEnd =
								parseDateSafe(h.endDate) || parseDateSafe(h.archivedAt) || null;
							if (!entryStart && !entryEnd) continue;
							const aStart = entryStart ? startOfDay(entryStart) : start;
							const aEnd = entryEnd ? endOfDay(entryEnd) : end;
							if (rangesOverlap(aStart, aEnd, start, end)) {
								found.push({
									type: "history",
									floorId: floor.floorId,
									floorName: floor.floorName,
									roomId: room.roomId,
									roomName: room.roomName,
									bedId: bed.bedId,
									bedName: bed.bedName,
									occupantName: h.occupantName || "",
									occupantEmail: h.occupantEmail || "",
									personNumber: h.personNumber || "",
									contact: h.occupantEmail || h.personNumber || "",
									joinDate: h.joinDate || null,
									endDate: h.endDate || null,
									actualAmount: Number(h.actualAmount || 0),
									amountPaid: Number(h.amountPaid || 0),
									nextDueDate: h.nextDueDate || null,
									archivedAt: h.archivedAt || null,
								});
							}
						}

						// current occupant record
						const hasCurrent =
							bed.occupantName ||
							bed.occupantEmail ||
							bed.joinDate ||
							bed.endDate ||
							Number(bed.actualAmount || 0) !== 0 ||
							Number(bed.amountPaid || 0) !== 0;
						if (hasCurrent) {
							const entryStart = parseDateSafe(bed.joinDate) || null;
							const entryEnd = parseDateSafe(bed.endDate) || null;
							const aStart = entryStart ? startOfDay(entryStart) : start;
							const aEnd = entryEnd ? endOfDay(entryEnd) : end;
							let includeCurrent = false;
							if (entryStart || entryEnd) {
								includeCurrent = rangesOverlap(aStart, aEnd, start, end);
							} else {
								const nd = parseDateSafe(bed.nextDueDate);
								if (nd && nd >= start && nd <= end) includeCurrent = true;
								else if (
									Number(bed.amountPaid || 0) > 0 ||
									Number(bed.actualAmount || 0) > 0
								)
									includeCurrent = true;
							}

							if (includeCurrent) {
								found.push({
									type: "current",
									floorId: floor.floorId,
									floorName: floor.floorName,
									roomId: room.roomId,
									roomName: room.roomName,
									bedId: bed.bedId,
									bedName: bed.bedName,
									occupantName: bed.occupantName || "",
									occupantEmail: bed.occupantEmail || "",
									personNumber: bed.personNumber || "",
									contact: bed.occupantEmail || bed.personNumber || "",
									joinDate: bed.joinDate || null,
									endDate: bed.endDate || null,
									actualAmount: Number(bed.actualAmount || 0),
									amountPaid: Number(bed.amountPaid || 0),
									nextDueDate: bed.nextDueDate || null,
									archivedAt: null,
								});
							}
						}
					}
				}
			}

			const allWithPending = found.map((x) => ({
				...x,
				pending: Math.max(
					0,
					Number(x.actualAmount || 0) - Number(x.amountPaid || 0)
				),
			}));
			const pendingOnly = allWithPending.filter((x) => x.pending > 0);
			pendingOnly.sort(
				(a, b) =>
					b.pending - a.pending || (b.amountPaid || 0) - (a.amountPaid || 0)
			);

			setAllFound(allWithPending);
			setEntries(pendingOnly);
			setSearching(false);
		} catch (err) {
			console.error(err);
			alert("Search failed. See console for details.");
			setSearching(false);
		}
	}

	function handleResetDates() {
		const def = defaultDateRange();
		setStartDateInput(formatInputDate(def.start));
		setEndDateInput(formatInputDate(def.end));
	}

	// Build view-bed URL. If you want EXACTLY ownerId + floorId only, remove roomId param.
	function viewBedUrl(entry) {
		const ownerId =
			typeof window !== "undefined" ? localStorage.getItem("ownerId") : "";
		const params = new URLSearchParams();
		if (ownerId) params.set("ownerId", ownerId);
		if (entry.floorId) params.set("floorId", entry.floorId);
		if (entry.roomId) params.set("roomId", entry.roomId);
		return `/addroomswithbeds?${params.toString()}`;
	}

	if (loading) {
		return (
			<div className="p-8">
				<div className="text-lg font-medium">Loading report...</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-2">
				Income Report (Pending Only Cards)
			</h1>
			<p className="text-sm text-gray-600 mb-4">
				Totals include all entries in the range; cards show only pending items.
				Click phone to call. Use "View Bed" to open bed details.
			</p>

			<form
				onSubmit={handleSearch}
				className="bg-white rounded-lg shadow p-4 mb-6"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
					<div>
						<label className="block text-xs text-gray-600">Start date</label>
						<input
							type="date"
							value={startDateInput}
							onChange={(e) => setStartDateInput(e.target.value)}
							className="mt-1 w-full rounded border px-3 py-2"
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-600">End date</label>
						<input
							type="date"
							value={endDateInput}
							onChange={(e) => setEndDateInput(e.target.value)}
							className="mt-1 w-full rounded border px-3 py-2"
						/>
					</div>

					<div className="flex gap-2">
						<button
							type="submit"
							disabled={searching || loading}
							className="px-4 py-2 bg-slate-900 text-white rounded-md"
						>
							{searching ? "Searching..." : "Search"}
						</button>

						<button
							type="button"
							onClick={handleResetDates}
							className="px-4 py-2 border rounded-md"
						>
							Reset
						</button>

						<button
							type="button"
							onClick={() => {
								const payload = {
									meta: {
										hostel: hostel?.name || null,
										start: startDateInput,
										end: endDateInput,
									},
									allFound,
									pendingEntries: entries,
								};
								const blob = new Blob([JSON.stringify(payload, null, 2)], {
									type: "application/json",
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `income-report-${startDateInput}_to_${endDateInput}.json`;
								a.click();
								URL.revokeObjectURL(url);
							}}
							className="px-4 py-2 border rounded-md"
						>
							Export JSON
						</button>
					</div>
				</div>
				<div className="mt-3 text-xs text-gray-500">
					Default range: last month start → current month end.
				</div>
			</form>

			{/* totals */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="rounded-lg p-4 bg-white shadow">
					<div className="text-xs text-gray-500">
						Total Expected (all entries)
					</div>
					<div className="text-xl font-semibold">
						{fmtCurrency(totals.expected)}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						Entries: {totals.countAll}
					</div>
				</div>

				<div className="rounded-lg p-4 bg-white shadow">
					<div className="text-xs text-gray-500">
						Total Received (all entries)
					</div>
					<div className="text-xl font-semibold">
						{fmtCurrency(totals.received)}
					</div>
				</div>

				<div className="rounded-lg p-4 bg-white shadow">
					<div className="text-xs text-gray-500">
						Total Pending (all entries)
					</div>
					<div className="text-xl font-semibold text-red-600">
						{fmtCurrency(totals.pending)}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						Pending items: {totals.countPending}
					</div>
				</div>
			</div>

			{/* pending entries cards */}
			<div className="space-y-4">
				{entries.length === 0 ? (
					<div className="text-gray-600">
						No pending entries found for the selected range. Try adjusting dates
						and click Search.
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{entries.map((e, idx) => {
							const pending = Math.max(
								0,
								(e.actualAmount || 0) - (e.amountPaid || 0)
							);
							const received = Number(e.amountPaid || 0);
							return (
								<div
									key={`${e.floorId}_${e.roomId}_${e.bedId}_${idx}`}
									className="bg-white rounded-lg shadow p-4 flex flex-col"
								>
									<div className="flex items-start justify-between">
										<div>
											<div className="text-sm text-gray-500">
												{e.floorName} • {e.roomName}
											</div>
											<div className="text-lg font-semibold mt-1">
												{e.bedName} — {e.occupantName || "—"}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												{/* show phone (clickable) and email if present */}
												{e.personNumber ? (
													<a
														href={`tel:${e.personNumber}`}
														className="text-slate-700 hover:underline mr-2"
													>
														Call
													</a>
												) : null}
												{e.occupantEmail ? (
													<a
														href={`mailto:${e.occupantEmail}`}
														className="text-slate-700 hover:underline"
													>
														Email
													</a>
												) : null}
											</div>
										</div>

										<div className="text-right">
											<div className="text-xs text-gray-500">Type</div>
											<div className="text-sm font-medium mt-1">
												{e.type === "history" ? "Past" : "Current"}
											</div>
										</div>
									</div>

									<div className="mt-3 grid grid-cols-3 gap-3">
										<div>
											<div className="text-xs text-gray-500">Expected</div>
											<div className="font-semibold">
												{fmtCurrency(e.actualAmount)}
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-500">Received</div>
											<div className="font-semibold">
												{fmtCurrency(received)}
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-500">Pending</div>
											<div className="font-semibold text-red-600">
												{fmtCurrency(pending)}
											</div>
										</div>
									</div>

									<div className="mt-3 flex items-center justify-between text-xs text-gray-500">
										<div>
											<div>
												Join:{" "}
												<span className="font-medium text-xs text-gray-700">
													{e.joinDate || "—"}
												</span>
											</div>
											<div>
												End:{" "}
												<span className="font-medium text-xs text-gray-700">
													{e.endDate || "—"}
												</span>
											</div>
										</div>

										<div>
											<div>
												Next Due:{" "}
												<span className="font-medium text-xs text-gray-700">
													{e.nextDueDate || "—"}
												</span>
											</div>
											<div className="mt-1">
												ArchivedAt:{" "}
												<span className="font-mono text-xs">
													{e.archivedAt || "—"}
												</span>
											</div>
										</div>
									</div>

									<div className="mt-4 flex gap-2">
										{/* Call button (also available via tel: link above) */}
										{e.personNumber ? (
											<a
												href={`tel:${e.personNumber}`}
												className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
											>
												Call
											</a>
										) : (
											<button
												disabled
												className="px-3 py-1 rounded-md bg-gray-200 text-sm"
											>
												No phone
											</button>
										)}

										{/* View Bed button navigates to addroomswithbeds with ownerId + floorId (and roomId) */}
										<a
											href={viewBedUrl(e)}
											className="inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm"
										>
											View Bed
										</a>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
