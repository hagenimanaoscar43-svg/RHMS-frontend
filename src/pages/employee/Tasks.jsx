// frontend/src/pages/employee/Tasks.jsx
import React, { useState, useEffect } from "react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const loadTasks = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/employee/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to load tasks");
      
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`http://localhost:5001/api/employee/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading tasks...</div>;
  }

  return (
    <div>
      <h2>✅ My Tasks</h2>
      
      {tasks.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p>No tasks assigned yet</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} style={styles.taskCard}>
            <div style={styles.taskHeader}>
              <h3>{task.title}</h3>
              <span style={{ ...styles.priorityBadge, background: getPriorityColor(task.priority) }}>
                {task.priority || 'Medium'}
              </span>
            </div>
            <p style={styles.taskDescription}>{task.description}</p>
            <div style={styles.taskFooter}>
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              <select 
                value={task.status || 'pending'} 
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                style={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  emptyContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' },
  taskCard: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  priorityBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: 'white' },
  taskDescription: { color: '#6b7280', marginBottom: '16px' },
  taskFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' },
  statusSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white' }
};

export default Tasks;