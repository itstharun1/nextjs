
import Navbaraddhostel from "@/addhostelcomponets/Navbaraddhostel";
import HostelFloorsManager from "@/addhostelcomponets/HostelFloorsManager";

const page = () => {
	return (
		<div className="min-h-screen bg-gradient-to-r from-blue-500 via-sky-200 to-yellow-400 p-8">
			<Navbaraddhostel />
			<HostelFloorsManager/>
		</div>
	);
};

export default page;
