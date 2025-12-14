"use client";
import Link from "next/link";
import React, { useState } from "react";

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState(5);

	return (
		<nav className="fixed w-full top-0 left-0 z-50 bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 shadow-lg">
			<div className="relative max-w-7xl mx-auto px-5 md:px-10">
				<div className="flex justify-between items-center h-16">
					{/* LOGO */}
					<h1 className="text-2xl font-semibold tracking-wide text-black">
						Hostels<span className="text-blue-900 font-bold">Manager</span>
					</h1>

					{/* DESKTOP MENU */}
					<ul className="hidden md:flex items-center space-x-10 font-medium text-black">
						<Link
							href="/"
							className="px-3 py-2 rounded-md hover:bg-black/10 duration-200 cursor-pointer"
						>
							Home
						</Link>

						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200 cursor-pointer">
							Add Properties
						</li>

						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200 cursor-pointer">
							Show Properties
						</li>

						{/* NOTIFICATIONS */}
						<li>
							<div className="relative cursor-pointer">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.7"
									stroke="black"
									className="w-7 h-7 hover:scale-110 duration-150"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M14.25 18.75a1.5 1.5 0 01-3 0M12 6.75a5.25 5.25 0 00-5.25 5.25v2.25c0 .621-.504 1.125-1.125 1.125h15.75c-.621 0-1.125-.504-1.125-1.125V12c0-2.899-2.351-5.25-5.25-5.25z"
									/>
								</svg>

								{/* BADGE */}
								<span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-[6px] py-[2px] rounded-full">
									{notifications}
								</span>
							</div>
						</li>

						<Link href={'/loginpage'} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 cursor-pointer">
							Login
						</Link>
					</ul>

					{/* MOBILE MENU BUTTON */}
					<button
						className="md:hidden text-black"
						onClick={() => setOpen(!open)}
					>
						{open ? (
							<svg
								className="w-7 h-7"
								fill="none"
								stroke="black"
								viewBox="0 0 24 24"
							>
								<path
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
							<svg
								className="w-7 h-7"
								fill="none"
								stroke="black"
								viewBox="0 0 24 24"
							>
								<path
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>

				{/* MOBILE MENU */}
				{open && (
					<ul className="md:hidden flex flex-col space-y-4 pb-5 font-medium text-black animate-fadeIn">
						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200">
							Home
						</li>
						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200">
							Add Properties
						</li>
						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200">
							Show Properties
						</li>
						<li className="px-3 py-2 rounded-md hover:bg-black/10 duration-200">
							About
						</li>

						{/* MOBILE NOTIFICATIONS */}
						<li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-black/10 duration-200">
							<div className="relative">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.7"
									stroke="black"
									className="w-7 h-7"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M14.25 18.75a1.5 1.5 0 01-3 0M12 6.75a5.25 5.25 0 00-5.25 5.25v2.25c0 .621-.504 1.125-1.125 1.125h15.75c-.621 0-1.125-.504-1.125-1.125V12c0-2.899-2.351-5.25-5.25-5.25z"
									/>
								</svg>
								<span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-[6px] py-[2px] rounded-full">
									{notifications}
								</span>
							</div>
							<span>Notifications</span>
						</li>

						<li className="px-4 py-2 bg-black text-white rounded-md w-fit">
							Login / Register
						</li>
					</ul>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
