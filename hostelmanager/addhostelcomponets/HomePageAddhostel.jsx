"use client";

import React, { useState, useEffect } from "react";
// const API_BASE = process.env.NEXT_PUBLIC_API;
const API_BASE = process.env.NEXT_PUBLIC_API || ""; // ensure set in .env
import Navbaraddhostel from "./Navbaraddhostel";
import Link from "next/link";

/**
 * Helper: create a floor object with ownerId and a generated uuid
 * shape: { floorName: string, ownerId: string, floorId: string }
 */
function createFloorObject(name = "Floor") {
  const genId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    // fallback
    return `floor_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  };
  return { floorName: name, ownerId: typeof window !== "undefined" ? localStorage.getItem("ownerId") || "" : "", floorId: genId() };
}

/**
 * Map server-side floor objects to the local floorObjects shape.
 * Some servers might return slightly different field names, so normalize.
 */
function normalizeServerFloors(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map((f, idx) => ({
    floorName: f.floorName || f.name || `Floor ${idx + 1}`,
    ownerId: f.ownerId || f.ownerId === "" ? f.ownerId : (f.owner || ""),
    floorId: f.floorId || f.id || createFloorObject().floorId,
  }));
}

export default function AddHostelHomePage() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hostels, setHostels] = useState([]); // will contain 0 or 1 item (owner's hostel)
  const [error, setError] = useState(null);


  //ownerId
  

  // owner id from localStorage (safe check for SSR)
  const OwnerID =
    typeof window !== "undefined" ? localStorage.getItem("ownerId") || "" : "";

  // Limits
  const MAX_IMAGES = 5;
  const MAX_IMAGE_BYTES = 500 * 1024; // 500KB

  // empty form template: floorObjects is an array of objects, not strings
  const emptyForm = {
    id: OwnerID || "",
    name: "",
    location: "",
    minRent: "",
    maxRent: "",
    // floors stored as objects: [{ floorName, ownerId, floorId }]
    floorObjects: [],
    mobile: "",
    map: { address: "", url: "" },
    logoPreview: "", // base64 preview for UI
    imagesPreview: [], // base64 previews
    logoFile: null, // actual File for upload
    imagesFiles: [], // actual File[] for upload
    createdAt: null,
  };

  const [hostelForm, setHostelForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  // track per-floor edit text in a temporary map to avoid immediate changes in the canonical floorObjects
  // (we'll still update canonical when server responds)
  const [tmpFloorNames, setTmpFloorNames] = useState({});

  // Helper: convert file to dataURL for preview
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Fetch hostel by owner id on mount
  useEffect(() => {
    async function fetchOwnerHostel() {
      setLoading(true);
      setError(null);

      if (!OwnerID) {
        // no owner id -> allow add
        setHostels([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/hostels/${encodeURIComponent(OwnerID)}`
        );
        if (res.status === 200) {
          const json = await res.json();
          // backend returns { success: true, data: hostel }
          const data = json.data ? json.data : json;
          setHostels([data]);
          setLoading(false);
        } else if (res.status === 404) {
          // no hostel found for owner id
          setHostels([]);
          setLoading(false);
        } else {
          // other errors
          const text = await res.text();
          setError(`API error: ${res.status} ${text}`);
          setHostels([]);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to contact API");
        setHostels([]);
        setLoading(false);
      }
    }

    fetchOwnerHostel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OwnerID]);

  function resetForm() {
    setHostelForm({ ...emptyForm, id: OwnerID || "" });
    setEditingId(null);
    setTmpFloorNames({});
  }

  function openModalForAdd() {
    resetForm();
    // ensure at least one default floor maybe? (optional) - keep empty by default
    setShowModal(true);
  }

  // When editing, convert floor names (strings) from backend to objects if needed.
  function openModalForEdit(hostel) {
    // Convert server floors: prefer 'floors' array first, then legacy floorNames
    let floArr = [];
    if (Array.isArray(hostel.floors) && hostel.floors.length > 0) {
      floArr = normalizeServerFloors(hostel.floors);
    } else if (Array.isArray(hostel.floorNames) && hostel.floorNames.length > 0) {
      // legacy string array -> convert
      floArr = hostel.floorNames.map((f) => {
        if (typeof f === "string") {
          return createFloorObject(f);
        } else if (f && typeof f === "object") {
          return {
            floorName: f.floorName || f.name || `Floor`,
            ownerId: f.ownerId || hostel.id || OwnerID,
            floorId: f.floorId || f.id || createFloorObject().floorId,
          };
        }
        return createFloorObject("Floor");
      });
    } else {
      // no floors data
      floArr = [];
    }

    setHostelForm({
      id: hostel.id || OwnerID,
      name: hostel.name || "",
      location: hostel.location || "",
      minRent: hostel.minRent || "",
      maxRent: hostel.maxRent || "",
      floorObjects: floArr,
      mobile: hostel.mobile || "",
      map: { address: hostel.map?.address || "", url: hostel.map?.url || "" },
      logoPreview: hostel.logo || "",
      imagesPreview: hostel.images || [],
      logoFile: null,
      imagesFiles: [],
      createdAt: hostel.createdAt || null,
    });
    // initialize tmpFloorNames so each floor input is controlled separately
    const t = {};
    floArr.forEach((f) => {
      t[f.floorId] = f.floorName;
    });
    setTmpFloorNames(t);

    setEditingId(hostel.id);
    setShowModal(true);
  }

  // Generic input change for non-nested fields
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "mapAddress") {
      setHostelForm((prev) => ({
        ...prev,
        map: { ...prev.map, address: value },
      }));
      return;
    }
    if (name === "mapUrl") {
      setHostelForm((prev) => ({ ...prev, map: { ...prev.map, url: value } }));
      return;
    }
    // other simple fields
    setHostelForm((prev) => ({ ...prev, [name]: value }));
  }

  // Local input change to floor name (updates tmpFloorNames)
  function handleTmpFloorChange(floorId, value) {
    setTmpFloorNames((prev) => ({ ...prev, [floorId]: value }));
  }

  // When editing many floors at once you might want a Save All; we provide per-floor Save below.
  // Floor-specific handlers (we now have an explicit list of floor objects)
  function handleFloorNameChange(index, value) {
    // for non-editing/new scenarios (or for immediate local change), update canonical structure
    setHostelForm((prev) => {
      const floors = [...prev.floorObjects];
      floors[index] = { ...floors[index], floorName: value };
      return { ...prev, floorObjects: floors };
    });
    // keep tmp map in sync for UX (in case per-floor API used)
    const f = hostelForm.floorObjects[index];
    if (f && f.floorId) handleTmpFloorChange(f.floorId, value);
  }

  // Add floor: when editing an existing hostel we call the API to create immediately.
  async function addFloor(name = "") {
    // If not editing an existing hostel, just add locally
    if (!editingId) {
      setHostelForm((prev) => ({
        ...prev,
        floorObjects: [...prev.floorObjects, createFloorObject(name || `Floor ${prev.floorObjects.length + 1}`)],
      }));
      return;
    }

    // create on server (POST /api/hostels/:id/floors)
    try {
      const res = await fetch(`${API_BASE}/api/hostels/${encodeURIComponent(editingId)}/floors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floorName: name || `Floor ${hostelForm.floorObjects.length + 1}` }),
      });
      if (res.ok) {
        const json = await res.json();
        // controller returns full hostel doc in data
        const serverDoc = json.data || json;
        // normalize server floors into local structure
        const newFloors = normalizeServerFloors(serverDoc.floors || serverDoc.floorNames || []);
        setHostelForm((prev) => ({ ...prev, floorObjects: newFloors }));
        // update hostels list too (so main list reflects changes)
        setHostels([serverDoc]);
        // update tmp names
        const tmp = {};
        newFloors.forEach((f) => (tmp[f.floorId] = f.floorName));
        setTmpFloorNames(tmp);
      } else {
        const text = await res.text();
        alert(`Add floor failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add floor");
    }
  }

  // Remove floor locally (used when creating new hostel prior to save)
  function removeFloorLocally(index) {
    setHostelForm((prev) => {
      const floors = [...prev.floorObjects];
      floors.splice(index, 1);
      return { ...prev, floorObjects: floors };
    });
  }

  // Remove floor: if editing existing hostel, call API DELETE for that floor
  async function removeFloor(index) {
    const f = hostelForm.floorObjects[index];
    if (!f) return;

    // If this floor was created locally (no editingId) or has no floorId, just remove locally
    if (!editingId || !f.floorId) {
      removeFloorLocally(index);
      return;
    }

    if (!confirm(`Delete floor "${f.floorName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/hostels/${encodeURIComponent(editingId)}/floors/${encodeURIComponent(f.floorId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const json = await res.json();
        const serverDoc = json.data || json;
        // update UI with server state
        const newFloors = normalizeServerFloors(serverDoc.floors || serverDoc.floorNames || []);
        setHostelForm((prev) => ({ ...prev, floorObjects: newFloors }));
        setHostels([serverDoc]);
        // update tmp names map
        const tmp = {};
        newFloors.forEach((fl) => (tmp[fl.floorId] = fl.floorName));
        setTmpFloorNames(tmp);
      } else {
        const text = await res.text();
        alert(`Delete floor failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete floor");
    }
  }

  // Save a single floor name to server (PUT /api/hostels/:id/floors/:floorId)
  async function saveFloor(floorId) {
    // ensure floorId exists and editingId exists
    if (!editingId) {
      alert("Hostel not saved yet. Use main Save to persist floors.");
      return;
    }
    const newName = tmpFloorNames[floorId];
    if (typeof newName !== "string") return;

    try {
      const res = await fetch(`${API_BASE}/api/hostels/${encodeURIComponent(editingId)}/floors/${encodeURIComponent(floorId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floorName: newName }),
      });
      if (res.ok) {
        const json = await res.json();
        const serverDoc = json.data || json;
        // update local floors from server
        const newFloors = normalizeServerFloors(serverDoc.floors || serverDoc.floorNames || []);
        setHostelForm((prev) => ({ ...prev, floorObjects: newFloors }));
        setHostels([serverDoc]);
        // refresh tmp names
        const tmp = {};
        newFloors.forEach((fl) => (tmp[fl.floorId] = fl.floorName));
        setTmpFloorNames(tmp);
      } else {
        const text = await res.text();
        alert(`Save floor failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save floor");
    }
  }

  // Logo file selection: set File and preview
  async function handleLogoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const preview = await fileToDataURL(f);
      setHostelForm((prev) => ({ ...prev, logoPreview: preview, logoFile: f }));
    } catch {
      alert("Failed to read logo file");
    }
  }

  // Gallery selection
  async function handleGalleryChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const allowed = Math.min(
      MAX_IMAGES - hostelForm.imagesPreview.length,
      files.length
    );
    if (allowed <= 0)
      return alert(`You can only add up to ${MAX_IMAGES} images`);

    const toProcess = files.slice(0, allowed);
    const previews = [];
    for (const file of toProcess) {
      try {
        const p = await fileToDataURL(file);
        previews.push({ file, preview: p });
      } catch (err) {
        console.error("preview failed", err);
      }
    }
    setHostelForm((prev) => ({
      ...prev,
      imagesPreview: [...prev.imagesPreview, ...previews.map((x) => x.preview)],
      imagesFiles: [...prev.imagesFiles, ...previews.map((x) => x.file)],
    }));
  }

  function removeGalleryImage(index) {
    setHostelForm((prev) => {
      const arrPrev = [...prev.imagesPreview];
      arrPrev.splice(index, 1);
      const arrFiles = [...prev.imagesFiles];
      arrFiles.splice(index, 1);
      return { ...prev, imagesPreview: arrPrev, imagesFiles: arrFiles };
    });
  }

  function validateForm() {
    if (!hostelForm.name.trim()) return "Please enter hostel name";
    if (!hostelForm.location.trim()) return "Please enter location";
    if (!hostelForm.mobile.trim()) return "Please enter mobile number";
    const digits = hostelForm.mobile.replace(/[^0-9]/g, "");
    if (digits.length < 7) return "Mobile number seems too short";
    return null;
  }

  function ensureMapUrl() {
    if (hostelForm.map.url && hostelForm.map.url.trim())
      return hostelForm.map.url;
    if (hostelForm.map.address && hostelForm.map.address.trim()) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        hostelForm.map.address
      )}`;
    }
    return "";
  }

  // CREATE hostel - send multipart/form-data to backend
  async function createHostelApi() {
    const err = validateForm();
    if (err) return alert(err);

    if (!OwnerID) return alert("ownerId not found in localStorage");

    const form = new FormData();
    // store id as owner id (you used this earlier)
    form.append("id", OwnerID);
    form.append("name", hostelForm.name);
    form.append("location", hostelForm.location);
    form.append("minRent", hostelForm.minRent || "");
    form.append("maxRent", hostelForm.maxRent || "");
    // send floors as JSON array of objects (floorObjects)
    form.append("floorNames", JSON.stringify(hostelForm.floorObjects || []));
    form.append("mobile", hostelForm.mobile);
    form.append("mapAddress", hostelForm.map.address || "");
    form.append("mapUrl", ensureMapUrl());
    // files
    if (hostelForm.logoFile) form.append("logo", hostelForm.logoFile);
    hostelForm.imagesFiles.forEach((f) => form.append("images", f));

    try {
      const res = await fetch(`${API_BASE}/api/hostels`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const json = await res.json();
        const newHostel = json.data || json;
        setHostels([newHostel]);
        setShowModal(false);
        resetForm();
      } else {
        const text = await res.text();
        alert(`Create failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create hostel");
    }
  }

  // UPDATE hostel - PUT /api/hostels/:id
  async function updateHostelApi() {
    const err = validateForm();
    if (err) return alert(err);
    if (!editingId && !hostelForm.id)
      return alert("Missing hostel id for update");

    const idToUse = editingId || hostelForm.id;

    const form = new FormData();
    form.append("name", hostelForm.name);
    form.append("location", hostelForm.location);
    form.append("minRent", hostelForm.minRent || "");
    form.append("maxRent", hostelForm.maxRent || "");
    // floors as JSON objects
    form.append("floorNames", JSON.stringify(hostelForm.floorObjects || []));
    form.append("mobile", hostelForm.mobile);
    form.append("mapAddress", hostelForm.map.address || "");
    form.append("mapUrl", ensureMapUrl());
    if (hostelForm.logoFile) form.append("logo", hostelForm.logoFile);
    hostelForm.imagesFiles.forEach((f) => form.append("images", f));

    try {
      const res = await fetch(
        `${API_BASE}/api/hostels/${encodeURIComponent(idToUse)}`,
        {
          method: "PUT",
          body: form,
        }
      );
      if (res.ok) {
        const json = await res.json();
        const updated = json.data || json;
        setHostels([updated]);
        setShowModal(false);
        resetForm();
      } else {
        const text = await res.text();
        alert(`Update failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update hostel");
    }
  }

  // DELETE hostel
  async function deleteHostelApi(id) {
    if (!confirm("Delete this hostel?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/hostels/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setHostels([]); // removed
        // optionally allow add again
      } else {
        const text = await res.text();
        alert(`Delete failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  // Handler for modal Save (create or update)
  async function handleSave(e) {
    e.preventDefault();
    if (editingId) {
      await updateHostelApi();
    } else {
      await createHostelApi();
    }
  }

  // When user clicks View: navigate to /hostel/[id] -- you had a Link so no op needed here
  function handleView(id) {
    // kept for debugging if needed
    console.log("view hoste id", id);
  }

  // Render loading / error
  if (loading) {
    return <div className="p-8">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-sky-200 to-yellow-400 p-8">
      <Navbaraddhostel />

      <main className="max-w-6xl mx-auto">
        <section className="mb-6 flex justify-between items-center">
          <div className="text-lg text-slate-800">Your hostels</div>

          {/* Show Add button only if there is no hostel for this owner */}
          {hostels.length === 0 && (
            <button
              onClick={openModalForAdd}
              className="flex items-center gap-3 bg-slate-900 text-white rounded-full px-5 py-3 shadow-2xl hover:scale-105 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                +
              </div>
              <span className="font-semibold">Add Hostel</span>
            </button>
          )}
        </section>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-lg bg-white/30 p-8 shadow-inner border border-white/30">
              <p className="text-slate-900">
                No hostels found for your owner id. Click{" "}
                <span className="font-semibold">Add Hostel</span> to create one.
              </p>
            </div>
          ) : (
            hostels.map((h) => (
              <article
                key={h.id}
                className="w-full mx-auto px-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 md:p-12 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
                    {h.logo ? (
                      <img
                        src={h.logo}
                        alt={`${h.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400">No logo</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{h.name}</h3>
                    <p className="text-sm text-slate-600">{h.location}</p>
                    <div className="mt-2 text-sm text-slate-700">
                      ₹{h.minRent} - ₹{h.maxRent}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {h.floorsCount}  Floors
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      {h.mobile && (
                        <a href={`tel:${h.mobile}`} className="text-sm underline">
                          Call: {h.mobile}
                        </a>
                      )}
                      {h.map && h.map.url && (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={h.map.url}
                          className="text-sm underline"
                        >
                          View on map
                        </a>
                      )}
                    </div>

                    {h.images && h.images.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {h.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${h.name} ${idx + 1}`}
                            className="w-20 h-14 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => openModalForEdit(h)}
                    className="px-3 py-1 rounded-md text-sm border"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteHostelApi(h.id)}
                    className="px-3 py-1 rounded-md text-sm bg-red-500 text-white"
                  >
                    Delete
                  </button>
                  <Link href='/floormanagment'>
                    <button
                      onClick={() => handleView(h.id)}
                      className="px-3 py-1 rounded-md text-sm bg-slate-900 text-white"
                    >
                      View
                    </button>
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center pt-12 px-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-xl border max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Hostel" : "Add Hostel"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-500"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Hostel Name</label>
                <input
                  name="name"
                  value={hostelForm.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  name="location"
                  value={hostelForm.location}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Min Rent (₹)</label>
                <input
                  name="minRent"
                  value={hostelForm.minRent}
                  onChange={handleChange}
                  type="number"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Max Rent (₹)</label>
                <input
                  name="maxRent"
                  value={hostelForm.maxRent}
                  onChange={handleChange}
                  type="number"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <input
                  name="mobile"
                  value={hostelForm.mobile}
                  onChange={handleChange}
                  placeholder="e.g. +9198xxxxxxx"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Map Address</label>
                <input
                  name="mapAddress"
                  value={hostelForm.map.address}
                  onChange={handleChange}
                  placeholder="Address or paste Google Maps URL in Map URL"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Map URL (optional)</label>
                <input
                  name="mapUrl"
                  value={hostelForm.map.url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              {/* Floors: we removed numeric input and use add/remove buttons with per-floor inputs */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Floors</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addFloor()}
                      className="px-3 py-1 rounded-md border text-sm"
                    >
                      + Add Floor
                    </button>
                    {/* When editing existing hostel, allow server-side add immediately */}
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => addFloor(`Floor ${hostelForm.floorObjects.length + 1}`)}
                        className="px-3 py-1 rounded-md bg-slate-900 text-white text-sm"
                      >
                        + Add & Save
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {hostelForm.floorObjects.length === 0 && (
                    <div className="text-xs text-slate-500">No floors yet — add one.</div>
                  )}

                  {hostelForm.floorObjects.map((floor, idx) => (
                    <div key={floor.floorId} className="flex gap-2 items-center">
                      {/* controlled input uses tmpFloorNames when editing existing hostel */}
                      <input
                        value={editingId ? (tmpFloorNames[floor.floorId] ?? floor.floorName) : (floor.floorName || `Floor ${idx + 1}`)}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (editingId) {
                            handleTmpFloorChange(floor.floorId, v);
                          } else {
                            handleFloorNameChange(idx, v);
                          }
                        }}
                        className="flex-1 rounded-md border px-3 py-2"
                        placeholder={`Floor ${idx + 1} name`}
                      />

                      {/* Per-floor actions: Save (only for editing existing floor), Delete */}
                      <div className="flex gap-2">
                        {editingId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveFloor(floor.floorId)}
                              className="px-3 py-1 rounded-md border text-sm"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFloor(idx)}
                              className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeFloorLocally(idx)}
                            className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Each floor is stored as an object: <code>{'{ floorName, ownerId, floorId }'}</code>
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="text-sm font-medium">Logo</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-20 h-20 rounded overflow-hidden bg-slate-50 flex items-center justify-center">
                    {hostelForm.logoPreview ? (
                      <img
                        src={hostelForm.logoPreview}
                        alt="logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-sm">No logo</div>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Recommended: square logo, &lt;500KB
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery upload */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  Gallery Images (max {MAX_IMAGES})
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {hostelForm.imagesPreview.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`preview-${idx}`}
                          className="w-28 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-slate-900 text-white"
              >
                {editingId ? "Save Changes" : "Add Hostel"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
