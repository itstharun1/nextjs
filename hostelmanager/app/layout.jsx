import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
                <Navbar />
				<main>{children}</main>
                <Footer />
			</body>
		</html>
	);
};

export default MainLayout;
