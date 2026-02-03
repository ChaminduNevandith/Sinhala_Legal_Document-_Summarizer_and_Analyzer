import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import SinhalaLegalAI from "../Page/SinhalaLegalAI.jsx";
import Login from "../Page/Login.jsx";
import Signup from "../Page/Signup.jsx";

export default function Routes() {
	return (
		<BrowserRouter>
			<RouterRoutes>
				<Route path="/" element={<SinhalaLegalAI />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
			</RouterRoutes>
		</BrowserRouter>
	);
}

