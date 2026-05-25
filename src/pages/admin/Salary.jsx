// frontend/src/pages/admin/Salary.jsx - Complete working version with correct API URL
import React, { useState, useEffect } from "react";
import { 
  FiDollarSign, FiPercent, FiUsers, FiCheckCircle, 
  FiClock, FiAlertCircle, FiEdit2, FiEye, FiCalendar,
  FiPlus, FiMinus, FiSave, FiX, FiRefreshCw
} from "react-icons/fi";

// ✅ CORRECTED: Single source of truth for API URL
const API_BASE_URL = 'https://rhms-backend.onrender.com/api';

const Salary = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showFullSalaryModal, setShowFullSalaryModal] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [salaryDetails, setSalaryDetails] = useState({
    base_salary: 0,
    bonus: 0,
    overtime: 0,
    commission: 0,
    allowances: 0,
    deductions: 0
  });
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    if (token) {
      fetchStaffAndSalary();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token, month, year]);

  const fetchStaffAndSalary = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed double http://
      const staffResponse = await fetch(`${API_BASE_URL}/hotel/staff`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (staffResponse.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      const staffData = await staffResponse.json();
      
      if (staffResponse.ok) {
        const staffWithHistory = await Promise.all(
          staffData.map(async (staffMember) => {
            try {
              // ✅ FIXED: Removed double http://
              const historyResponse = await fetch(`${API_BASE_URL}/hotel/salary/${staffMember.staff_id}/history`, {
                headers: { "Authorization": `Bearer ${token}` }
              });
              
              if (historyResponse.ok) {
                const history = await historyResponse.json();
                return { ...staffMember, history: history || [] };
              }
              return { ...staffMember, history: [] };
            } catch (err) {
              console.error("Error fetching history:", err);
              return { ...staffMember, history: [] };
            }
          })
        );
        
        setStaff(staffWithHistory);
      } else {
        setError(staffData.error || "Failed to fetch staff");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (staffId, status) => {
    setUpdating(true);
    try {
      const monthNum = months.indexOf(month) + 1;
      
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/salary/${staffId}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          month: monthNum, 
          year: year, 
          status: status 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message || `Salary marked as ${status}`}`);
        setShowPaymentModal(false);
        setSelectedStaff(null);
        fetchStaffAndSalary();
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const updateBonus = async (staffId) => {
    if (!bonusAmount || bonusAmount <= 0) {
      alert("Please enter a valid bonus amount");
      return;
    }
    
    setUpdating(true);
    try {
      const monthNum = months.indexOf(month) + 1;
      
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/salary/${staffId}/bonus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          month: monthNum, 
          year: year, 
          bonus: bonusAmount 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Bonus updated to ${bonusAmount.toLocaleString()} RWF`);
        setShowBonusModal(false);
        setSelectedStaff(null);
        setBonusAmount(0);
        fetchStaffAndSalary();
      } else {
        alert(data.error || "Failed to update bonus");
      }
    } catch (error) {
      console.error("Error updating bonus:", error);
      alert("Failed to update bonus");
    } finally {
      setUpdating(false);
    }
  };

  const updateFullSalary = async (staffId) => {
    const { base_salary, bonus, overtime, commission, allowances, deductions } = salaryDetails;
    const netPay = base_salary + bonus + overtime + commission + allowances - deductions;
    
    setUpdating(true);
    try {
      const monthNum = months.indexOf(month) + 1;
      
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/salary/${staffId}/full`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          month: monthNum, 
          year: year,
          base_salary,
          bonus,
          overtime,
          commission,
          allowances,
          deductions,
          net_pay: netPay
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Salary details updated successfully! Net Pay: ${netPay.toLocaleString()} RWF`);
        setShowFullSalaryModal(false);
        setSelectedStaff(null);
        fetchStaffAndSalary();
      } else {
        alert(data.error || "Failed to update salary details");
      }
    } catch (error) {
      console.error("Error updating salary details:", error);
      alert("Failed to update salary details");
    } finally {
      setUpdating(false);
    }
  };

  const openFullSalaryModal = (emp) => {
    const monthNum = months.indexOf(month) + 1;
    const record = emp.history?.find(h => h.month === monthNum && h.year === year);
    
    setSalaryDetails({
      base_salary: record?.base_salary || emp.salary || 0,
      bonus: record?.bonus || 0,
      overtime: record?.overtime || 0,
      commission: record?.commission || 0,
      allowances: record?.allowances || 0,
      deductions: record?.deductions_tax + record?.deductions_insurance + record?.deductions_other || 0
    });
    setSelectedStaff(emp);
    setShowFullSalaryModal(true);
  };

  const getEmployeeSalary = (staffMember) => {
    const currentMonthIndex = months.indexOf(month);
    const monthNum = currentMonthIndex + 1;
    
    const record = staffMember.history?.find(
      h => h.month === monthNum && h.year === year
    );
    
    if (record) {
      const netPay = (record.base_salary || 0) + (record.bonus || 0) + (record.overtime || 0) + 
                     (record.commission || 0) + (record.allowances || 0) - (record.deductions || 0);
      return {
        perDay: Math.round(((record.base_salary || staffMember.salary || 0) / 22)),
        workingDays: 22,
        base: record.base_salary || staffMember.salary || 0,
        bonus: record.bonus || 0,
        overtime: record.overtime || 0,
        commission: record.commission || 0,
        allowances: record.allowances || 0,
        deductions: record.deductions || 0,
        net: netPay,
        status: record.status || "Pending",
        done: record.status === "Paid",
        doneDate: record.payment_date
      };
    }
    
    return {
      perDay: Math.round((staffMember.salary || 0) / 22),
      workingDays: 22,
      base: staffMember.salary || 0,
      bonus: 0,
      overtime: 0,
      commission: 0,
      allowances: 0,
      deductions: 0,
      net: staffMember.salary || 0,
      status: "Pending",
      done: false,
      doneDate: null
    };
  };

  const formatNumber = (n) => n?.toLocaleString() || "0";
  
  const filteredStaff = staff.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  let totalBase = 0, totalBonus = 0, totalNet = 0, paid = 0, pending = 0;

  staff.forEach(s => {
    const salary = getEmployeeSalary(s);
    totalBase += salary.base;
    totalBonus += salary.bonus;
    totalNet += salary.net;
    if (salary.status === "Paid") paid++;
    if (salary.status === "Pending") pending++;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading salary data...</p>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>❌ {error}</p>
        <button onClick={fetchStaffAndSalary} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>💰 Salary Hub</div>
          <div style={styles.sub}>Payroll management for {staff.length} employees</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select value={month} onChange={e => setMonth(e.target.value)} style={styles.select}>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={styles.select}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={fetchStaffAndSalary} style={styles.refreshBtn} title="Refresh">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{formatNumber(totalNet)} RWF</div>
            <div style={styles.statLabel}>Total Net Payroll</div>
          </div>
          <span style={styles.statIcon}>💰</span>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{formatNumber(totalBase)} RWF</div>
            <div style={styles.statLabel}>Base Salaries</div>
          </div>
          <span style={styles.statIcon}>📊</span>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{formatNumber(totalBonus)} RWF</div>
            <div style={styles.statLabel}>Total Bonuses</div>
          </div>
          <span style={styles.statIcon}>🎁</span>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{paid} / {staff.length}</div>
            <div style={styles.statLabel}>Paid</div>
          </div>
          <span style={styles.statIcon}>✓</span>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{pending} / {staff.length}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <span style={styles.statIcon}>⏳</span>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input 
          placeholder="🔍 Search employee, role or department..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={styles.searchInput} 
        />
      </div>

      {/* Salary Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>Employee</th>
              <th>Role</th>
              <th>Department</th>
              <th>Per Day</th>
              <th>Bonus</th>
              <th>Total Monthly</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.emptyRow}>No employees found</td>
              </tr>
            ) : (
              filteredStaff.map(emp => {
                const salary = getEmployeeSalary(emp);
                return (
                  <tr key={emp.staff_id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.employeeCell}>
                        <div style={styles.avatar}>{emp.full_name?.charAt(0)}</div>
                        <strong>{emp.full_name}</strong>
                      </div>
                     </td>
                    <td style={styles.td}>{emp.role}</td>
                    <td style={styles.td}>{emp.department}</td>
                    <td style={styles.td}><strong>{formatNumber(salary.perDay)}</strong></td>
                    <td style={styles.td}>
                      <div style={styles.bonusCell}>
                        <span style={styles.bonusAmount}>{formatNumber(salary.bonus)}</span>
                        <button 
                          onClick={() => { 
                            setSelectedStaff(emp); 
                            setBonusAmount(salary.bonus);
                            setShowBonusModal(true); 
                          }} 
                          style={styles.editBtn}
                          disabled={updating}
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                      </div>
                     </td>
                    <td style={styles.td}><strong style={styles.totalAmount}>{formatNumber(salary.net)}</strong></td>
                    <td style={styles.td}>
                      <span className={`status-badge ${salary.status === "Paid" ? "status-paid" : salary.status === "Processing" ? "status-processing" : "status-pending"}`}>
                        {salary.status === "Paid" && <FiCheckCircle size={12} />}
                        {salary.status === "Processing" && <FiClock size={12} />}
                        {salary.status === "Pending" && <FiAlertCircle size={12} />}
                        {salary.status}
                      </span>
                     </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          onClick={() => openFullSalaryModal(emp)} 
                          style={styles.detailsBtn}
                          disabled={updating}
                          title="Edit Full Salary Details"
                        >
                          <FiDollarSign size={12} /> Details
                        </button>
                        <button 
                          onClick={() => { setSelectedStaff(emp); setShowPaymentModal(true); }} 
                          style={styles.payBtn}
                          disabled={salary.status === "Paid" || updating}
                        >
                          💳 Pay
                        </button>
                        <button 
                          onClick={() => { setHistoryEmployee(emp); setShowHistoryModal(true); }} 
                          style={styles.historyBtn}
                          disabled={updating}
                        >
                          <FiEye size={12} /> History
                        </button>
                      </div>
                     </td>
                   </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Process Payment - {selectedStaff.full_name}</h3>
              <button onClick={() => setShowPaymentModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <p><strong>Month:</strong> {month} {year}</p>
              <p><strong>Base Salary:</strong> {formatNumber(getEmployeeSalary(selectedStaff).base)} RWF</p>
              <p><strong>Bonus:</strong> {formatNumber(getEmployeeSalary(selectedStaff).bonus)} RWF</p>
              <p><strong>Net Pay:</strong> {formatNumber(getEmployeeSalary(selectedStaff).net)} RWF</p>
              <p style={{ marginTop: 16 }}>Confirm payment for this employee?</p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowPaymentModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => updatePaymentStatus(selectedStaff.staff_id, "Paid")} style={styles.confirmBtn} disabled={updating}>
                {updating ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Modal */}
      {showBonusModal && selectedStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowBonusModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Edit Bonus - {selectedStaff.full_name}</h3>
              <button onClick={() => setShowBonusModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <label>Bonus Amount (RWF)</label>
              <input 
                type="number" 
                value={bonusAmount} 
                onChange={(e) => setBonusAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
                placeholder="Enter bonus amount"
              />
              <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                Base Salary: {formatNumber(selectedStaff.salary)} RWF
              </p>
              <p style={{ fontSize: 12, color: "#10b981" }}>
                New Total: {formatNumber((selectedStaff.salary || 0) + bonusAmount)} RWF
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowBonusModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => updateBonus(selectedStaff.staff_id)} style={styles.saveBtn} disabled={updating}>
                {updating ? "Saving..." : "Save Bonus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Salary Details Modal */}
      {showFullSalaryModal && selectedStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowFullSalaryModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Salary Details - {selectedStaff.full_name}</h3>
              <button onClick={() => setShowFullSalaryModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailsGrid}>
                <div style={styles.detailsField}>
                  <label>Base Salary</label>
                  <input 
                    type="number" 
                    value={salaryDetails.base_salary} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, base_salary: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.detailsField}>
                  <label>Bonus</label>
                  <input 
                    type="number" 
                    value={salaryDetails.bonus} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, bonus: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.detailsField}>
                  <label>Overtime</label>
                  <input 
                    type="number" 
                    value={salaryDetails.overtime} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, overtime: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.detailsField}>
                  <label>Commission</label>
                  <input 
                    type="number" 
                    value={salaryDetails.commission} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, commission: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.detailsField}>
                  <label>Allowances</label>
                  <input 
                    type="number" 
                    value={salaryDetails.allowances} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, allowances: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.detailsField}>
                  <label>Deductions</label>
                  <input 
                    type="number" 
                    value={salaryDetails.deductions} 
                    onChange={(e) => setSalaryDetails({...salaryDetails, deductions: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.netPaySummary}>
                <strong>Net Pay Calculation:</strong>
                <div>Base: {formatNumber(salaryDetails.base_salary)} RWF</div>
                <div>+ Bonus: {formatNumber(salaryDetails.bonus)} RWF</div>
                <div>+ Overtime: {formatNumber(salaryDetails.overtime)} RWF</div>
                <div>+ Commission: {formatNumber(salaryDetails.commission)} RWF</div>
                <div>+ Allowances: {formatNumber(salaryDetails.allowances)} RWF</div>
                <div>- Deductions: {formatNumber(salaryDetails.deductions)} RWF</div>
                <div style={styles.netTotal}>Total Net Pay: {formatNumber(salaryDetails.base_salary + salaryDetails.bonus + salaryDetails.overtime + salaryDetails.commission + salaryDetails.allowances - salaryDetails.deductions)} RWF</div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowFullSalaryModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => updateFullSalary(selectedStaff.staff_id)} style={styles.saveBtn} disabled={updating}>
                {updating ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyEmployee && (
        <div style={styles.modalOverlay} onClick={() => setShowHistoryModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Salary History - {historyEmployee.full_name}</h3>
              <button onClick={() => setShowHistoryModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              {historyEmployee.history?.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280" }}>No salary history found</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Month</th><th>Year</th><th>Base Salary</th><th>Bonus</th><th>Overtime</th><th>Commission</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th>
                       </tr>
                    </thead>
                    <tbody>
                      {(historyEmployee.history || []).map((record, idx) => {
                        const net = (record.base_salary || 0) + (record.bonus || 0) + (record.overtime || 0) + 
                                   (record.commission || 0) + (record.allowances || 0) - (record.deductions || 0);
                        return (
                          <tr key={idx}>
                            <td>{record.month}</td>
                            <td>{record.year}</td>
                            <td>{formatNumber(record.base_salary)} RWF</td>
                            <td>{formatNumber(record.bonus)} RWF</td>
                            <td>{formatNumber(record.overtime)} RWF</td>
                            <td>{formatNumber(record.commission)} RWF</td>
                            <td>{formatNumber(record.allowances)} RWF</td>
                            <td>{formatNumber(record.deductions)} RWF</td>
                            <td><strong>{formatNumber(net)} RWF</strong></td>
                            <td>
                              <span className={`status-badge ${record.status === "Paid" ? "status-paid" : "status-pending"}`}>
                                {record.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowHistoryModal(false)} style={styles.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .status-paid {
          background: #d1fae5;
          color: #065f46;
        }
        .status-processing {
          background: #fef3c7;
          color: #92400e;
        }
        .status-pending {
          background: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: { padding: "24px", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 15 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827" },
  sub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  select: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "white", cursor: "pointer" },
  refreshBtn: { padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: 700, color: "#2563eb" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statIcon: { fontSize: 24 },
  searchContainer: { marginBottom: 20 },
  searchInput: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, background: "white", width: 320 },
  tableWrap: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  tableHeader: { background: "#f9fafb", borderBottom: "2px solid #e5e7eb" },
  tableRow: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "14px 16px", fontSize: 13, verticalAlign: "middle" },
  emptyRow: { textAlign: "center", padding: "40px", color: "#9ca3af" },
  employeeCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1e40af" },
  bonusCell: { display: "flex", alignItems: "center", gap: 8 },
  bonusAmount: { color: "#10b981", fontWeight: 600 },
  totalAmount: { color: "#2563eb", fontSize: 16 },
  actionButtons: { display: "flex", gap: 6 },
  editBtn: { fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "none", background: "#f59e0b", color: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 },
  detailsBtn: { fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "none", background: "#8b5cf6", color: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 },
  payBtn: { fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "white", cursor: "pointer" },
  historyBtn: { fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "0.5px solid #d1d5db", background: "#f9fafb", color: "#374151", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 },
  loadingContainer: { textAlign: "center", padding: "60px" },
  errorContainer: { textAlign: "center", padding: "60px", color: "#dc2626" },
  retryBtn: { marginTop: 16, padding: "8px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: 16, width: "90%", maxWidth: "450px", maxHeight: "90vh", overflow: "auto" },
  modalLarge: { background: "white", borderRadius: 16, width: "90%", maxWidth: "650px", maxHeight: "90vh", overflow: "auto" },
  modalHeader: { padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalBody: { padding: "20px" },
  modalFooter: { padding: "20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 12 },
  input: { width: "100%", padding: "10px", border: "1px solid #e5e7eb", borderRadius: 8, marginTop: 4, fontSize: 14 },
  closeBtn: { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" },
  cancelBtn: { padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer" },
  confirmBtn: { padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  saveBtn: { padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  historyTable: { width: "100%", borderCollapse: "collapse" },
  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 },
  detailsField: { display: "flex", flexDirection: "column", gap: 4 },
  netPaySummary: { background: "#f3f4f6", padding: 16, borderRadius: 8, marginTop: 16 },
  netTotal: { fontSize: 16, fontWeight: 700, color: "#2563eb", marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e7eb" }
};

export default Salary;