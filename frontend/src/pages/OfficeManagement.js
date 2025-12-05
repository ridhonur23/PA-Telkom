import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import officeService from '../services/officeService';
import LoadingSpinner from '../components/LoadingSpinner';

const OfficeManagement = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOffice, setDeletingOffice] = useState(null);
  const [editingOffice, setEditingOffice] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'true'
  });

  const [officeForm, setOfficeForm] = useState({
    name: '',
    address: '',
    isActive: 'true'
  });

  useEffect(() => {
    loadOffices();
  }, [filters]);

  // fungsi untuk memuat kantor dari server
  const loadOffices = async () => {
    try {
      setLoading(true);
      const response = await officeService.getOffices(filters);
      const officesData = Array.isArray(response) ? response : (response.offices || []);
      setOffices(officesData);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kantor:', error);
      toast.error('Gagal memuat data kantor');
    } finally {
      setLoading(false);
    }
  };

  // fungsi untuk membuka modal tambah/edit
  const handleShowModal = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setOfficeForm({
        name: office.name,
        address: office.address || '',
        isActive: office.isActive
      });
    } else {
      setEditingOffice(null);
      setOfficeForm({
        name: '',
        address: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffice(null);
  };

  // fungsi untuk menangani submit form tambah/edit kantor
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingOffice) {
        await officeService.updateOffice(editingOffice.id, officeForm);
        toast.success('Kantor berhasil diupdate!');
      } else {
        await officeService.createOffice(officeForm);
        toast.success('Kantor berhasil ditambahkan!');
      }
      handleCloseModal();
      loadOffices();
    } catch (error) {
      console.error('Terjadi kesalahan saat menyimpan kantor:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Gagal menyimpan kantor';
      toast.error(errorMessage);
    }
  };

  // fungsi untuk menghapus kantor
  const handleDelete = (office) => {
    setDeletingOffice(office);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await officeService.deleteOffice(deletingOffice.id);
      toast.success('Kantor berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingOffice(null);
      loadOffices();
    } catch (error) {
      console.error('Terjadi kesalahan saat menghapus kantor:', error);
      const errorMessage = error.response?.data?.error || 'Gagal menghapus kantor';
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingOffice(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Manajemen Kantor</h2>
          <p className="text-muted mb-0">Kelola data kantor/pos satpam</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>
          Tambah Kantor
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Cari nama atau alamat kantor..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {offices.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-building fa-3x text-muted mb-3"></i>
              <p className="text-muted">Tidak ada data kantor</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Kantor</th>
                  <th>Alamat</th>
                  <th>Jumlah User</th>
                  <th>Jumlah Aset</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office, index) => (
                  <tr key={office.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{office.name}</strong>
                    </td>
                    <td>
                      <small>{office.address || '-'}</small>
                    </td>
                    <td>
                      <Badge bg="info">
                        <i className="fas fa-users me-1"></i>
                        {office._count?.users || 0}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        <i className="fas fa-box me-1"></i>
                        {office._count?.assets || 0}
                      </Badge>
                    </td>
                    <td>
                      {office.isActive ? (
                        <Badge bg="success">Aktif</Badge>
                      ) : (
                        <Badge bg="secondary">Tidak Aktif</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(office)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(office)}
                        disabled={office._count?.users > 0 || office._count?.assets > 0}
                        title={
                          office._count?.users > 0 || office._count?.assets > 0
                            ? 'Tidak dapat menghapus kantor yang memiliki user atau aset'
                            : 'Hapus kantor'
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal Tambah/Edit Kantor */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingOffice ? 'Edit Kantor' : 'Tambah Kantor'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kantor <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan nama kantor"
                value={officeForm.name}
                onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Contoh: Pos Satpam Gedung A, Kantor Utama, dll.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Alamat</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Masukkan alamat kantor (opsional)"
                value={officeForm.address}
                onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
              />
            </Form.Group>

            {editingOffice && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="office-active-switch"
                  label="Kantor Aktif"
                  checked={officeForm.isActive}
                  onChange={(e) => setOfficeForm({ ...officeForm, isActive: e.target.checked })}
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
              {editingOffice ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus kantor <strong>"{deletingOffice?.name}"</strong>?
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

export default OfficeManagement;
