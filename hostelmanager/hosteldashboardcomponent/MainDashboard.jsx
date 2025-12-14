"use client";

/**
 * MainDashboard.jsx
 *
 * - Uses axios to fetch: GET /api/hostels/:ownerId  (reads response.data.data)
 * - For each floor in hostel.data.floors, sequentially fetches GET /api/addroomandbeds?floorId=<id>
 * - Renders floor cards with compact room boxes inside (room name, total beds, available beds, red/green status)
 *
 * Notes:
 * - Ensure NEXT_PUBLIC_API = "http://localhost:4000" (no trailing /api) in your .env
 * - Tailwind classes are used for styling.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";

const ROOT_API = (process.env.NEXT_PUBLIC_API || "http://localhost:4000").replace(/\/+$/, "");

// create axios instance
const api = axios.create({
  baseURL: ROOT_API,
  headers: { "Content-Type": "application/json" },
});

export default function MainDashboard() {
  const [hostel, setHostel] = useState(null); // full hostel doc from /hostels/:ownerId -> response.data.data
  const [floorsData, setFloorsData] = useState([]); // [{ floorId, floorName, rooms: [...] }, ...]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // count available beds: free if occupantName and occupantEmail are falsy
  const countAvailableBeds = (beds = []) =>
    beds.reduce((acc, bed) => {
      const occupied = !!(bed.occupantName || bed.occupantEmail);
      return acc + (occupied ? 0 : 1);
    }, 0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      // get ownerId from localStorage (same pattern used across your app)
      const ownerId = typeof window !== "undefined" ? localStorage.getItem("ownerId") : null;
      if (!ownerId) {
        setError("ownerId not found in localStorage. Save the ownerId first.");
        setLoading(false);
        return;
      }

      try {
        // 1) Fetch hostel by ownerId. Your backend returns { success:true, data: { ... } }
        const hostelsResp = await api.get(`/api/hostels/${encodeURIComponent(ownerId)}`);
        const hostelDoc = hostelsResp?.data?.data ?? hostelsResp?.data ?? null;

        if (!hostelDoc) {
          setHostel(null);
          setFloorsData([]);
          setError("No hostel data returned from server.");
          setLoading(false);
          return;
        }

        if (cancelled) return;

        setHostel(hostelDoc);

        // normalize floors from the hostel doc
        const floors =
          Array.isArray(hostelDoc.floors) && hostelDoc.floors.length > 0
            ? hostelDoc.floors
            : Array.isArray(hostelDoc.floorNames) && hostelDoc.floorNames.length > 0
            ? // legacy: convert floorNames (strings) -> objects with generated ids (note: these won't match backend)
              hostelDoc.floorNames.map((name, i) => ({
                floorName: typeof name === "string" ? name : name.floorName || `Floor ${i + 1}`,
                floorId: (typeof name === "object" && (name.floorId || name.id)) || `floor_${i + 1}`,
                ownerId: hostelDoc.id || ownerId,
              }))
            : [];

        // If hostel exists but no floors defined, show that state (don't try to fetch rooms)
        if (floors.length === 0) {
          setFloorsData([]);
          setLoading(false);
          return;
        }

        // 2) Sequentially fetch rooms for each floor using /api/addroomandbeds?floorId=...
        const floorsWithRooms = [];
        for (const f of floors) {
          if (cancelled) break;

          const floorId = f.floorId || f._id || f.id;
          const floorName = f.floorName || f.name || `Floor ${String(floorId || "").slice(0, 6)}`;

          if (!floorId) {
            floorsWithRooms.push({ floorId: null, floorName, rooms: [], _error: "Missing floorId" });
            continue;
          }

          try {
            const roomsRes = await api.get("/api/addroomandbeds", { params: { floorId } });
            const roomsJson = roomsRes?.data ?? {};
            // backend returns object with "rooms": [...] as in your example
            const rooms = Array.isArray(roomsJson.rooms) ? roomsJson.rooms : Array.isArray(roomsJson) ? roomsJson : [];
            floorsWithRooms.push({ floorId, floorName, rooms });
          } catch (err) {
            console.error("Error loading rooms for floor", floorId, err);
            const status = err?.response?.status;
            floorsWithRooms.push({
              floorId,
              floorName,
              rooms: [],
              _error: `Failed to load rooms for this floor${status ? ` (status ${status})` : ""}`,
            });
          }
        }

        if (!cancelled) {
          setFloorsData(floorsWithRooms);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load hostel:", err);
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || "Unknown error");
          setHostel(null);
          setFloorsData([]);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-lg font-medium">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Error</div>
        <div className="mt-2 text-sm text-black-700">{error}</div>
      </div>
    );
  }

  // If hostel exists but no floors defined — show CTA to create floors
  if (hostel && (!Array.isArray(hostel.floors) || hostel.floors.length === 0)) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">{hostel.name || "Your Hostel"}</h2>
        <p className="mt-2 text-black-600">No floors found for this hostel.</p>
        <div className="mt-4">
          <a
            href={`/addrooms/${encodeURIComponent(hostel.id || hostel._id || "")}/new`}
            className="inline-block px-4 py-2 bg-slate-900 text-white rounded-md"
          >
            Create first floor & Add rooms
          </a>
        </div>
      </div>
    );
  }

  if (!floorsData.length) {
    // fallback — shouldn't normally happen if hostel had floors, but safe-guard
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">No floors found</h2>
        <p className="mt-2 text-black-600">Make sure ownerId is saved in localStorage and the backend returns floors for that owner.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 ">
      <header className="flex items-center justify-between m-5">
        <div>
          <h1 className="text-2xl font-bold">Hostel Dashboard</h1>
          {hostel?.name && <p className="text-sm text-black-600">{hostel.name} — {hostel.location}</p>}
        </div>
        <p className="text-sm text-black-600">Overview of floors, rooms and bed availability</p>
      </header>

      <div className="space-y-6">
        {floorsData.map((floor) => (
          <FloorCard key={floor.floorId || floor.floorName} floor={floor} countAvailableBeds={countAvailableBeds} />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Floor card (contains compact room boxes) -------------------- */

