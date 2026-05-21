/* eslint-disable react/prop-types */
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

const PermissionPopup = ({
  show,
  onClose,
  role,
}) => {

  // =========================================
  // STATES
  // =========================================
  const [permissions, setPermissions] =
    useState([]);

  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [search, setSearch] =
    useState("");

  // =========================================
  // AUTH HEADER
  // =========================================
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem(
      "token"
    )}`,
  });

  // =========================================
  // FETCH PERMISSIONS
  // =========================================
  const fetchPermissions =
    async () => {

      try {

        setLoading(true);

        const response =
          await axios.get(
            `${import.meta.env.VITE_BACKEND_API_URL}role/permissions`,
            {
              headers: authHeader(),
            }
          );

        setPermissions(
          response?.data?.data || []
        );

      } catch (error) {

        console.log(
          "Fetch Permission Error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

  // =========================================
  // FETCH ASSIGNED PERMISSIONS
  // =========================================
  const fetchRolePermissions =
    async () => {

      try {

        if (!role?._id) return;

        const response =
          await axios.get(
            `${import.meta.env.VITE_BACKEND_API_URL}role/role-permission/role/${role._id}`,
            {
              headers: authHeader(),
            }
          );

        const assigned =
          response?.data?.data || [];

        const ids = assigned.map(
          (item) =>
            item.permission_id?._id ||
            item.permission_id
        );

        setSelectedPermissions(ids);

      } catch (error) {

        console.log(
          "Fetch Role Permission Error:",
          error
        );
      }
    };

  // =========================================
  // USE EFFECT
  // =========================================
  useEffect(() => {

    if (show) {

      fetchPermissions();

      fetchRolePermissions();

      setSaved(false);
    }

  }, [show, role]);

  // =========================================
  // FILTER + GROUP MODULE
  // =========================================
  const groupedPermissions =
    useMemo(() => {

      const filtered =
        permissions.filter(
          (permission) => {

            const text = `
              ${permission.name}
              ${permission.label}
              ${permission.permission_module}
            `.toLowerCase();

            return text.includes(
              search.toLowerCase()
            );
          }
        );

      return filtered.reduce(
        (acc, permission) => {

          const module =
            permission.permission_module;

          if (!acc[module]) {
            acc[module] = [];
          }

          acc[module].push(permission);

          return acc;

        },
        {}
      );
    }, [permissions, search]);

  // =========================================
  // ALL IDS
  // =========================================
  const allPermissionIds =
    permissions.map((p) => p._id);

  const allSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) =>
      selectedPermissions.includes(id)
    );

  // =========================================
  // TOGGLE SINGLE
  // =========================================
  const togglePermission = (
    permissionId
  ) => {

    setSaved(false);

    setSelectedPermissions((prev) => {

      if (
        prev.includes(permissionId)
      ) {

        return prev.filter(
          (id) =>
            id !== permissionId
        );
      }

      return [
        ...prev,
        permissionId,
      ];
    });
  };

  // =========================================
  // TOGGLE MODULE
  // =========================================
  const toggleModule = (
    modulePermissions
  ) => {

    setSaved(false);

    const ids =
      modulePermissions.map(
        (p) => p._id
      );

    const isAllSelected =
      ids.every((id) =>
        selectedPermissions.includes(id)
      );

    if (isAllSelected) {

      setSelectedPermissions(
        (prev) =>
          prev.filter(
            (id) =>
              !ids.includes(id)
          )
      );

    } else {

      setSelectedPermissions(
        (prev) => [
          ...new Set([
            ...prev,
            ...ids,
          ]),
        ]
      );
    }
  };

  // =========================================
  // TOGGLE ALL
  // =========================================
  const toggleAllPermissions =
    () => {

      setSaved(false);

      if (allSelected) {

        setSelectedPermissions([]);

      } else {

        setSelectedPermissions(
          allPermissionIds
        );
      }
    };

  // =========================================
  // SAVE
  // =========================================
  const handleSave =
    async () => {

      try {

        setSaving(true);

        await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}role/role-permission/create`,
          {
            role_id: role._id,
            permission_ids: selectedPermissions
          },
          {
            headers: authHeader(),
          }
        );

        setSaved(true);

      } catch (error) {

        console.log(
          "Save Permission Error:",
          error
        );

      } finally {

        setSaving(false);

      }
    };

  // =========================================
  // CLOSE
  // =========================================
  if (!show) return null;

  return (
    <>

      {/* ========================================= */}
      {/* CUSTOM CSS */}
      {/* ========================================= */}
      <style>
        {`

          .permission-modal .modal-content{
            border-radius:24px;
            overflow:hidden;
            border:none;
          }

          .permission-bg{
            background:#f4f7fb;
          }

          .permission-module-card{
            border:none;
            border-radius:20px;
            overflow:hidden;
            transition:0.3s;
          }

          .permission-module-card:hover{
            transform:translateY(-2px);
          }

          .permission-card{
            border-radius:18px;
            transition:0.3s ease;
            cursor:pointer;
            border:1px solid #edf0f5;
            background:#fff;
          }

          .permission-card:hover{
            transform:translateY(-4px);
            box-shadow:0 12px 24px rgba(0,0,0,0.08);
          }

          .permission-card.active{
            background:linear-gradient(
              135deg,
              rgba(25,135,84,0.12),
              rgba(25,135,84,0.05)
            );
            border:1px solid #198754;
          }

          .permission-icon{
            width:52px;
            height:52px;
            border-radius:16px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f1f3f7;
            font-size:20px;
          }

          .permission-card.active .permission-icon{
            background:#198754;
            color:#fff;
          }

          .module-badge{
            background:#eef3ff;
            color:#3766ff;
            padding:6px 14px;
            border-radius:50px;
            font-size:12px;
            font-weight:600;
          }

          .custom-search{
            border-radius:16px;
            height:52px;
            border:1px solid #e2e8f0;
            padding-left:50px;
          }

          .custom-search:focus{
            box-shadow:none;
            border-color:#198754;
          }

          .custom-scroll::-webkit-scrollbar{
            width:7px;
          }

          .custom-scroll::-webkit-scrollbar-thumb{
            background:#d0d7de;
            border-radius:50px;
          }

        `}
      </style>

      {/* BACKDROP */}
      <div className="modal-backdrop show"></div>

      {/* MODAL */}
      <div className="modal d-block permission-modal">

        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

          <div className="modal-content">

            {/* ========================================= */}
            {/* HEADER */}
            {/* ========================================= */}
            <div className="modal-header border-0 px-4 pt-4 pb-3">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 65,
                    height: 65,
                    borderRadius: 20,
                    background:
                      "linear-gradient(135deg,#198754,#20c997)",
                    color: "#fff",
                    fontSize: 24,
                  }}
                >

                  <i className="fa fa-user-shield"></i>

                </div>

                <div>

                  <h3 className="fw-bold mb-1">

                    Role Permissions

                  </h3>

                  <div className="text-muted">

                    Manage permissions for

                    <strong className="text-dark ms-1">

                      {role?.name}

                    </strong>

                  </div>

                </div>

              </div>

              <button
                className="btn-close"
                onClick={onClose}
              ></button>

            </div>

            {/* ========================================= */}
            {/* SEARCH + SELECT ALL */}
            {/* ========================================= */}
            <div className="px-4 pb-3">

              <div className="row g-3 align-items-center">

                {/* SEARCH */}
                <div className="col-md-8">

                  <div className="position-relative">

                    <i
                      className="fa fa-search position-absolute text-muted"
                      style={{
                        left: 18,
                        top: 18,
                      }}
                    ></i>

                    <input
                      type="text"
                      className="form-control custom-search"
                      placeholder="Search permissions..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* SELECT ALL */}
                <div className="col-md-4">

                  <div
                    className="bg-light rounded-4 px-4 py-3 d-flex justify-content-between align-items-center"
                  >

                    <div>

                      <h6 className="mb-0 fw-bold">

                        Select All

                      </h6>

                      <small className="text-muted">

                        Grant all permissions

                      </small>

                    </div>

                    <div className="form-check form-switch">

                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                          allSelected
                        }
                        onChange={
                          toggleAllPermissions
                        }
                        style={{
                          width: 55,
                          height: 26,
                          cursor: "pointer",
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ========================================= */}
            {/* BODY */}
            {/* ========================================= */}
            <div
              className="modal-body permission-bg custom-scroll"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >

              {/* SUCCESS */}
              {
                saved && (
                  <div className="alert alert-success border-0 shadow-sm">

                    <i className="fa fa-check-circle me-2"></i>

                    Permissions saved successfully.

                  </div>
                )
              }

              {/* LOADING */}
              {
                loading ? (

                  <div className="text-center py-5">

                    <div
                      className="spinner-border text-success"
                      style={{
                        width: 60,
                        height: 60,
                      }}
                    ></div>

                  </div>

                ) : Object.keys(
                  groupedPermissions
                ).length === 0 ? (

                  <div className="text-center py-5">

                    <div
                      className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background:
                          "#edf2f7",
                      }}
                    >

                      <i className="fa fa-lock fa-2x text-muted"></i>

                    </div>

                    <h4 className="fw-bold">

                      No Permissions Found

                    </h4>

                    <p className="text-muted">

                      Permission list is empty.

                    </p>

                  </div>

                ) : (

                  Object.entries(
                    groupedPermissions
                  ).map(
                    ([
                      module,
                      modulePermissions,
                    ]) => {

                      const moduleSelected =
                        modulePermissions.every(
                          (
                            permission
                          ) =>
                            selectedPermissions.includes(
                              permission._id
                            )
                        );

                      return (

                        <div
                          key={module}
                          className="card permission-module-card shadow-sm mb-4"
                        >

                          {/* MODULE HEADER */}
                          <div className="card-header bg-white border-0 px-4 py-3">

                            <div className="d-flex justify-content-between align-items-center">

                              <div className="d-flex align-items-center gap-3">

                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 16,
                                    background:
                                      "rgba(13,110,253,0.1)",
                                  }}
                                >

                                  <i className="fa fa-folder text-primary"></i>

                                </div>

                                <div>

                                  <h5 className="fw-bold mb-1">

                                    {module}

                                  </h5>

                                  <span className="module-badge">

                                    {
                                      modulePermissions.length
                                    } Permissions

                                  </span>

                                </div>

                              </div>

                              {/* MODULE SELECT */}
                              <div className="form-check form-switch">

                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={
                                    moduleSelected
                                  }
                                  onChange={() =>
                                    toggleModule(
                                      modulePermissions
                                    )
                                  }
                                  style={{
                                    width: 50,
                                    height: 24,
                                    cursor: "pointer",
                                  }}
                                />

                              </div>

                            </div>

                          </div>

                          {/* MODULE BODY */}
                          <div className="card-body p-4">

                            <div className="row">

                              {
                                modulePermissions.map(
                                  (
                                    permission
                                  ) => {

                                    const checked =
                                      selectedPermissions.includes(
                                        permission._id
                                      );

                                    return (

                                      <div
                                        className="col-md-6 col-lg-4 col-xl-3 mb-4"
                                        key={
                                          permission._id
                                        }
                                      >

                                        <div
                                          className={`permission-card h-100 p-3 ${
                                            checked
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            togglePermission(
                                              permission._id
                                            )
                                          }
                                        >

                                          {/* TOP */}
                                          <div className="d-flex justify-content-between align-items-start mb-3">

                                            <div
                                              className="permission-icon"
                                            >

                                              <i className="fa fa-lock"></i>

                                            </div>

                                            <input
                                              type="checkbox"
                                              checked={
                                                checked
                                              }
                                              onChange={() =>
                                                togglePermission(
                                                  permission._id
                                                )
                                              }
                                              className="form-check-input"
                                            />

                                          </div>

                                          {/* LABEL */}
                                          <h6 className="fw-bold mb-1">

                                            {
                                              permission.label
                                            }

                                          </h6>

                                          {/* NAME */}
                                          <div className="text-muted small mb-2">

                                            {
                                              permission.name
                                            }

                                          </div>

                                          {/* MODULE */}
                                          <span className="badge bg-light text-dark">

                                            {
                                              permission.permission_module
                                            }

                                          </span>

                                        </div>

                                      </div>
                                    );
                                  }
                                )
                              }

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )
                )
              }

            </div>

            {/* ========================================= */}
            {/* FOOTER */}
            {/* ========================================= */}
            <div className="modal-footer border-0 bg-white px-4 py-3">

              <div className="me-auto">

                <div className="fw-bold">

                  Selected Permissions:

                  <span className="text-success ms-2">

                    {
                      selectedPermissions.length
                    }

                  </span>

                </div>

              </div>

              <button
                className="btn btn-light px-4"
                onClick={onClose}
              >

                <i className="fa fa-times me-2"></i>

                Close

              </button>

              <button
                className="btn btn-success px-4"
                onClick={handleSave}
                disabled={saving}
              >

                {
                  saving ? (
                    <>

                      <span className="spinner-border spinner-border-sm me-2"></span>

                      Saving...

                    </>
                  ) : (
                    <>

                      <i className="fa fa-save me-2"></i>

                      Save Permissions

                    </>
                  )
                }

              </button>

            </div>

          </div>

        </div>

      </div>

    </>
  );
};

export default PermissionPopup;