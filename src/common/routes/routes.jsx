import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../../components/login/login";
import App from "../../App";
import NotFound from "../../components/notFound/notFound";
import Countries from "../../components/admin/countries/countries/countries";
import Cities from "../../components/admin/countries/cities/cities";
import Users from "../../components/admin/users/users";
import Dashboard from "../../components/admin/dashboard/dashboard";

const AllRoutes = () => {
  return (
    <BrowserRouter basename="">
      <Routes>
        <Route
          path="/"
          element={
            sessionStorage.getItem("token") == null ? <Login /> : <App />
          }
        >
          <Route path="admin-dashboard" element={<Dashboard />} />
          <Route path={"countries"} element={<Countries />} />
          <Route path={"cities/:country_id"} element={<Cities />} />
          <Route path={"cities"} element={<Cities />} />
          <Route path={"users"} element={<Users />} />



          <Route path={"*"} element={<NotFound />} />

          {/* /////////////////////////// */}
          {/* client */}
          <Route path="client-dashboard">
            {/* <Route path="" element={<ClientDashboard />} /> */}

            {/* <Route path={"companies"} element={<ClientCompanies />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AllRoutes;