function FloorCard({ floor, countAvailableBeds }) {
  const totalRooms = (floor.rooms || []).length;
  const totalBeds = (floor.rooms || []).reduce((acc, r) => acc + (r.beds ? r.beds.length : 0), 0);
  const totalAvailable = (floor.rooms || []).reduce((acc, r) => acc + countAvailableBeds(r.beds), 0);

  return (
    <section className="w-full mx-auto px-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 md:p-12 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{floor.floorName}</h2>
          <p className="text-sm text-black-500 mt-1">
            Rooms: <span className="font-medium">{totalRooms}</span> · Beds: <span className="font-medium">{totalBeds}</span> · Available:{" "}
            <span className="font-medium">{totalAvailable}</span>
          </p>
          {floor._error && <p className="text-xs text-red-500 mt-1">Note: {floor._error}</p>}
        </div>

        <div className="text-right">
          <div className="text-sm text-black-500">Floor ID</div>
          <div className="text-xs text-black-400">{truncateId(floor.floorId)}</div>
        </div>
      </div>

      {/* Compact rooms list */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(floor.rooms || []).map((room) => {
          const beds = room.beds || [];
          const total = beds.length;
          const available = countAvailableBeds(beds);
          const isFull = available === 0;

          return <RoomBox key={room.roomId || room._id} room={room} total={total} available={available} isFull={isFull} />;
        })}
      </div>
    </section>
  );
}

/* -------------------- Compact Room Box --------------------
   Small box showing room name, total beds and available beds.
   Red when full, green when has free beds.
------------------------------------------------------------------*/
function RoomBox({ room, total, available, isFull }) {
  return (
    <div
      className={`rounded-lg p-3 border shadow-sm flex flex-col justify-between ${
        isFull ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">{room.roomName || "Unnamed Room"}</div>
          <div className="text-xs text-black-500 mt-1">ID: <span className="font-mono">{truncateId(room.roomId || room._id)}</span></div>
        </div>

        <div className="text-right">
          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isFull ? "bg-red-600 text-white" : "bg-green-700 text-white"}`}>
            {isFull ? "Full" : "Has space"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-black-600">Total beds</div>
        <div className="text-sm font-semibold">{total}</div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="text-xs text-black-600">Available</div>
        <div className="text-sm font-semibold">{available}</div>
      </div>

      {/* Optional: small list of bed names (one-liner) */}
      {/* {Array.isArray(room.beds) && room.beds.length > 0 && (
        <div className="mt-3 text-xs text-black-600">
          Beds:{" "}
          <span className="text-xs text-slate-800 font-medium">
            {room.beds.map((b) => b.bedName || b.bedId).slice(0, 4).join(", ")}
            {room.beds.length > 4 ? "…" : ""}
          </span>
        </div>
      )} */}
    </div>
  );
}

/* -------------------- Utilities -------------------- */

function truncateId(id = "") {
  if (!id) return "";
  const s = String(id);
  return s.length > 12 ? `${s.slice(0, 8)}...${s.slice(-4)}` : s;
}
