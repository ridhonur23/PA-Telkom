import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import officeService from '../services/officeService';
import LoadingSpinner from '../components/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    officeId: ''
  });

  const [userForm, setUserForm] = useState({
    nik: '',
    username: '',
    password: '',
    fullName: '',
    role: 'SECURITY_GUARD',
    officeId: '',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadOffices();
  }, [filters]);

  // fungsi untuk memuat data user
  const loadUsers = async () => {
    try {
      const response = await userService.getUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat user:', error);
    } finally {
      setLoading(false);
    }
  };

  // fungsi untuk memuat data kantor
  const loadOffices = async () => {
    try {
      const offices = await officeService.getOffices({ isActive: 'true' });
      setOffices(offices);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kantor:', error);
    }
  };

  // fungsi untuk menampilkan modal tambah/edit user
  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        nik: user.nik,
        username: user.username,
        password: '',
        fullName: user.fullName,
        role: user.role,
        officeId: user.officeId?.toString() || '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setUserForm({
        nik: '',
        username: '',
        password: '',
        fullName: '',
        role: 'SECURITY_GUARD',
        officeId: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // fungsi untuk menangani submit form tambah/edit user
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = { ...userForm };
      if (!submitData.password && editingUser) {
        delete submitData.password; // jangan update password jika kosong saat edit
      }
      if (!submitData.officeId) {
        submitData.officeId = null;
      }

      console.log('Submit data:', submitData);

      if (editingUser) {
        await userService.updateUser(editingUser.id, submitData);
        toast.success('User berhasil diupdate!');
      } else {
        await userService.createUser(submitData);
        toast.success('User berhasil dibuat!');
      }
      handleCloseModal();
      loadUsers();
    } catch (error) {
      console.error('Terjadi kesalahan saat menyimpan user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Gagal menyimpan user';
      toast.error(errorMessage);
    }
  };

  // fungsi untuk menghapus user
  const handleDelete = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(deletingUser.id);
      toast.success('User berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Terjadi kesalahan saat menghapus user:', error);
      const errorMessage = error.response?.data?.error || 'Gagal menghapus user';
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  // fungsi untuk menampilkan badge role
  const getRoleBadge = (role) => {
    switch(role) {
      case 'ADMIN':
        return <Badge bg="primary">Administrator</Badge>;
      case 'SECURITY_GUARD':
        return <Badge bg="success">Satpam</Badge>;
      case 'MANAGEMENT':
        return <Badge bg="info">Manajemen</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  // fungsi untuk menangani perubahan filter
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // fungsi untuk menangani perubahan halaman
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Manajemen User</h2>
          <p className="text-muted mb-0">Kelola user</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>
          Tambah User
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Cari nama, username, atau NIK..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="ADMIN">Administrator</option>
                <option value="SECURITY_GUARD">Satpam</option>
                <option value="MANAGEMENT">Manajemen</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.officeId}
                onChange={(e) => handleFilterChange('officeId', e.target.value)}
              >
                <option value="">Semua Kantor</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <small className="text-muted">
                Total: {pagination.total || 0} user
              </small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {users.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Kantor</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <strong>{user.fullName}</strong>
                          <br />
                          <small className="text-muted">
                            {user.username} • {user.nik}
                          </small>
                        </div>
                      </td>
                      <td>
                        {getRoleBadge(user.role)}
                      </td>
                      <td>
                        <small>{user.office?.name || '-'}</small>
                      </td>
                      <td>
                        <Badge bg={user.isActive ? 'success' : 'secondary'}>
                          {user.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <p>Belum ada data user</p>
            </div>
          )}
        </Card.Body>

        {pagination.totalPages > 1 && (
          <Card.Footer>
            <Pagination className="justify-content-center mb-0">
              <Pagination.Prev
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              />
              {[...Array(pagination.totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === pagination.page}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Tambah User Baru'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Lengkap *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NIK *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.nik}
                    onChange={(e) => setUserForm({...userForm, nik: e.target.value})}
                    maxLength={10}
                    required
                  />
                  <Form.Text className="text-muted">
                    Maksimal 10 digit
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Password {editingUser ? '(kosongkan jika tidak diubah)' : '*'}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    required
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="SECURITY_GUARD">Satpam</option>
                    <option value="MANAGEMENT">Manajemen</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kantor</Form.Label>
                  <Form.Select
                    value={userForm.officeId}
                    onChange={(e) => setUserForm({...userForm, officeId: e.target.value})}
                  >
                    <option value="">Tidak ada kantor khusus</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Wajib untuk satpam, opsional untuk admin
                  </Form.Text>
                </Form.Group>
              </Col>

              {editingUser && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="User Aktif"
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>
              {editingUser ? 'Update' : 'Simpan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3 mb-0">
              Apakah Anda yakin ingin menghapus user <strong>"{deletingUser?.fullName}"</strong>?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete} size="sm">
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} size="sm">
            <i className="fas fa-trash me-2"></i>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
