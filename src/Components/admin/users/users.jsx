import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

/* main function */
function Users(props) {
  const { t } = useTranslation();

  const emptyValue = {
    name: "",
    name_ar: "",
  };

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [wrongMessage, setWrongMessage] = useState(false);
  const [totalUsersLength, setTotalUsersLength] = useState("");

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

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const url = `${base_url}/admin/users/search`;
    await axios
      .get(url)
      .then((res) => {
        setLoading(false);
        setUsers(res.data.data);
        setTotalUsersLength(res.data.meta?.total);
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
        `${base_url}/admin/users/search?
          per_page=${Number(perPage) || ""}
          &query_string=${queryString || ""}
          &user_account_type_id=${filterType || ""}
          &page=${pageNumber || ""}
          &active=${activeStatus || ""}
    `
      );
      setUsers(res.data.data);
    } catch (err) {}
  };

  const openCreateModal = () => {
    setAddModal(true);
    setNewValue(emptyValue);
  };

  const handleSubmitCreate = async () => {
    await axios
      .post(`${base_url}/admin/user`, newValue)
      .then((res) => {
        Toastify({
          text: `user created successfully`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        users.unshift(res.data.data);
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
      .patch(`${base_url}/admin/user/${id}`, data)
      .then((res) => {
        Toastify({
          text: `user updated successfully`,
          style: {
            background: "green",
            color: "white",
          },
        }).showToast();
        for (let i = 0; i < users.length; i++) {
          if (users[i].id === id) {
            users[i] = res.data.data;
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

  const ChangeActiveStatus = async (user) => {
    const url = user.active
      ? `${base_url}/admin/user-inactive/${user.id}`
      : `${base_url}/admin/user-active/${user.id}`;

    await axios.patch(url, {}, config).then(function (res) {
      handleSearchReq(user, { activeStatus: searchRequestControls.active });
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
      field: "active",
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
      {/* users */}
      {!loading && !wrongMessage && (
        <div className="general-design">
          {/* header & add button */}
          <Box className="headerBox">
            <h3 className="header">{t("Users")}</h3>
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
          {users.length !== 0 ? (
            <DataGrid
              sx={{ mt: 3 }}
              rows={users.map((item, index) => {
                return {
                  index: index + 1,
                  id: item.id,
                  name: item.name,
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
            <NoData data="user" />
          )}
          {/* end-table */}
          {/* pagination */}
          <Stack className="paginationStack">
            <div className="card">
              <Paginator
                rowsPerPageOptions={[5, 10, 20, 30]}
                first={pageNumber}
                rows={rowsPerPage}
                totalRecords={totalUsersLength}
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

export default Users;
