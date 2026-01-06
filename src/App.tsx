import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";
import { initGrafanaFaro } from "./util/grafanaFaro";

export function App() {
	useEffect(() => {
		initGrafanaFaro();
	}, []);

	return <Dashboard />;
}
