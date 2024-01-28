import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../../../../common/show modal/showModal.css";
import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";

function ModalEdit(props) {
  const { t } = useTranslation();

  return (
    <Modal show={props.show} onHide={props.closeModal} className="Modal">
      <Modal.Header closeButton>
        <Modal.Title>{t("EditCity")} </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="post">
          <TextField
            autoFocus
            className="input"
            id="outlined-basic"
            variant="outlined"
            type="text"
            label={t("Name")}
            name="name"
            value={props.editItem?.name}
            onChange={props.repareRequest}
          />
          <TextField
            className="input"
            id="outlined-basic"
            variant="outlined"
            type="text"
            label={t("Arabic Name")}
            name="name_ar"
            value={props.editItem?.nameAr}
            onChange={props.repareRequest}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="close btn btn-danger"
          variant="secondary"
          onClick={props.closeModal}
        >
          {t("Close")}
        </Button>
        <Button
          className="btn btn-primary"
          variant="primary"
          onClick={props.handleSubmitEdit}
          //   onClick={() => handleSubmitEdit(editItem.id)}
        >
          {t("Save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEdit;
