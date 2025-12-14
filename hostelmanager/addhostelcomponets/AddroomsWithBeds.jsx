"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import Navbaraddhostel from "./Navbaraddhostel";

/**
 * AddRoomsandBedsPage (API-enabled)
 *
 * - Fetches rooms for floorId on mount
 * - POST/PUT to create/update rooms
 * - POST to create "new entry" on a bed (archive current occupant -> history)
 * - Fixed LocalInput to accept initialValue (so clearing fields reflects in UI)
 */

// ---------- config ----------
const API_BASE = process.env.NEXT_PUBLIC_API + "/api/addroomandbeds"; // change if backend is on different origin

// ---------- helpers ----------
function genId(prefix = "id") {
	if (typeof crypto !== "undefined" && crypto.randomUUID)
		return crypto.randomUUID();
	return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function fileToDataUrl(file) {
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = () => res(reader.result);
		reader.onerror = rej;
		reader.readAsDataURL(file);
	});
}

// ---------- LocalInput component ----------
// NOTE: accepts `initialValue` prop (matches how you are calling LocalInput in the page)
function LocalInput({
	initialValue,
	onCommit,
	type = "text",
	className = "",
	placeholder = "",
	options = null, // if provided, renders a <select>
}) {
	const [val, setVal] = useState(initialValue ?? "");

	// sync with parent external changes (important so cleared values show up)
	useEffect(() => {
		setVal(initialValue ?? "");
	}, [initialValue]);

	function commit() {
		if (onCommit) onCommit(val);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		}
	}

	if (Array.isArray(options)) {
		return (
			<select
				value={val}
				onChange={(e) => setVal(e.target.value)}
				onBlur={commit}
				onKeyDown={handleKeyDown}
				className={className}
			>
				{options.map((opt) => (
					<option value={opt.value ?? opt} key={opt.value ?? opt}>
						{opt.label ?? opt}
					</option>
				))}
			</select>
		);
	}

	return (
		<input
			type={type}
			value={val}
			placeholder={placeholder}
			onChange={(e) => setVal(e.target.value)}
			onBlur={commit}
			onKeyDown={handleKeyDown}
			className={className}
		/>
	);
}

