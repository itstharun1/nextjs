import MainDashboard from "@/hosteldashboardcomponent/MainDashboard";
import Navbaraddhostel from "@/addhostelcomponets/Navbaraddhostel";
import IncomeReport from "@/hosteldashboardcomponent/Incomereports";
const page = () => {
	return (
		<div className="w-full bg-gradient-to-r from-blue-600 via-blue-300 via-gray-200 to-yellow-400 pt-14 md:pt-20 pb-6">
			<Navbaraddhostel />
			<MainDashboard />
			<IncomeReport />
		</div>
	);
};

export default page;
