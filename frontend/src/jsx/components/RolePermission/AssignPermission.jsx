/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const modules = [
  { name: "Solar Panel", icon: "fa-solar-panel" },
  { name: "Tracking System", icon: "fa-crosshairs" },
  { name: "Battery", icon: "fa-battery-full" },
  { name: "Dispatch", icon: "fa-paper-plane" },
  { name: "Users", icon: "fa-users" },
  { name: "Reciver", icon: "fa-truck" },
];

const PERMS = ["view", "add", "edit", "delete"];

const buildInitial = () => {
  const initial = {};
  modules.forEach(({ name }) => {
    initial[name] = { view: false, add: false, edit: false, delete: false };
  });
  return initial;
};

const PermissionPopup = ({ show, onClose, role }) => {
  const [permissions, setPermissions] = useState(buildInitial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPermissions(buildInitial());
    setSaved(false);
  }, [role]);

  if (!show) return null;

  const toggle = (module, perm) => {
    setSaved(false);
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [perm]: !prev[module][perm] },
    }));
  };

  const toggleRow = (module) => {
    setSaved(false);
    const allChecked = Object.values(permissions[module]).every(Boolean);
    const updated = {};
    PERMS.forEach((k) => { updated[k] = !allChecked; });
    setPermissions((prev) => ({ ...prev, [module]: updated }));
  };

  const toggleColumn = (perm) => {
    setSaved(false);
    const allChecked = modules.every(({ name }) => permissions[name]?.[perm]);
    setPermissions((prev) => {
      const next = { ...prev };
      modules.forEach(({ name }) => {
        next[name] = { ...next[name], [perm]: !allChecked };
      });
      return next;
    });
  };

  const toggleAll = () => {
    setSaved(false);
    const allChecked = modules.every(({ name }) =>
      PERMS.every((p) => permissions[name]?.[p])
    );
    setPermissions((prev) => {
      const next = { ...prev };
      modules.forEach(({ name }) => {
        next[name] = { view: !allChecked, add: !allChecked, edit: !allChecked, delete: !allChecked };
      });
      return next;
    });
  };

  const isAllChecked = modules.every(({ name }) =>
    PERMS.every((p) => permissions[name]?.[p])
  );

  const isColumnChecked = (perm) =>
    modules.every(({ name }) => permissions[name]?.[perm]);

  const handleSave = () => {
    console.log("Saved Permissions for:", role?.name, permissions);
    setSaved(true);
  };

  return (
    <>
      <div className="modal-backdrop show"></div>

      <div className="modal d-block" >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <div className="d-flex align-items-center gap-2">
               <div>
                  <i className="fa fa-lock text-info fs-5"></i>
                </div>
                <div>
                  <h5 className="modal-title mb-0">Role Permissions</h5>
                  <small className="text-muted">
                    Assign permissions for{" "}
                    <strong className="text-dark">{role?.name}</strong>
                  </small>
                </div>
              </div>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body">

              {saved && (
                <div className="alert alert-success alert-dismissible py-2 mb-3" role="alert">
                  <i className="fa fa-check-circle me-2"></i>
                  Permissions saved successfully for <strong>{role?.name}</strong>!
                  <button type="button" className="btn-close py-2" onClick={() => setSaved(false)}></button>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover  align-middle text-center">

                  <thead className="">
                    <tr>
                      <th className="text-start" style={{ width: "30%" }}>Module</th>

                      {/* Master select all */}
                      <th style={{ width: "14%" }}>
                        <div className="d-flex flex-column align-items-center gap-1">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={isAllChecked}
                            onChange={toggleAll}
                            title="Select All"
                          />
                          <span style={{ fontSize: 11, fontWeight: 400 }}>All</span>
                        </div>
                      </th>

                      {/* Column headers */}
                      {PERMS.map((perm) => (
                        <th key={perm} style={{ width: "14%" }}>
                          <div className="d-flex flex-column align-items-center gap-1">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={isColumnChecked(perm)}
                              onChange={() => toggleColumn(perm)}
                              title={`Select all ${perm}`}
                            />
                            <span style={{ fontSize: 11, fontWeight: 400 }}>
                              {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {modules.map(({ name, icon }) => {
                      const rowPerms = permissions[name] || {};
                      const allRow = PERMS.every((p) => rowPerms[p]);
                      const someRow = PERMS.some((p) => rowPerms[p]);

                      return (
                        <tr key={name}>
                          {/* Module name */}
                          <td className="text-start">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded bg-light d-flex align-items-center justify-content-center"
                                style={{ width: 32, height: 32, minWidth: 32 }}
                              >
                                <i className={`fa ${icon} text-secondary`}></i>
                              </div>
                              <strong>{name}</strong>
                            </div>
                          </td>

                          {/* Row ALL checkbox */}
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={allRow}
                              ref={(el) => {
                                if (el) el.indeterminate = someRow && !allRow;
                              }}
                              onChange={() => toggleRow(name)}
                            />
                          </td>

                          {/* Toggle switches */}
                          {PERMS.map((perm) => (
                            <td key={perm}>
                              <div className="d-flex justify-content-center">
                                <div className="form-check form-switch mb-0">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    role="switch"
                                    checked={rowPerms[perm] || false}
                                    onChange={() => toggle(name, perm)}
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                <i className="fa fa-times me-1"></i> Close
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                <i className="fa fa-save me-1"></i> Save Permissions
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionPopup;