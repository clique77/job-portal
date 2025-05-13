import { useState, useEffect } from 'react';
import { User, UserRole, storage } from '../../../api/UserApi';
import './UsersManagement.scss';

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  bio: string;
  location: string;
  phoneNumber: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: UserRole.JOB_SEEKER,
    title: '',
    bio: '',
    location: '',
    phoneNumber: '',
  });
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      const normalizedUsers = data.map((user: any) => ({
        ...user,
        id: user._id || user.id
      }));
      
      setUsers(normalizedUsers);
    } catch (err) {
      setError('Error fetching users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    if (!user.id && !user._id) {
      setError('Cannot edit user without a valid ID');
      return;
    }
    
    const userId = (user.id || user._id) as string;
    
    const userToEdit: User = {
      ...user,
      id: userId
    };
    
    setSelectedUser(userToEdit);
    setFormData({
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title || '',
      bio: user.bio || '',
      location: user.location || '',
      phoneNumber: user.phoneNumber || '',
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: UserRole.JOB_SEEKER,
      title: '',
      bio: '',
      location: '',
      phoneNumber: '',
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = async (userId: string) => {
    if (!userId) {
      setError('Cannot delete user without a valid ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storage.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(user => (user.id || user._id) !== userId));
      setError(null);
    } catch (err) {
      setError('Error deleting user. Please try again.');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreating) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create user');
        }
        
        const newUser = await response.json();
        // Ensure id is set correctly
        const normalizedUser = {
          ...newUser,
          id: newUser._id || newUser.id
        };
        
        setUsers([...users, normalizedUser]);
      } else if (isEditing && selectedUser) {
        const userId = selectedUser.id;
        
        if (!userId) {
          throw new Error('Cannot update user without a valid ID');
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getToken()}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user');
        }
        
        const updatedUser = await response.json();
        // Ensure id is set correctly
        const normalizedUser = {
          ...updatedUser,
          id: updatedUser._id || updatedUser.id
        };
        
        setUsers(users.map(user => 
          (user.id || user._id) === (normalizedUser.id || normalizedUser._id) ? normalizedUser : user
        ));
      }
      
      setIsEditing(false);
      setIsCreating(false);
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      setError('Error saving user data. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="users-management">
      <div className="header">
        <h2>Users Management</h2>
        <button className="create-btn" onClick={handleCreate}>Create New User</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {(isEditing || isCreating) ? (
        <div className="user-form-container">
          <h3>{isCreating ? 'Create New User' : 'Edit User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role" 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                required
              >
                <option value={UserRole.JOB_SEEKER}>Job Seeker</option>
                <option value={UserRole.EMPLOYER}>Employer</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="users-table-container">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id || user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.title || '-'}</td>
                      <td>{user.location || '-'}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(user.id || user._id as string)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 