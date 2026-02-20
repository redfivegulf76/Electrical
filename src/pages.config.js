import Dashboard from './pages/Dashboard';
import ProductSearch from './pages/ProductSearch';
import QuoteLists from './pages/QuoteLists';
import AIEstimator from './pages/AIEstimator';
import Templates from './pages/Templates';
import SupplierDirectory from './pages/SupplierDirectory';
import EmailSend from './pages/EmailSend';
import Pricing from './pages/Pricing';
import ProductManagement from './pages/ProductManagement';
import ProfileSettings from './pages/ProfileSettings';
import ElectricianDirectory from './pages/ElectricianDirectory';
import PaymentPortal from './pages/PaymentPortal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ProductSearch": ProductSearch,
    "QuoteLists": QuoteLists,
    "AIEstimator": AIEstimator,
    "Templates": Templates,
    "SupplierDirectory": SupplierDirectory,
    "EmailSend": EmailSend,
    "Pricing": Pricing,
    "ProductManagement": ProductManagement,
    "ProfileSettings": ProfileSettings,
    "ElectricianDirectory": ElectricianDirectory,
    "PaymentPortal": PaymentPortal,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};