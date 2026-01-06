import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";
import { initGrafanaFaro } from "./util/grafanaFaro";

export const App = () => {
	useEffect(() => {
		initGrafanaFaro();
	}, []);

	return <Dashboard />;
};
