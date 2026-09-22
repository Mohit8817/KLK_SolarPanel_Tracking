import { useState, Fragment } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import ListToolbar from "../../Common/ListToolbar";
import Search, { useSearch } from "../../Common/Search";
import TableExportActions from "../../Common/TableExportActions";
import CommonPagination from "../../Common/Pagination";
import { DeleteAction } from "../../Common/ActionButtons";

// ── MOCK DATA ───────────────────────────────────────────────────────────
const MOCK_BOM_LIST = [
  {
    _id: "bom-1",
    bom_code: "BOM511250207120307",
    warehouse: "HO Warehouse",
    product_type: "PRODUCT",
    product_category: "STREET-LIGHT",
    product_name: "12W SOLAR STREET LIGHT",
    product_brand: "NA",
    product_unit: "Nos",
    variant: "No Variant",
    attachment: null,
    remarks: "Standard production recipe",
    created_by: "klk250207645183",
    date: "2026-09-07",
    materials: [
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "CAPSULE HOUSING (BANSAL JI)", variant: "No Variant", quantity: 1 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "CONTROLLER 12 WATT (PUNE) CAPSULE LIGHT DRIVER ( JUST GROW )", variant: "No Variant", quantity: 1 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "MCPCB(3LED)", variant: "No Variant", quantity: 1 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "MCPCB SINGLE LENS", variant: "No Variant", quantity: 3 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "SCREWS 3x6 UNI THREAD", variant: "No Variant", quantity: 2 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "SCREWS 4x6.5 SELF THREAD", variant: "No Variant", quantity: 4 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "4CORE CABLE 1.5 SQMM", variant: "No Variant", quantity: 1 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "COMPOUND", variant: "No Variant", quantity: 0.001 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "SILICONE TRANSPARENT ( MCCOY ) SOUDAL", variant: "No Variant", quantity: 0.016 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "SINGLE CORE WIRE (RED) (1.5MM)", variant: "No Variant", quantity: 0.175 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "TEFLON WIRE 1.5MM BLACK (15/19/28) SPC [E]", variant: "No Variant", quantity: 0.175 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "PACKING TAPE KLK", variant: "No Variant", quantity: 0.0067 },
    ],
  },
  {
    _id: "bom-2",
    bom_code: "BOM511250208130422",
    warehouse: "HO Warehouse",
    product_type: "PRODUCT",
    product_category: "BATTERY",
    product_name: "12.8V 30Ah Battery Pack",
    product_brand: "NA",
    product_unit: "Nos",
    variant: "No Variant",
    attachment: { name: "battery_bom_spec.pdf" },
    remarks: "Standard LiFePO4 pack recipe",
    created_by: "klk250208223190",
    date: "2026-09-08",
    materials: [
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "LiFePO4 Cell 3.2V 30Ah", variant: "Grade A", quantity: 4 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "BMS Module 12V 30A", variant: "No Variant", quantity: 1 },
      { warehouse: "HO Warehouse", product_type: "ITEMS", product_name: "Nickel Strip 0.3mm", variant: "No Variant", quantity: 0.5 },
    ],
  },
];

