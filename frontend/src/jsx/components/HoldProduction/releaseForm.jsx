const ReleaseForm = () => {
  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Start</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Start No"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Lot Size</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Lot Size"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Release Date</label>
        <input
          type="date"
          className="form-control"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Count</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Count"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Project Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Project Name"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Project State</label>
        <input
          type="text"
          className="form-control"
          placeholder="Project State"
        />
      </div>

      <div className="col-md-12 mb-3">
        <label className="form-label">Remarks</label>
        <textarea
          rows="3"
          className="form-control"
          placeholder="Enter Remarks"
        />
      </div>

      <div className="col-md-12 text-end">
        <button className="btn btn-primary">
          Save Release
        </button>
      </div>
    </div>
  );
};

export default ReleaseForm;