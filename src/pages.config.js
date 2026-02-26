/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIEstimator from './pages/AIEstimator';
import Dashboard from './pages/Dashboard';
import ElectricianDirectory from './pages/ElectricianDirectory';
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
import ProjectInput from './pages/ProjectInput';
import MaterialListViewer from './pages/MaterialListViewer';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIEstimator": AIEstimator,
    "Dashboard": Dashboard,
    "ElectricianDirectory": ElectricianDirectory,
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
    "ProjectInput": ProjectInput,
    "MaterialListViewer": MaterialListViewer,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};