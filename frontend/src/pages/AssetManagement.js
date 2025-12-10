import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import assetService from '../services/assetService';
import categoryService from '../services/categoryService';
import officeService from '../services/officeService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const AssetManagement = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    officeId: '',
    isAvailable: 'true',
  });

  const [assetForm, setAssetForm] = useState({
    name: '',
    code: '',
    categoryId: '',
    officeId: '',
    description: '',
    isAvailable: 'true',
    isActive: ''
    // isAvailable: '' // pastikan tidak membatasi status
    // isActive: 'true' // dihapus agar semua aset muncul
  });

  // fungsi untuk memuat data asset dengan filter dan pagination
  const loadAssets = useCallback(async () => {
    try {
      console.log('Memuat aset dengan filter:', filters);
      const response = await assetService.getAssets(filters);
      console.log('Aset dimuat:', response.assets?.length, 'aset');
      setAssets(response.assets);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat aset:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // fungsi untuk memuat kategori aktif
  const loadCategories = useCallback(async () => {
    try {
      const categories = await categoryService.getCategories({ isActive: 'true' });
      setCategories(categories);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kategori:', error);
    }
  }, []);

  // fungsi untuk memuat kantor aktif
  const loadOffices = useCallback(async () => {
    try {
      const offices = await officeService.getOffices({ isActive: 'true' });
      setOffices(offices);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kantor:', error);
    }
  }, []);

  // Set filter default untuk SECURITY_GUARD setelah user tersedia
  useEffect(() => {
    if (user?.role === 'SECURITY_GUARD') {
      setFilters(prev => ({ ...prev, isAvailable: 'true' }));
    }
  }, [user]);

  useEffect(() => {
    loadAssets();
    loadCategories();
    loadOffices();
  }, [loadAssets, loadCategories, loadOffices]);

  // fungsi untuk menampilkan modal tambah/edit asset
  const handleShowModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        name: asset.name,
        code: asset.code,
        categoryId: asset.categoryId.toString(),
        officeId: asset.officeId.toString(),
        description: asset.description || '',
        isAvailable: asset.isAvailable,
        isActive: asset.isActive
      });
    } else {
      setEditingAsset(null);
      setAssetForm({
        name: '',
        code: '',
        categoryId: '',
        officeId: '',
        description: '',
        isAvailable: true,
        isActive: true
      });
    }
    setShowModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    setAssetForm({
      name: '',
      code: '',
      categoryId: '',
      officeId: '',
      description: '',
      isAvailable: true,
      isActive: true
    });
  };

  // fungsi untuk menyimpan (tambah/edit) asset
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAsset) {
        const result = await assetService.updateAsset(editingAsset.id, assetForm);
        console.log('Asset diupdate:', result);
        toast.success('Asset berhasil diupdate!');
      } else {
        const result = await assetService.createAsset(assetForm);
        console.log('Asset dibuat:', result);
        toast.success('Asset berhasil dibuat!');
        // kembali ke halaman pertama setelah menambah asset baru
        setFilters(prev => ({ ...prev, page: 1 }));
      }
      handleCloseModal();
      // menyegarkan perintah dengan mengatur status pemuatan lalu memuat ulang
      setLoading(true);
      await loadAssets();
    } catch (error) {
      console.error('Terjadi kesalahan saat menyimpan asset:', error);
      toast.error('Gagal menyimpan asset. Silakan coba lagi.');
    }
  };

  // fungsi untuk menghapus asset
  const handleDelete = (asset) => {
    setDeletingAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await assetService.deleteAsset(deletingAsset.id);
      toast.success('Asset berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingAsset(null);
      loadAssets();
    } catch (error) {
      console.error('Terjadi kesalahan saat menghapus asset:', error);
      const errorMessage = error.response?.data?.error || 'Gagal menghapus asset';
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingAsset(null);
  };

  // fungsi untuk mendapatkan badge status asset
  const getStatusBadge = (asset) => {
    if (!asset.isActive) {
      return <Badge bg="secondary">Tidak Aktif</Badge>;
    }
    return asset.isAvailable 
      ? <Badge bg="success">Tersedia</Badge>
      : <Badge bg="warning">Sedang Dipinjam</Badge>;
  };

  // fungsi untuk mengubah filter dan mengatur halaman ke 1
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // fungsi untuk mengubah halaman
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
          <h2>Manajemen Asset</h2>
          <p className="text-muted mb-0">
            {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT')
              ? 'Kelola Aset kantor'
              : 'Lihat Aset'
            }
            {user?.office && ` - ${user.office.name}`}
          </p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') && (
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Tambah Asset
          </Button>
        )}
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Cari nama atau kode asset..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') && (
              <Col md={2}>
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
            )}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') && (
              <Col md={2}>
                <Form.Select
                  value={filters.isAvailable || ''}
                  onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                >
                  <option value="true">Tersedia</option>
                  <option value="false">Sedang Dipinjam</option>
                </Form.Select>
              </Col>
            )}
            <Col md={3} className="text-end">
              <small className="text-muted">
                Total: {pagination.total || 0} asset
              </small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {assets.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Kategori</th>
                    <th>Kantor</th>
                    <th>Status</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div>
                          <strong>{asset.name}</strong>
                          <br />
                          <small className="text-muted">{asset.code}</small>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={asset.category.type === 'VEHICLE' ? 'primary' : 'info'}
                        >
                          {asset.category.name}
                        </Badge>
                      </td>
                      <td>
                        <small>{asset.office.name}</small>
                      </td>
                      <td>
                        {getStatusBadge(asset)}
                      </td>
                      <td>
                        <small>{asset.description || '-'}</small>
                      </td>
                      <td>
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') && (
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(asset)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(asset)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-car"></i>
              <p>Belum ada data asset</p>
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

      {/* Asset Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAsset ? 'Edit Asset' : 'Tambah Asset Baru'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Asset *</Form.Label>
                  <Form.Control
                    type="text"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kode Asset *</Form.Label>
                  <Form.Control
                    type="text"
                    value={assetForm.code}
                    onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                    placeholder="Contoh: L 1234 AB atau SRV-A-001"
                    required
                  />
                  <Form.Text className="text-muted">
                    Untuk kendaraan gunakan plat nomor, untuk kunci gunakan kode unik
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori *</Form.Label>
                  <Form.Select
                    value={assetForm.categoryId}
                    onChange={(e) => setAssetForm({...assetForm, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.type === 'VEHICLE' ? 'Kendaraan' : 'Kunci Ruangan'})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kantor *</Form.Label>
                  <Form.Select
                    value={assetForm.officeId}
                    onChange={(e) => setAssetForm({...assetForm, officeId: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kantor</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={assetForm.description}
                    onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                    placeholder="Deskripsi asset..."
                  />
                </Form.Group>
              </Col>

              {editingAsset && (
                <Col md={12}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Asset Tersedia"
                          checked={assetForm.isAvailable}
                          onChange={(e) => setAssetForm({...assetForm, isAvailable: e.target.checked})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Asset Aktif"
                          checked={assetForm.isActive}
                          onChange={(e) => setAssetForm({...assetForm, isActive: e.target.checked})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
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
              {editingAsset ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus asset <strong>"{deletingAsset?.name}"</strong>?
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

export default AssetManagement;