// ---------- RoomCard (memoized) ----------
const RoomCard = React.memo(function RoomCard({
	room,
	expanded,
	onToggleExpand,
	onAddBed,
	onDeleteRoom,
	onSaveRoom,
	onUpdateRoomName,
	onUpdateBedField,
	onRemoveBed,
	onHandleBedFile,
	onMakeNewEntry,
}) {
	return (
		<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl m-1">
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="text-lg font-semibold text-slate-900">
						{room.roomName}
					</div>
					<div className="text-xs text-slate-500 mt-1">
						Floor: <span className="font-mono">{room.floorId}</span>
					</div>
				</div>

				<div className="text-right">
					<div className="text-sm text-slate-600">Beds</div>
					<div className="text-xl font-bold">{room.beds.length}</div>
				</div>
			</div>

			<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl m-1">
				<button
					onClick={() => onToggleExpand(room.roomId)}
					className="px-3 py-1 rounded-md border text-sm"
				>
					{expanded ? "Collapse" : "Edit Beds"}
				</button>

				<button
					onClick={() => onAddBed(room.roomId)}
					className="px-3 py-1 rounded-md border text-sm"
				>
					+ Add Bed
				</button>

				<button
					onClick={() => onSaveRoom(room.roomId)}
					className="px-3 py-1 rounded-md bg-green-600 text-white text-sm"
				>
					Save Room
				</button>

				<button
					onClick={() => onDeleteRoom(room.roomId)}
					className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
				>
					Delete Room
				</button>
			</div>

			{expanded && (
				<div className="mt-4 space-y-4">
					{room.beds.map((bed) => (
						<div key={bed.bedId} className="border rounded-md p-3 bg-slate-50">
							{/* Bed header */}
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1">
									<label className="text-xs text-slate-600">Bed Name</label>
									<LocalInput
										initialValue={bed.bedName}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, { bedName: v })
										}
										className="w-full rounded-md border px-2 py-1 mt-1"
										placeholder="Bed name"
									/>

									<div className="mt-2 text-sm text-slate-700">
										Occupant:{" "}
										<span className="font-medium">
											{bed.occupantName || "—"}
										</span>
										{bed.occupantEmail && (
											<span className="ml-3 text-xs text-slate-500">
												({bed.occupantEmail})
											</span>
										)}
									</div>
								</div>

								<div className="w-44 text-right">
									<div className="text-xs text-slate-600">Actual / Paid</div>
									<div className="text-sm font-semibold">
										₹{bed.actualAmount || 0} / ₹{bed.amountPaid || 0}
									</div>
									<div className="text-xs text-slate-500 mt-2">
										Next Due: {bed.nextDueDate || "—"}
									</div>
								</div>
							</div>

							{/* editable occupant and financial fields */}
							<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
								<div>
									<label className="text-xs text-slate-600">
										Occupant Name
									</label>
									<LocalInput
										initialValue={bed.occupantName}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												occupantName: v,
											})
										}
										className="w-full rounded-md border px-2 py-1 mt-1"
										placeholder="Person name"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">
										Occupant Email
									</label>
									<LocalInput
										initialValue={bed.occupantEmail}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												occupantEmail: v,
											})
										}
										className="w-full rounded-md border px-2 py-1 mt-1"
										placeholder="name@example.com"
										type="email"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">Person No</label>
									<LocalInput
										initialValue={bed.personNumber}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												personNumber: v,
											})
										}
										className="w-full rounded-md border px-2 py-1 mt-1"
										placeholder="+9198xxxx"
									/>
								</div>
							</div>

							<div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
								<div>
									<label className="text-xs text-slate-600">Join Date</label>
									<LocalInput
										initialValue={bed.joinDate}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, { joinDate: v })
										}
										type="date"
										className="w-full rounded-md border px-2 py-1 mt-1"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">End Date</label>
									<LocalInput
										initialValue={bed.endDate}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, { endDate: v })
										}
										type="date"
										className="w-full rounded-md border px-2 py-1 mt-1"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">
										Actual Amount (₹)
									</label>
									<LocalInput
										initialValue={bed.actualAmount}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												actualAmount: Number(v || 0),
											})
										}
										type="number"
										className="w-full rounded-md border px-2 py-1 mt-1"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">
										Amount Paid (₹)
									</label>
									<LocalInput
										initialValue={bed.amountPaid}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												amountPaid: Number(v || 0),
											})
										}
										type="number"
										className="w-full rounded-md border px-2 py-1 mt-1"
									/>
								</div>
							</div>

							<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
								<div>
									<label className="text-xs text-slate-600">
										Next Due Date
									</label>
									<LocalInput
										initialValue={bed.nextDueDate}
										onCommit={(v) =>
											onUpdateBedField(room.roomId, bed.bedId, {
												nextDueDate: v,
											})
										}
										type="date"
										className="w-full rounded-md border px-2 py-1 mt-1"
									/>
								</div>

								<div>
									<label className="text-xs text-slate-600">Status</label>
									<div className="mt-1">
										<button
											onClick={() => onMakeNewEntry(room.roomId, bed.bedId)}
											className="px-3 py-1 rounded-md bg-blue-600 text-white"
										>
											New
										</button>
									</div>
								</div>

								<div className="text-right">
									<div className="text-xs text-slate-500">Quick actions</div>
									<div className="mt-2">
										<button
											onClick={() => onRemoveBed(room.roomId, bed.bedId)}
											className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
										>
											Remove Bed
										</button>
									</div>
								</div>
							</div>

							{/* Photos: aadhar and profile */}
							<div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
								<div>
									<label className="text-xs text-slate-600">
										Aadhar (optional)
									</label>
									<input
										type="file"
										accept="image/*"
										onChange={async (e) => {
											const f = e.target.files?.[0];
											if (!f) return;
											const dataUrl = await fileToDataUrl(f);
											onHandleBedFile(
												room.roomId,
												bed.bedId,
												"aadhar",
												dataUrl
											);
										}}
										className="mt-1"
									/>
									{bed.aadharDataUrl && (
										<img
											src={bed.aadharDataUrl}
											alt="aadhar"
											className="mt-2 w-28 h-20 object-cover rounded"
										/>
									)}
								</div>

								<div>
									<label className="text-xs text-slate-600">
										Profile Pic (optional)
									</label>
									<input
										type="file"
										accept="image/*"
										onChange={async (e) => {
											const f = e.target.files?.[0];
											if (!f) return;
											const dataUrl = await fileToDataUrl(f);
											onHandleBedFile(
												room.roomId,
												bed.bedId,
												"profile",
												dataUrl
											);
										}}
										className="mt-1"
									/>
									{bed.profilePicDataUrl && (
										<img
											src={bed.profilePicDataUrl}
											alt="profile"
											className="mt-2 w-28 h-20 object-cover rounded"
										/>
									)}
								</div>
							</div>
						</div>
					))}

					<div className="text-sm text-slate-600">
						Total beds:{" "}
						<span className="font-semibold">{room.beds.length}</span>
					</div>
				</div>
			)}
		</div>
	);
});

