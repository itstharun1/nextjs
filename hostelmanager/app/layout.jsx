import "../assets/styles/global.css";

export const metadata = {
	title: "Hostel Manager",
	keywords: "hostel, management, booking, rooms, students",
	description: "Manage your hostel efficiently with Hostel Manager.",
	icons: {
		icon: "/apple-touch-icon.png",
	},
};

const MainLayout = ({ children }) => {
	return (
		<html lang="en">
			<body className="overflow-x-hidden">
				<main>{children}</main>
			</body>
		</html>
	);
};

export default MainLayout;
