/**
 * @param {{ rows: object[] }} props
 */
const DashboardCapacityTable = ({ rows = [] }) => {
  if (!rows.length) {
    return <div className="klk-dash-empty">No capacity data available yet.</div>;
  }

  const totals = rows.reduce(
    (acc, item) => ({
      total: acc.total + (item.total || 0),
      produced: acc.produced + (item.totalProduced || 0),
      dispatched: acc.dispatched + (item.totalDispatched || 0),
      collected: acc.collected + (item.dispatchedAndCollected || 0),
      inTransit: acc.inTransit + (item.dispatchedNotCollected || 0),
      damage: acc.damage + (item.totalDamage || 0),
    }),
    { total: 0, produced: 0, dispatched: 0, collected: 0, inTransit: 0, damage: 0 }
  );

  const pct = (val, max) => (max ? Math.round((val / max) * 100) : 0);

  return (
    <div className="klk-cap-table-wrap">
      <table className="klk-cap-table">
        <thead>
          <tr>
            <th className="klk-cap-table__th-cap">Capacity</th>
            <th>Total</th>
            <th>Produced</th>
            <th>Dispatched</th>
            <th>Collected</th>
            <th>In transit</th>
            <th>Damage</th>
            <th className="klk-cap-table__th-progress">Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const total = item.total || 0;
            const produced = item.totalProduced || 0;
            const dispatched = item.totalDispatched || 0;
            const collected = item.dispatchedAndCollected || 0;
            const inTransit = item.dispatchedNotCollected || 0;
            const damage = item.totalDamage || 0;
            const progress = pct(produced, total);

            return (
              <tr key={item._id}>
                <td>
                  <span className="klk-cap-badge">
                    <i className="fa-solid fa-bolt" aria-hidden="true" />
                    {item._id} W
                  </span>
                </td>
                <td className="klk-cap-table__num">{total.toLocaleString()}</td>
                <td className="klk-cap-table__num klk-cap-table__num--teal">{produced.toLocaleString()}</td>
                <td className="klk-cap-table__num">{dispatched.toLocaleString()}</td>
                <td className="klk-cap-table__num klk-cap-table__num--success">{collected.toLocaleString()}</td>
                <td>
                  {inTransit > 0 ? (
                    <span className="klk-cap-pill klk-cap-pill--transit">{inTransit.toLocaleString()}</span>
                  ) : (
                    <span className="klk-cap-pill klk-cap-pill--muted">0</span>
                  )}
                </td>
                <td>
                  {damage > 0 ? (
                    <span className="klk-cap-pill klk-cap-pill--danger">{damage.toLocaleString()}</span>
                  ) : (
                    <span className="klk-cap-pill klk-cap-pill--muted">0</span>
                  )}
                </td>
                <td>
                  <div className="klk-cap-progress">
                    <div className="klk-cap-progress__bar">
                      <div
                        className="klk-cap-progress__fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="klk-cap-progress__label">{progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>All capacities</strong></td>
            <td className="klk-cap-table__num"><strong>{totals.total.toLocaleString()}</strong></td>
            <td className="klk-cap-table__num klk-cap-table__num--teal"><strong>{totals.produced.toLocaleString()}</strong></td>
            <td className="klk-cap-table__num"><strong>{totals.dispatched.toLocaleString()}</strong></td>
            <td className="klk-cap-table__num klk-cap-table__num--success"><strong>{totals.collected.toLocaleString()}</strong></td>
            <td>
              <span className={`klk-cap-pill${totals.inTransit > 0 ? " klk-cap-pill--transit" : " klk-cap-pill--muted"}`}>
                {totals.inTransit.toLocaleString()}
              </span>
            </td>
            <td>
              <span className={`klk-cap-pill${totals.damage > 0 ? " klk-cap-pill--danger" : " klk-cap-pill--muted"}`}>
                {totals.damage.toLocaleString()}
              </span>
            </td>
            <td>
              <div className="klk-cap-progress">
                <div className="klk-cap-progress__bar">
                  <div
                    className="klk-cap-progress__fill"
                    style={{ width: `${pct(totals.produced, totals.total)}%` }}
                  />
                </div>
                <span className="klk-cap-progress__label">{pct(totals.produced, totals.total)}%</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DashboardCapacityTable;
