import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import SinhalaLegalAI from "../Page/SinhalaLegalAI.jsx";
import Login from "../Page/Login.jsx";
import Signup from "../Page/Signup.jsx";
import UserDashboard from "../Page/UserDashboard.jsx";
import UploadNewDocument from "../Page/UploadNewDocument.jsx";
import DocumentDetails from "../Page/DocumentDetails.jsx";
import client from "../api/client";

function ProtectedRoute({ children }) {
	const [loading, setLoading] = useState(true);
	const [authed, setAuthed] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				await client.get("/api/auth/me");
				if (mounted) setAuthed(true);
			} catch (e) {
				if (mounted) setAuthed(false);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	if (loading) return null;
	if (!authed) return <Navigate to="/login" replace />;
	return children;
}

export default function Routes() {
	return (
		<BrowserRouter>
			<RouterRoutes>
				<Route path="/info" element={<SinhalaLegalAI />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><UploadNewDocument /></ProtectedRoute>} />
				<Route path="/document" element={<ProtectedRoute><DocumentDetails /></ProtectedRoute>} />
			</RouterRoutes>
		</BrowserRouter>
	);
}

