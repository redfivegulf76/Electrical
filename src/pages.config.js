import AIEstimator from './pages/AIEstimator';
import Dashboard from './pages/Dashboard';
import EmailSend from './pages/EmailSend';
import Home from './pages/Home';
import PaymentPortal from './pages/PaymentPortal';
import Pricing from './pages/Pricing';
import ProductManagement from './pages/ProductManagement';
import ProductSearch from './pages/ProductSearch';
import ProfileSettings from './pages/ProfileSettings';
import QuoteLists from './pages/QuoteLists';
import SupplierDirectory from './pages/SupplierDirectory';
import Templates from './pages/Templates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIEstimator": AIEstimator,
    "Dashboard": Dashboard,
    "EmailSend": EmailSend,
    "Home": Home,
    "PaymentPortal": PaymentPortal,
    "Pricing": Pricing,
    "ProductManagement": ProductManagement,
    "ProductSearch": ProductSearch,
    "ProfileSettings": ProfileSettings,
    "QuoteLists": QuoteLists,
    "SupplierDirectory": SupplierDirectory,
    "Templates": Templates,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};