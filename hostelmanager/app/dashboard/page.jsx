"use client";
import OfferBanner from "@/components/OfferBanner";
import ServicesSection from "@/components/ServiceSection";
import OurServicesPage from "@/components/OurServices";
import Reviews from "@/components/Reviews";
import PricingContact from "@/components/PriceAndContactus";

const Dashboard = () => {
	return (
		<div>
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


		</div>
	);
};

export default Dashboard;
