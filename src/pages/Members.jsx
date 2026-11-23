import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
export default function Members() {
  const [params] = useSearchParams();
  const group = params.get("group") || "Member List";
  const [rows, setRows] = useState([{ unit: "", position: "", name: "" }]);
  const [status, setStatus] = useState("Changes saved locally");
  const update = (i, key, value) =>
    setRows((r) =>
      r.map((row, n) => (n === i ? { ...row, [key]: value } : row)),
    );
  return (
    <div className="members-page">
      <header className="members-header">
        <Link to="/officials" className="back-button">
          ← Back to Officials
        </Link>
        <h1>{group}</h1>
        <p>Municipality of Mabini, Pangasinan</p>
      </header>
      <main className="members-container">
        <div className="department-header">
          <h2>{group}</h2>
        </div>
        <div className="member-toolbar">
          <h3>Member Records</h3>
          <div className="toolbar-buttons">
            <button
              onClick={() =>
                setRows((r) => [...r, { unit: "", position: "", name: "" }])
              }
            >
              + Add Row
            </button>
            <button
              onClick={() => {
                localStorage.setItem(`members-${group}`, JSON.stringify(rows));
                setStatus("Saved locally in this browser");
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Organizational Unit</th>
                <th>Position Title</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={r.unit}
                      onChange={(e) => update(i, "unit", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={r.position}
                      onChange={(e) => update(i, "position", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={r.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="save-status">{status}</p>
      </main>
    </div>
  );
}
