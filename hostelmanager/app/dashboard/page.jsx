"use client";
import OfferBanner from "@/components/OfferBanner";
import ServicesSection from "@/components/ServiceSection";
import OurServicesPage from "@/components/OurServices";
import Reviews from "@/components/Reviews";
import PricingContact from "@/components/PriceAndContactus";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
	return (
		<div>
			<Navbar />
			{/* banner*/}
			<OfferBanner />

			{/* service section*/}
			<ServicesSection />

			{/* Main two-column area Our service */}
			<OurServicesPage />

			{/* reviews */}
			<Reviews />

			{/* pricing and contact us */}
			<PricingContact />

			<Footer />
		</div>
	);
};

export default Dashboard;
