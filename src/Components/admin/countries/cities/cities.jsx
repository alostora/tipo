import React, { useState, useEffect } from "react";
import { useParams } from "react-router";

import axios from "axios";
import { Paginator } from "primereact/paginator";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import "toastify-js/src/toastify.css";
import "../../../../assets/general-design.css";

import { useTranslation } from "react-i18next";
import { use } from "i18next";

import Toastify from "toastify-js";
import Loading from "../../../../common/loading/loading";
import WrongMessage from "../../../../common/wrongMessage/wrongMessage";
import NoData from "../../../../common/noData/noData";
import { base_url, config } from "../../../../service/service";

import ModalAdd from "./modals/add";
import ModalEdit from "./modals/edit";

/* main function */
function Cities(props) {
  const params = useParams();

  console.log(params.country_id);

  const { t } = useTranslation();

  const emptyValue = {
    country_id: params.country_id,
    name: "",
    name_ar: "",
  };

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [wrongMessage, setWrongMessage] = useState(false);
  const [totalCitiesLength, settotalCitiesLength] = useState("");

  //modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [newValue, setNewValue] = useState(emptyValue);

  // search & filter & pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchRequestControls, setSearchRequestControls] = useState({
    countryId: params.country_id,
    queryString: "",
    activeStatus: "",
    filterType: "",
    pageNumber: "",
    perPage: "",
  });

  const [activeStatusArr] = useState([
    {
      id: "active",
      name: "Active",
    },
    {
      id: "inactive",
      name: "InActive",
    },
  ]);

  useEffect(() => {
    getData();
    getcountries();
  }, []);

  const getData = async () => {
    const url = `${base_url}/admin/governorates-search-all?country_id=${
      params.country_id ? params.country_id : ""
    }`;
    await axios
      .get(url)
      .then((res) => {
        setLoading(false);
        setCities(res.data.data);
        settotalCitiesLength(res.data.meta?.total);
      })

      .catch((err) => {
        // loading
        setTimeout(function () {
          setLoading(false);
        }, 3000);

        setWrongMessage(true);
      });
  };

  const getcountries = async () => {
    const url = `${base_url}/country/countries`;
    await axios
      .get(url)
      .then((res) => {
        setLoading(false);
        setCountries(res.data.data);
      })

      .catch((err) => {
        // loading
        setTimeout(function () {
          setLoading(false);
        }, 3000);

        setWrongMessage(true);
      });
  };

  const repareRequest = (e) => {
    const newData = {
      ...newValue,
      [e.target.name]: e.target.value,
    };
    setNewValue(newData);

    const newItem = {
      ...editItem,
      [e.target.name]: e.target.value,
    };
    setEditItem(newItem);
  };

  const onPageChange = (e) => {
    setRowsPerPage(e.rows);
    setPageNumber(e.page + 1);

    handleSearchReq(e, {
      perPage: e.rows,
      pageNumber: e.page + 1,
    });
  };

  const handleSearchReq = async (
    e,
    { countryId, queryString, activeStatus, filterType, perPage, pageNumber }
  ) => {
    try {
      setSearchRequestControls({
        countryId: countryId,
        queryString: queryString,
        activeStatus: activeStatus,
        filterType: filterType,
        pageNumber: pageNumber,
        perPage: perPage,
      });

      const res = await axios.get(
        `${base_url}/admin/governorates-search-all?
        &country_id=${countryId || ""}
        &query_string=${queryString || ""}
          per_page=${Number(perPage) || ""}
          &page=${pageNumber || ""}
          &active=${activeStatus || ""}
    `
      );
      setCities(res.data.data);
    } catch (err) {}
  };

  const openCreateModal = () => {
    setAddModal(true);
    setNewValue(emptyValue);
  };

  const handleSubmitCreate = async () => {
    await axios
      .post(`${base_url}/admin/governorate`, newValue)
      .then((res) => {
        Toastify({
          text: `${t("CreatedSuccessfully")}`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        cities.unshift(res.data.data);
        setNewValue(emptyValue);
        setAddModal(false);
      })
      .catch((err) => {
        Toastify({
          text: `${err.response.data.message}`,
          style: {
            background: "red",
            color: "white",
          },
        }).showToast();
      });
  };

  const openEditModal = async (row) => {

    setEditItem(row);
    setEditModal(true);
  };

  const handleSubmitEdit = async (id) => {
    const data = {
      name: editItem.name,
      name_ar: editItem.name_ar,
    };
    await axios
      .patch(`${base_url}/admin/governorate/${id}`, data)
      .then((res) => {
        Toastify({
          text: `${t("UpdatedSuccessfully")}`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        for (let i = 0; i < cities.length; i++) {
          if (cities[i].id === id) {
            cities[i] = res.data.data;
          }
        }
        setEditItem({});
        setEditModal(false);
      })
      .catch((err) => {
        Toastify({
          text: `${err.response.data.message}`,
          style: {
            background: "red",
            color: "white",
          },
        }).showToast();
      });
  };

  const closeModal = () => {
    setNewValue(emptyValue);
    setAddModal(false);
    setEditModal(false);
  };

  const ChangeActiveStatus = async (city) => {
    const url = city.active
      ? `${base_url}/admin/governorate-inactive/${city.id}`
      : `${base_url}/admin/governorate-active/${city.id}`;

    await axios.patch(url, {}, config).then(function (res) {
      handleSearchReq(city, {
        activeStatus: searchRequestControls.activeStatus,
      });
    });
  };

  /* columns */
  const columns = [
    {
      field: "index",
      headerName: "Id",
      width: 33,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: t("Name"),
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "nameAr",
      headerName: t("NameAr"),
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "activation",
      headerName: t("Activation"),
      flex: 1,
      flexGrow: 1,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => {
        return (
          <Box className="activeBox">
            <Typography sx={{}}>
              <IconButton
                id="activButton"
                color="success"
                onClick={() => {
                  ChangeActiveStatus(row);
                }}
              >
                <CheckBoxOutlinedIcon
                  sx={{
                    color: row.active ? "green" : "red",
                  }}
                  fontSize="small"
                />
              </IconButton>

              {row.active ? t("Active") : t("Inactive")}

              {}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("Actions"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => {
        return (
          <Box className="actionsBox">
            <IconButton color="success" onClick={() => openEditModal(row)}>
              <BorderColorOutlinedIcon
                sx={{
                  color: "green",
                }}
                fontSize="small"
              />
            </IconButton>
          </Box>
        );
      },
    },
  ];
  /* end-columns */

  /* HTML SECTION */
  return (
    <>
      {/* loading spinner*/}
      {loading && <Loading></Loading>}
      {/* cities */}
      {!loading && !wrongMessage && (
        <div className="general-design">
          {/* header & add button */}
          <Box className="headerBox">
            <h3 className="header">{t("Cities")}</h3>
            <Button
              className="btn add"
              variant="contained"
              size="small"
              onClick={openCreateModal}
              startIcon={<AddLocationAltOutlinedIcon />}
            >
              {t("AddNewValue")}
            </Button>
          </Box>
          {/* end-header & add button */}

          {/* filters */}
          <Box className="filters">
            {/* active filter */}
            <Stack className="stack" sx={{ width: "10%" }}>
              <TextField
                select
                fullWidth
                label={t("Active ")}
                defaultValue="all"
                variant="standard"
                size="small"
                onChange={(e) =>
                  handleSearchReq(e, { activeStatus: e.target.value })
                }
              >
                <MenuItem key="all" value="all">
                  {t("All")}
                </MenuItem>
                {activeStatusArr?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {/* end-active filter */}

            {/* country filter */}
            <Stack className="stack" sx={{ width: "10%" }}>
              <TextField
                select
                fullWidth
                label={t("Countries ")}
                defaultValue="all"
                variant="standard"
                size="larg"
                onChange={(e) => {
                  handleSearchReq(e, {
                    countryId: e.target.value !== "all" ? e.target.value : null,
                  });
                }}
              >
                <MenuItem key="all" value="all">
                  {t("All")}
                </MenuItem>
                {countries?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {/* end-country filter */}
            {/* queryString filter*/}
            <Stack className="searchStack">
              <TextField
                className="inputSearch"
                autoFocus
                margin="dense"
                id="search"
                label={t("Search")}
                type="search"
                fullWidth
                variant="standard"
                name="queryString"
                value={searchRequestControls.queryString}
                onChange={(e) =>
                  handleSearchReq(e, { queryString: e.target.value })
                }
              />
            </Stack>
            {/* end-queryString */}
          </Box>
          {/* end-filters */}
          {/* table */}
          {cities.length !== 0 ? (
            <DataGrid
              sx={{ mt: 3 }}
              rows={cities.map((item, index) => {
                return {
                  index: index + 1,
                  id: item.id,
                  name: item.name,
                  nameAr: item.name_ar,
                  active: item.active,
                  stopped_at: item.stopped_at,
                };
              })}
              rowHeight={40}
              slots={{ toolbar: GridToolbar }}
              // @ts-ignore
              columns={columns}
              autoHeight
              hideFooter
            />
          ) : (
            <NoData data="city" />
          )}
          {/* end-table */}
          {/* pagination */}
          <Stack className="paginationStack">
            <div className="card">
              <Paginator
                rowsPerPageOptions={[5, 10, 20, 30]}
                first={pageNumber}
                rows={rowsPerPage}
                totalRecords={totalCitiesLength}
                onPageChange={onPageChange}
              />
            </div>
          </Stack>
          {/* end-pagination */}
          {/* modals */}
          <ModalAdd
            show={addModal}
            closeModal={closeModal}
            title={t("AddNewValue")}
            newValue={newValue}
            repareRequest={repareRequest}
            handleSubmitCreate={handleSubmitCreate}
          />
          <ModalEdit
            show={editModal}
            closeModal={closeModal}
            editItem={editItem}
            repareRequest={repareRequest}
            handleSubmitEdit={() => handleSubmitEdit(editItem.id)}
          />
          {/* end-modals */}
        </div>
      )}
      {/* wrong message */}
      {!loading && wrongMessage && <WrongMessage />}
    </>
  );
  /* END SECTION */
}

export default Cities;
