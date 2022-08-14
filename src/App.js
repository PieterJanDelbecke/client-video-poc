import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import VideoPage from "./Pages/VideoPage";

import Context from "./context/Context";
import VideoCroppingPage from "./Pages/VideoCroppingPage";

const App = () => {
	const [context, setContext] = useState({
    test: "test string",
    fileUrl: "",
		previewUrl: "",
		videoUrl: null,
	  measurements: {},
    crop: null
	});

	return (
		<>
			<Context.Provider value={{ context, setContext }}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<VideoPage />} />
						<Route path="/crop" element={<VideoCroppingPage />} />
					</Routes>
				</BrowserRouter>
			</Context.Provider>
		</>
	);
};

export default App;
