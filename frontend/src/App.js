import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';

// Utilities
import AnimationLayout from './utility/routeAnimation';
import RemoveLoader from './utility/removeLoader';

// Components
import MenuBar from './components/MenuBar';

// Route Pages
import HomePage from './routes/Home';
import QRCodePage from './routes/QRCode';
import SchedulePage from './routes/Schedule';
import PurchaseHistoryPage from './routes/PurchaseHistory';
import BuyPage from './routes/Buy';
import AdminPanel from './routes/AdminPanel';
import TotalMealsPage from './routes/TotalMeals';
import ScanQRPage from './routes/ScanQR';
import ForecastDashboard from './routes/AI/ForecastDashboard';



// To check if user is logged in
import api from '.';
import UPIPayment from './components/UPI';
import RecommendationsPage from './routes/AI/RecommendationsPage';

export default function App() {
    // Removes the loader after the site has been fully loaded
    useEffect(RemoveLoader, []);

    // State to track authentication across the app
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('api/data/status');
                const newAuthStatus = response.data?.loggedIn || false;

                // If this is a change from not authenticated to authenticated
                if (!isAuthenticated && newAuthStatus) {
                    setJustLoggedIn(true);
                }

                setIsAuthenticated(newAuthStatus);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [isAuthenticated]);

    // Handle redirect after login
    useEffect(() => {
        if (justLoggedIn && isAuthenticated) {
            if (!(window.location.href === "http://localhost:3000/upi-payment")) {
                navigate('/schedule');
            }

            setJustLoggedIn(false); // Reset the flag after redirect
        }
    }, [justLoggedIn, isAuthenticated, navigate]);

    // Protected route component
    const ProtectedRoute = ({ children }) => {
        if (loading) {
            return <div>Loading...</div>;
        }

        return isAuthenticated ? children : <Navigate to="/" />;
    };

    return (
        <div className="App">
            <Layout style={{ minHeight: "100vh" }}>
                <MenuBar />
                <Routes>
                    <Route element={<AnimationLayout />}>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/schedule" element={<SchedulePage />} />

                        {/* Protected routes */}
                        <Route path="/qr-code" element={
                            <ProtectedRoute>
                                <QRCodePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/purchase-history" element={
                            <ProtectedRoute>
                                <PurchaseHistoryPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/buy-coupons" element={
                            <ProtectedRoute>
                                <BuyPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/ai" element={
                            <ProtectedRoute>
                                <RecommendationsPage />;
                            </ProtectedRoute>
                        } />
                        <Route path="/upi-payment" element={
                            <ProtectedRoute>
                                <UPIPayment />
                            </ProtectedRoute>
                        } />

                        {/* Admin routes (these could have additional admin-specific protection) */}
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminPanel />
                            </ProtectedRoute>
                        } />
                        <Route path="/total-meals" element={
                            <ProtectedRoute>
                                <TotalMealsPage />

                            </ProtectedRoute>
                        } />
                        <Route path="/scan-qr" element={
                            <ProtectedRoute>
                                <ScanQRPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/forecast/" element={
                            <ProtectedRoute>
                                <ForecastDashboard />
                            </ProtectedRoute>
                        } />


                    </Route>
                </Routes>
            </Layout>
        </div>
    );
}