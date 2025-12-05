import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/LoadingSpinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    isActive: 'true'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'VEHICLE',
    description: '',
    isActive: true,
    allowedRoles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
  });

  useEffect(() => {
    loadCategories();
  }, [filters]);

  // fungsi untuk memuat kategori dari server
  const loadCategories = async () => {
    try {
      const categories = await categoryService.getCategories(filters);
      setCategories(categories);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kategori:', error);
    } finally {
      setLoading(false);
    }
  };

  // fungsi untuk menampilkan modal tambah/edit kategori
  const handleShowModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      const allowedRolesArray = category.allowedRoles 
        ? category.allowedRoles.split(',').map(r => r.trim())
        : ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT'];
      setCategoryForm({
        name: category.name,
        type: category.type,
        description: category.description || '',
        isActive: category.isActive,
        allowedRoles: allowedRolesArray
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        type: 'VEHICLE',
        description: '',
        isActive: 'true',
        allowedRoles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
      });
    }
    setShowModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // fungsi untuk menangani submit form tambah/edit kategori
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = {
        ...categoryForm,
        allowedRoles: Array.isArray(categoryForm.allowedRoles) 
          ? categoryForm.allowedRoles.join(',')
          : categoryForm.allowedRoles
      };
      
      console.log('Submit category data:', formData);
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        toast.success('Kategori berhasil diupdate!');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Kategori berhasil dibuat!');
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Terjadi kesalahan saat menyimpan kategori:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Gagal menyimpan kategori';
      toast.error(errorMessage);
    }
  };

  // fungsi untuk menghapus kategori
  const handleDelete = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      toast.success('Kategori berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Terjadi kesalahan saat menghapus kategori:', error);
      const errorMessage = error.response?.data?.error || 'Gagal menghapus kategori';
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCategory(null);
  };

  // fungsi untuk mendapatkan badge tipe kategori
  const getTypeBadge = (type) => {
    switch(type) {
      case 'VEHICLE':
        return <Badge bg="primary">Kendaraan</Badge>;
      case 'ROOM_KEY':
        return <Badge bg="info">Kunci Ruangan</Badge>;
      case 'DEVICE':
        return <Badge bg="success">Perangkat</Badge>;
      case 'OTHER':
        return <Badge bg="secondary">Lainnya</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  // fungsi untuk mengubah filter
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Manajemen Kategori</h2>
          <p className="text-muted mb-0">Kelola kategori Aset</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Cari nama kategori..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Semua Tipe</option>
                <option value="VEHICLE">Kendaraan</option>
                <option value="ROOM_KEY">Kunci</option>
                <option value="DEVICE">Perangkat</option>
                <option value="OTHER">Lainnya</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <small className="text-muted">
                Total: {categories.length} kategori
              </small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {categories.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th>Nama Kategori</th>
                    <th>Tipe</th>
                    <th>Deskripsi</th>
                    <th>Jumlah Asset</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.name}</strong>
                      </td>
                      <td>
                        {getTypeBadge(category.type)}
                      </td>
                      <td>
                        <small>{category.description || '-'}</small>
                      </td>
                      <td>
                        <Badge bg="secondary">{category._count?.assets || 0} asset</Badge>
                      </td>
                      <td>
                        <Badge bg={category.isActive ? 'success' : 'secondary'}>
                          {category.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(category)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            disabled={category._count?.assets > 0}
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
              <i className="fas fa-tags"></i>
              <p>Belum ada data kategori</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Category Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kategori *</Form.Label>
              <Form.Control
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="Contoh: Kendaraan Operasional"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipe *</Form.Label>
              <Form.Select
                value={categoryForm.type}
                onChange={(e) => setCategoryForm({...categoryForm, type: e.target.value})}
                required
              >
                <option value="VEHICLE">Kendaraan</option>
                <option value="ROOM_KEY">Kunci Ruangan</option>
                <option value="DEVICE">Perangkat</option>
                <option value="OTHER">Lainnya</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Pilih tipe yang sesuai dengan jenis asset
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Deskripsi kategori..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role yang Diizinkan Meminjam</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="checkbox"
                  label="Admin"
                  checked={categoryForm.allowedRoles.includes('ADMIN')}
                  onChange={(e) => {
                    const roles = [...categoryForm.allowedRoles];
                    if (e.target.checked) {
                      roles.push('ADMIN');
                    } else {
                      const index = roles.indexOf('ADMIN');
                      if (index > -1) roles.splice(index, 1);
                    }
                    setCategoryForm({...categoryForm, allowedRoles: roles});
                  }}
                />
                <Form.Check
                  inline
                  type="checkbox"
                  label="Security Guard"
                  checked={categoryForm.allowedRoles.includes('SECURITY_GUARD')}
                  onChange={(e) => {
                    const roles = [...categoryForm.allowedRoles];
                    if (e.target.checked) {
                      roles.push('SECURITY_GUARD');
                    } else {
                      const index = roles.indexOf('SECURITY_GUARD');
                      if (index > -1) roles.splice(index, 1);
                    }
                    setCategoryForm({...categoryForm, allowedRoles: roles});
                  }}
                />
                <Form.Check
                  inline
                  type="checkbox"
                  label="Management"
                  checked={categoryForm.allowedRoles.includes('MANAGEMENT')}
                  onChange={(e) => {
                    const roles = [...categoryForm.allowedRoles];
                    if (e.target.checked) {
                      roles.push('MANAGEMENT');
                    } else {
                      const index = roles.indexOf('MANAGEMENT');
                      if (index > -1) roles.splice(index, 1);
                    }
                    setCategoryForm({...categoryForm, allowedRoles: roles});
                  }}
                />
              </div>
              <Form.Text className="text-muted">
                Pilih role mana yang diizinkan meminjam asset dalam kategori ini
              </Form.Text>
            </Form.Group>

            {editingCategory && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Kategori Aktif"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({...categoryForm, isActive: e.target.checked})}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>
              {editingCategory ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus kategori <strong>"{deletingCategory?.name}"</strong>?
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

export default CategoryManagement;
