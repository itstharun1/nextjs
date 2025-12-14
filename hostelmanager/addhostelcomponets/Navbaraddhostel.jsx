import Link from "next/link";
import React from "react";

const Navbaraddhostel = () => {
	return (
		<div>
			<header className="max-w-6xl mx-auto mb-8">
				<div className="fixed flex justify-between items-center h-16 w-full top-0 left-0 z-50 bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 shadow-lg">
					<div className="text-2xl font-bold text-white ml-3">
						Hostels<span className="text-sky-900">Manager</span>
					</div>
					<div className="hidden md:flex items-center space-x-10 font-medium text-black ">
						<Link href="/addhostels">
							<nav  className="m-4">Home</nav>
						</Link>
                        <Link href="/floormanagment">
							<nav  className="m-4">Floors</nav>
						</Link>
						<Link href="/hosteldashboard">
							<nav className="mr-5">Dashboard</nav>
						</Link>
						
					</div>
				</div>

				<div className="mt-10 rounded-2xl bg-white/20 backdrop-blur p-10 shadow-lg border border-white/30">
					<h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
						Discover Your Perfect Hostel Stay Today!
					</h1>
					<p className="mt-4 text-slate-800/90 max-w-2xl">
						Add hostels quickly using the big add button — provide the basic
						info, logo, contact and gallery.
					</p>
				</div>
			</header>
		</div>
	);
};

export default Navbaraddhostel;