const ViewMaterialRequests = () => {
  const [bomList] = useState(MOCK_BOM_LIST);
  
  // Kis BOM ke materials open hain uska ID store karne ke liye (Simple state)
  const [expandedId, setExpandedId] = useState("bom-1");

  const toggleMaterials = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ── SEARCH ─────────────────────────────────────────────────────────────
  const SEARCH_KEYS = [
    "bom_code",
    "warehouse",
    "product_type",
    "product_category",
    "product_name",
    "product_brand",
    "product_unit",
    "variant",
    "remarks",
    "created_by",
  ];

  const {
    currentData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
  } = useSearch(bomList, SEARCH_KEYS, 50);

  // ── EXPORT ─────────────────────────────────────────────────────────────
  const exportData = bomList.flatMap((bom, bIndex) =>
    bom.materials.map((mat) => ({
      sno: bIndex + 1,
      bomCode: bom.bom_code,
      warehouse: bom.warehouse,
      productType: bom.product_type,
      productCategory: bom.product_category,
      productName: bom.product_name,
      productBrand: bom.product_brand,
      productUnit: bom.product_unit,
      variant: bom.variant,
      document: bom.attachment ? bom.attachment.name : "No Document available",
      remarks: bom.remarks || "-",
      matWarehouse: mat.warehouse,
      matProductType: mat.product_type,
      matProductName: mat.product_name,
      matVariant: mat.variant,
      matQuantity: mat.quantity,
      createdBy: bom.created_by,
    }))
  );

  const exportColumns = [
    { label: "S No", key: "sno" },
    { label: "BOM Code", key: "bomCode" },
    { label: "Warehouse", key: "warehouse" },
    { label: "Product Type", key: "productType" },
    { label: "Product Category", key: "productCategory" },
    { label: "Product Name", key: "productName" },
    { label: "Product Brand", key: "productBrand" },
    { label: "Product Unit", key: "productUnit" },
    { label: "Product Variant", key: "variant" },
    { label: "Document", key: "document" },
    { label: "Remarks", key: "remarks" },
    { label: "Material Warehouse", key: "matWarehouse" },
    { label: "Material Product Type", key: "matProductType" },
    { label: "Material Product Name", key: "matProductName" },
    { label: "Material Variant", key: "matVariant" },
    { label: "Material Quantity", key: "matQuantity" },
    { label: "Created By", key: "createdBy" },
  ];

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this BOM?")) return;
    console.log("delete", id);
  };

  return (
    <div className="view-material-requests">
      <PageHeader
        title="Bill of Materials (BOM) List"
        subtitle="View product master details and materials required for each BOM"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "BOM & Materials" },
          { label: "BOM List" },
        ]}
        action={
          <Link to="/light/bom/request" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus me-1"></i> New BOM
          </Link>
        }
      />

      <Card className="klk-list-card">
        <Card.Header>
          <ListToolbar>
            {/* RIGHT SIDE - SEARCH + EXPORT ACTIONS */}
            <div className="d-flex align-items-center gap-3 ms-auto flex-nowrap">
              <div style={{ width: "260px", minWidth: "220px" }}>
                <Search
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search BOM code, product, category..."
                />
              </div>

              <div
                className="d-flex align-items-center flex-nowrap flex-shrink-0"
                style={{ minWidth: "145px", whiteSpace: "nowrap" }}
              >
                <TableExportActions
                  data={exportData}
                  columns={exportColumns}
                  fileName="BOM_Materials_Report"
                />
              </div>
            </div>
          </ListToolbar>
        </Card.Header>

        <Card.Body>
          <Table responsive className="table-hover align-middle" style={{ minWidth: "1100px" }}>
            <thead>
              <tr>
                <th style={{ width: "65px" }}>S no.</th>
                <th style={{ minWidth: "180px" }}>BOM Code</th>
                <th style={{ minWidth: "200px" }}>Product Name</th>
                <th style={{ width: "130px" }}>Category</th>
                <th style={{ width: "150px" }}>Warehouse</th>
                <th style={{ width: "140px" }}>Materials</th>
                <th style={{ width: "150px" }}>Document</th>
                <th style={{ width: "140px" }}>Created By</th>
                <th className="text-center" style={{ width: "100px", minWidth: "100px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length > 0 ? (
                currentData.map((bom, bIndex) => {
                  const isOpen = expandedId === bom._id;

                  return (
                    <Fragment key={bom._id}>
                      {/* ── Main BOM Row ── */}
                      <tr className={isOpen ? "table-light" : ""}>
                        <td><strong>{startIndex + bIndex + 1}</strong></td>

                        <td className="font-monospace fw-bold text-primary">
                          {bom.bom_code}
                        </td>

                        <td>
                          <strong className="text-dark d-block">{bom.product_name}</strong>
                          <small className="text-muted">Unit: {bom.product_unit} | {bom.variant}</small>
                        </td>

                        <td>
                          <Badge
                            bg={bom.product_category === "BATTERY" ? "info" : "primary"}
                            className="py-2 px-2 fs-12"
                          >
                            {bom.product_category === "BATTERY" ? "Battery Pack" : "Street Light"}
                          </Badge>
                        </td>

                        <td>{bom.warehouse}</td>

                        {/* Click to Toggle Materials */}
                        <td>
                          <Button
                            variant={isOpen ? "primary" : "outline-secondary"}
                            size="sm"
                            className="py-1 px-2 fs-12 rounded-2"
                            onClick={() => toggleMaterials(bom._id)}
                          >
                            <i className="fa-solid fa-boxes-stacked me-1"></i>
                            {bom.materials.length} Items
                            <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} ms-2 fs-10`}></i>
                          </Button>
                        </td>

                        <td>
                          {bom.attachment ? (
                            <a href="#" className="text-primary text-decoration-none fs-12">
                              <i className="fa-solid fa-paperclip me-1"></i>
                              {bom.attachment.name}
                            </a>
                          ) : (
                            <span className="text-muted fs-12 fst-italic">No File</span>
                          )}
                        </td>

                        <td className="font-monospace text-muted fs-12">{bom.created_by}</td>

                        <td className="text-center">
                          <div className="klk-actions d-flex justify-content-center align-items-center flex-nowrap">
                            <DeleteAction onClick={() => handleDelete(bom._id)} />
                          </div>
                        </td>
                      </tr>

                        {/* ── Dropdown Sub-Table: Show Materials when clicked ── */}
                        {isOpen && (
                          <tr key={`${bom._id}-materials`}>
                            <td colSpan="9" className="p-3  border-bottom">
                              <div className="p-3 bg-white rounded border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong className="text-dark fs-13">
                                    <i className="fa-solid fa-list-check text-primary me-2"></i>
                                    Raw Materials List for: <span className="text-primary">{bom.product_name}</span>
                                  </strong>
                                  {bom.remarks && (
                                    <small className="text-muted fst-italic">Note: {bom.remarks}</small>
                                  )}
                                </div>

                                <Table size="sm" bordered hover className="mb-0 align-middle">
                                  <thead className="table-secondary fs-11 text-uppercase text-muted">
                                    <tr>
                                      <th style={{ width: 40 }} className="text-center">#</th>
                                      <th>Material Name</th>
                                      <th>Type</th>
                                      <th>Warehouse</th>
                                      <th>Variant</th>
                                      <th className="text-end" style={{ width: 120 }}>Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody className="fs-12">
                                    {bom.materials.map((mat, mIdx) => (
                                      <tr key={mIdx}>
                                        <td className="text-center text-muted">{mIdx + 1}</td>
                                        <td className="fw-semibold text-dark">{mat.product_name}</td>
                                        <td><Badge bg="light" className="text-dark border">{mat.product_type}</Badge></td>
                                        <td className="text-muted">{mat.warehouse}</td>
                                        <td>{mat.variant}</td>
                                        <td className="text-end fw-bold text-success font-monospace">
                                          {mat.quantity}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      {searchQuery ? `No results for "${searchQuery}"` : "No BOM records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Card.Body>
      </Card>
    </div>
  );
};

export default ViewMaterialRequests;