// ---------- Main Page Component ----------
export default function AddRoomsandBedsPage() {
	const params = useSearchParams();
	const ownerIdParam = params.get("ownerId") || "";
	const floorIdParam = params.get("floorId") || "";
	const floorNameParam = params.get("floorName") || "";

	const [ownerId, setOwnerId] = useState(ownerIdParam);
	const [floorId, setFloorId] = useState(floorIdParam);

	const [rooms, setRooms] = useState([]);
	const [newRoomName, setNewRoomName] = useState("");
	const [newRoomBedsCount, setNewRoomBedsCount] = useState(1);
	const [expandedRoomId, setExpandedRoomId] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		setOwnerId(ownerIdParam);
		setFloorId(floorIdParam);
	}, [ownerIdParam, floorIdParam]);

	// fetch rooms for floor on mount / whenever floorId changes
	useEffect(() => {
		async function load() {
			if (!floorId) return;
			try {
				const res = await axios.get(API_BASE, { params: { floorId } });
				if (res.data && Array.isArray(res.data.rooms)) {
					// mark persisted rooms so save knows to PUT
					const persisted = res.data.rooms.map((r) => ({
						...r,
						__persisted: true,
					}));
					setRooms(persisted);
					if (persisted.length) setExpandedRoomId(persisted[0].roomId);
				} else {
					setRooms([]);
				}
				console.log("Rooms loaded for floor:", floorId, res.data.rooms || []);
			} catch (err) {
				console.error("Load rooms error:", err);
				setRooms([]);
			}
		}
		load();
	}, [floorId]);

	// create default beds
	const createBedsArray = useCallback((count) => {
		const arr = [];
		for (let i = 0; i < count; i++) {
			arr.push({
				bedId: genId("bed"),
				bedName: `Bed ${i + 1}`,
				personNumber: "",
				occupantName: "",
				occupantEmail: "",
				joinDate: "",
				endDate: "",
				actualAmount: 0,
				amountPaid: 0,
				nextDueDate: "",
				isOld: false,
				aadharDataUrl: "",
				profilePicDataUrl: "",
				history: [],
			});
		}
		return arr;
	}, []);

	// add room local
	const addRoomLocal = useCallback(() => {
		setError("");
		if (!newRoomName.trim()) {
			setError("Please enter a valid room name");
			return;
		}
		if (newRoomBedsCount < 1) {
			setError("Beds count must be at least 1");
			return;
		}

		const room = {
			roomId: genId("room"),
			roomName: newRoomName.trim(),
			floorId: floorId || "unknown-floor",
			ownerId: ownerId || "unknown-owner",
			beds: createBedsArray(Number(newRoomBedsCount)),
			createdAt: Date.now(),
		};

		setRooms((r) => [room, ...r]);
		setNewRoomName("");
		setNewRoomBedsCount(1);
		setExpandedRoomId(room.roomId);
		console.log("ROOM ADDED (local):", JSON.stringify(room, null, 2));
	}, [newRoomName, newRoomBedsCount, floorId, ownerId, createBedsArray]);

	// delete room (local + if persisted, call backend)
	const deleteRoom = useCallback(
		async (roomId) => {
			if (!confirm("Delete this room?")) return;
			const room = rooms.find((r) => r.roomId === roomId);
			if (room?.__persisted) {
				try {
					// if you want server-side delete, implement a DELETE route; for now just remove locally
					// await axios.delete(`${API_BASE}/${roomId}`);
				} catch (e) {
					console.error("Delete room error:", e);
				}
			}
			setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
		},
		[rooms]
	);

	// toggle expand
	const toggleExpand = useCallback((roomId) => {
		setExpandedRoomId((cur) => (cur === roomId ? null : roomId));
	}, []);

	// add bed to room (local)
	const addBedToRoom = useCallback((roomId) => {
		const newBed = {
			bedId: genId("bed"),
			bedName: `Bed ${Date.now() % 1000}`,
			personNumber: "",
			occupantName: "",
			occupantEmail: "",
			joinDate: "",
			endDate: "",
			actualAmount: 0,
			amountPaid: 0,
			nextDueDate: "",
			isOld: false,
			aadharDataUrl: "",
			profilePicDataUrl: "",
			history: [],
		};
		setRooms((prev) =>
			prev.map((r) =>
				r.roomId === roomId ? { ...r, beds: [...r.beds, newBed] } : r
			)
		);
	}, []);

	// remove bed
	const removeBed = useCallback((roomId, bedId) => {
		if (!confirm("Remove this bed?")) return;
		setRooms((prev) =>
			prev.map((r) =>
				r.roomId === roomId
					? { ...r, beds: r.beds.filter((b) => b.bedId !== bedId) }
					: r
			)
		);
	}, []);

	// update bed field (committed from LocalInput)
	const updateBedField = useCallback((roomId, bedId, patch) => {
		setRooms((prev) =>
			prev.map((r) => {
				if (r.roomId !== roomId) return r;
				return {
					...r,
					beds: r.beds.map((b) => (b.bedId === bedId ? { ...b, ...patch } : b)),
				};
			})
		);
	}, []);

	// handle bed file (dataUrl already prepared by caller) - local only; you can extend to upload to server
	const handleBedFile = useCallback(
		(roomId, bedId, type, dataUrl) => {
			if (type === "aadhar") {
				updateBedField(roomId, bedId, { aadharDataUrl: dataUrl });
			} else if (type === "profile") {
				updateBedField(roomId, bedId, { profilePicDataUrl: dataUrl });
			}
		},
		[updateBedField]
	);

	// save room (POST new rooms, PUT persisted rooms)
	const saveRoom = useCallback(
		async (roomId) => {
			const room = rooms.find((r) => r.roomId === roomId);
			if (!room) return;
			if (!room.roomName || room.beds.length === 0) {
				alert("Room must have a name and at least one bed");
				return;
			}

			const payload = {
				ownerId: room.ownerId,
				floorId: room.floorId,
				roomId: room.roomId,
				roomName: room.roomName,
				beds: room.beds.map((b) => ({
					bedId: b.bedId,
					bedName: b.bedName,
					occupantName: b.occupantName,
					occupantEmail: b.occupantEmail,
					personNumber: b.personNumber,
					joinDate: b.joinDate,
					endDate: b.endDate,
					actualAmount: b.actualAmount,
					amountPaid: b.amountPaid,
					nextDueDate: b.nextDueDate,
					isOld: b.isOld,
					aadharDataUrl: b.aadharDataUrl,
					profilePicDataUrl: b.profilePicDataUrl,
					history: b.history || [],
				})),
				createdAt: room.createdAt,
			};

			try {
				if (room.__persisted) {
					// update existing room (PUT)
					const res = await axios.put(`${API_BASE}/${room.roomId}`, payload);
					console.log("Room updated:", res.data);
					// update local state with returned room if present
					setRooms((prev) =>
						prev.map((r) =>
							r.roomId === room.roomId
								? { ...(res.data.room || r), __persisted: true }
								: r
						)
					);
					alert("Room updated (server). See console.");
				} else {
					// create new room (POST)
					const res = await axios.post(API_BASE, payload);
					console.log("Room created:", res.data);
					// server returns created room in res.data.room
					const serverRoom = res.data.room || res.data;
					setRooms((prev) =>
						prev.map((r) =>
							r.roomId === room.roomId
								? { ...serverRoom, __persisted: true }
								: r
						)
					);
					alert("Room created (server). See console.");
				}
			} catch (err) {
				console.error("Save room error:", err);
				alert(err?.response?.data?.message || "Failed to save room");
			}
		},
		[rooms]
	);

	// update room name (committed)
	const updateRoomName = useCallback((roomId, newName) => {
		setRooms((prev) =>
			prev.map((r) => (r.roomId === roomId ? { ...r, roomName: newName } : r))
		);
	}, []);

	// Export all data
	const exportAll = useCallback(() => {
		const payload = {
			ownerId,
			floorId,
			rooms,
			exportedAt: new Date().toISOString(),
		};
		console.log("Exported JSON:", JSON.stringify(payload, null, 2));
		alert("Exported JSON logged to console.");
	}, [ownerId, floorId, rooms]);

	// ------------- NEW: make new entry on bed (call backend, then update local state) -------------
	const makeNewEntryOnBed = useCallback(
		async (roomId, bedId) => {
			// find bed locally and do client-side quick validation to show friendly message
			const room = rooms.find((r) => r.roomId === roomId);
			if (!room) {
				alert("Room not found locally. Try refreshing.");
				return;
			}
			const bed = room.beds.find((b) => b.bedId === bedId);
			if (!bed) {
				alert("Bed not found locally. Try refreshing.");
				return;
			}

			// If there's occupant info, require both dates
			const hasOcc =
				bed.occupantName || bed.occupantEmail || bed.joinDate || bed.endDate;
			if (hasOcc) {
				const missing = [];
				if (!bed.joinDate) missing.push("Join Date");
				if (!bed.endDate) missing.push("End Date");
				if (missing.length > 0) {
					alert(
						`Please add the following for the current occupant before creating a new entry:\n• ${missing.join(
							"\n• "
						)}`
					);
					return;
				}
			} else {
				// no occupant present — user should be warned, but backend will reject too
				if (
					!confirm(
						"No occupant found on this bed. The bed is already free. Proceed?"
					)
				)
					return;
			}

			try {
				const res = await axios.post(
					`${API_BASE}/${roomId}/beds/${bedId}/new-entry`
				);
				// if error, axios will throw
				console.log("New entry response:", res.data);

				// Update local state based on response snapshot when possible.
				// Server returns snapshot and room/bed info in my backend design. If not, we still update locally to reflect cleared occupant.
				setRooms((prevRooms) =>
					prevRooms.map((r) => {
						if (r.roomId !== roomId) return r;
						return {
							...r,
							beds: r.beds.map((b) => {
								if (b.bedId !== bedId) return b;
								// if server returned snapshot, use it; else build snapshot from client bed
								const snapshot = res.data.snapshot || {
									snapshotId: genId("hist"),
									occupantName: b.occupantName,
									occupantEmail: b.occupantEmail,
									personNumber: b.personNumber,
									joinDate: b.joinDate,
									endDate: b.endDate,
									actualAmount: b.actualAmount,
									amountPaid: b.amountPaid,
									nextDueDate: b.nextDueDate,
									aadharDataUrl: b.aadharDataUrl,
									profilePicDataUrl: b.profilePicDataUrl,
									archivedAt: new Date().toISOString(),
								};

								// push to history and clear occupant fields
								const newHistory = [...(b.history || []), snapshot];

								return {
									...b,
									occupantName: "",
									occupantEmail: "",
									personNumber: "",
									joinDate: "",
									endDate: "",
									actualAmount: 0,
									amountPaid: 0,
									nextDueDate: "",
									aadharDataUrl: "",
									profilePicDataUrl: "",
									isOld: true,
									history: newHistory,
								};
							}),
						};
					})
				);

				alert(
					"Archived occupant and cleared form for new entry. See console for snapshot."
				);
			} catch (err) {
				console.error("makeNewEntry error:", err);
				alert(
					err?.response?.data?.message ||
						"Could not create new entry. Fill required fields."
				);
			}
		},
		[rooms]
	);

	// ---------- JSX ----------
	return (
		<div className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 pt-14 md:pt-20 pb-6">
			<Navbaraddhostel />
			<div className="max-w-6xl mx-auto">
				<header className="m-3">
					<h1 className="text-2xl font-bold">
						Add Rooms & Beds IN {floorNameParam}
					</h1>
					<p className="text-sm text-slate-600">
						Owner: <span className="font-mono">{ownerId || "—"}</span> | Floor:{" "}
						<span className="font-mono">{floorId || "—"}</span>
					</p>
				</header>

				<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl m-1">
					<h3 className="text-lg font-semibold mb-3">
						Add New Room IN {floorNameParam}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
						<div>
							<label className="block text-sm text-slate-700 mb-1">
								Room Name
							</label>
							<input
								className="w-full rounded-md border px-3 py-2"
								value={newRoomName}
								onChange={(e) => setNewRoomName(e.target.value)}
								placeholder="e.g. A-101"
							/>
						</div>

						<div>
							<label className="block text-sm text-slate-700 mb-1">
								Number of Beds
							</label>
							<input
								type="number"
								min={1}
								className="w-full rounded-md border px-3 py-2"
								value={newRoomBedsCount}
								onChange={(e) => setNewRoomBedsCount(Number(e.target.value))}
							/>
						</div>

						<div className="flex gap-2">
							<button
								onClick={addRoomLocal}
								className="rounded-md bg-slate-900 text-white px-4 py-2 self-end hover:opacity-95"
							>
								Add Room
							</button>
							<button
								onClick={() => {
									setNewRoomName("");
									setNewRoomBedsCount(1);
								}}
								className="rounded-md border px-4 py-2 self-end"
							>
								Clear
							</button>
						</div>
					</div>
					{error && <div className="text-red-600 text-sm mt-2">{error}</div>}
				</div>

				<div className="grid grid-cols-1 gap-4">
					{rooms.length === 0 && (
						<div className="text-slate-600">No rooms yet. Add one above.</div>
					)}
					{rooms.map((room) => (
						<RoomCard
							key={room.roomId}
							room={room}
							expanded={expandedRoomId === room.roomId}
							onToggleExpand={toggleExpand}
							onAddBed={addBedToRoom}
							onDeleteRoom={deleteRoom}
							onSaveRoom={saveRoom}
							onUpdateRoomName={updateRoomName}
							onUpdateBedField={updateBedField}
							onRemoveBed={removeBed}
							onHandleBedFile={handleBedFile}
							onMakeNewEntry={makeNewEntryOnBed}
						/>
					))}
				</div>

				<div className="mt-8 flex gap-3">
					<button
						onClick={exportAll}
						className="px-4 py-2 rounded-md bg-indigo-600 text-white"
					>
						Export All Data (console.log)
					</button>
					<button
						onClick={() => {
							rooms.forEach((r) =>
								console.log("ROOM:", JSON.stringify(r, null, 2))
							);
							alert("All rooms printed to console.");
						}}
						className="px-4 py-2 rounded-md border"
					>
						Print All Rooms
					</button>
				</div>
			</div>
		</div>
	);
}
