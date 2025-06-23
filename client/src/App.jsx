import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;