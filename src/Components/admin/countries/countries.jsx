import React, { useState, useEffect } from "react";
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
} from "@mui/material";

import "toastify-js/src/toastify.css";
import "../../../assets/general-design.css";

import { useTranslation } from "react-i18next";
import { use } from "i18next";

import Toastify from "toastify-js";
import Loading from "../../../common/loading/loading";
import WrongMessage from "../../../common/wrongMessage/wrongMessage";
import NoData from "../../../common/noData/noData";
import { base_url, config } from "../../../service/service";

import ModalAdd from "./modals/add";
import ModalEdit from "./modals/edit";

function Countries(props) {
  const { t } = useTranslation();

  const emptyValue = {
    name: "",
    name_ar: "",
  };

  const [loading, setLoading] = useState(true);
  const [wrongMessage, setWrongMessage] = useState(false);
  const [totalcountrysLength, setTotalcountrysLength] = useState("");

  const [countries, setCountries] = useState([]);

  //modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [newValue, setNewValue] = useState(emptyValue);

  // search & filter & pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchRequestControls, setSearchRequestControls] = useState({
    queryString: "",
    active: "",
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
            <IconButton color="success" onClick={() => handleEdit(row.id)}>
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

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const url = `${base_url}/admin/countries`;
    await axios
      .get(url)
      .then((res) => {
        setLoading(false);
        setCountries(res.data.data);
        setTotalcountrysLength(res.data.meta?.total);
      })

      .catch((err) => {
        // loading
        setTimeout(function () {
          setLoading(false);
        }, 3000);

        setWrongMessage(true);
      });
  };

  // change any input
  const handleChange = (e) => {
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
    { queryString, activeStatus, filterType, perPage, pageNumber }
  ) => {
    try {
      setSearchRequestControls({
        queryString: queryString,
        active: activeStatus,
        filterType: filterType,
        pageNumber: pageNumber,
        perPage: perPage,
      });

      const res = await axios.get(
        `${base_url}/admin/countries/search?
          per_page=${Number(perPage) || ""}
          &query_string=${queryString || ""}
          &user_account_type_id=${filterType || ""}
          &page=${pageNumber || ""}
          &active=${activeStatus || ""}
    `
      );
      setCountries(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // add
  const handleAdd = () => {
    setAddModal(true);
    setNewValue(emptyValue);
  };

  const handleSubmitCreate = async () => {
    await axios
      .post(`${base_url}/admin/country`, newValue)
      .then((res) => {
        Toastify({
          text: `country created successfully`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        countries.unshift(res.data.data);
        setNewValue(emptyValue);
        setAddModal(false);
      })
      .catch((err) => {
        console.log("err", err.response.data.message);
        Toastify({
          text: `${err.response.data.message}`,
          style: {
            background: "red",
            color: "white",
          },
        }).showToast();
      });
  };

  // edit
  const handleEdit = async (id) => {
    console.log("edit", id);
    const res = await axios.get(`${base_url}/admin/country/${id}`);
    console.log("edit", res.data.data);
    setEditItem(res.data.data);
    setEditModal(true);
  };

  const handleSubmitEdit = async (id) => {
    const data = {
      name: editItem.name,
      name_ar: editItem.name_ar,
    };
    await axios
      .patch(`${base_url}/admin/country/${id}`, data)
      .then((res) => {
        Toastify({
          text: `country updated successfully`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        for (let i = 0; i < countries.length; i++) {
          if (countries[i].id === id) {
            countries[i] = res.data.data;
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
        console.log(err);
      });
  };

  // close any modal
  const handleClose = () => {
    setNewValue(emptyValue);
    setAddModal(false);
    setEditModal(false);
  };

  const ChangeActiveStatus = async (country) => {
    const url = country.active
      ? `${base_url}/admin/country-inactive/${country.id}`
      : `${base_url}/admin/country-active/${country.id}`;
    await axios.patch(url, {}, config);
    setCountries(
      countries.filter((row) => {
        return row.id !== country.id;
      })
    );
  };

  /* HTML SECTION */

  return (
    <>
      {/* loading spinner*/}
      {loading && <Loading></Loading>}
      {/* countries */}
      {!loading && !wrongMessage && (
        <div className="general-design">
          {/* header & add button */}
          <Box className="headerBox">
            <h3 className="header">{t("Countries")}</h3>
            <Button
              className="btn add"
              variant="contained"
              size="small"
              onClick={handleAdd}
              startIcon={<AddLocationAltOutlinedIcon />}
            >
              {t("AddNewValue")}
            </Button>
          </Box>
          {/* end-header & add button */}
          {/* filters */}
          <Box className="filters">
            {/* active filter */}
            <Stack className="stack">
              <TextField
                id={"selectedActive"}
                select
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
            {/* queryString */}
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
          {countries.length !== 0 ? (
            <DataGrid
              sx={{ mt: 3 }}
              rows={countries.map((item, index) => {
                return {
                  index: index + 1,
                  id: item.id,
                  name: item.name,
                  nameAr: item.name_ar,
                  active: item.active,
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
            <NoData data="country" />
          )}
          {/* end-table */}
          {/* pagination */}
          <Stack className="paginationStack">
            <div className="card">
              <Paginator
                rowsPerPageOptions={[5, 10, 20, 30]}
                first={pageNumber}
                rows={rowsPerPage}
                totalRecords={totalcountrysLength}
                onPageChange={onPageChange}
              />
            </div>
          </Stack>
          {/* end-pagination */}
          {/* modals */}
          <ModalAdd
            show={addModal}
            handleClose={handleClose}
            title={t("AddNewValue")}
            newValue={newValue}
            handleChange={handleChange}
            handleSubmitCreate={handleSubmitCreate}
          />
          <ModalEdit
            show={editModal}
            handleClose={handleClose}
            editItem={editItem}
            handleChange={handleChange}
            handleSubmitEdit={() => handleSubmitEdit(editItem.id)}
          />
          {/* end-modals */}
        </div>
      )}
      {/* wrong message */}
      {!loading && wrongMessage && <WrongMessage />}
    </>
  );
}

export default Countries;
