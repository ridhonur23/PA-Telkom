import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Form, Row, Col, Badge, Pagination, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import loanService from '../services/loanService';
import officeService from '../services/officeService';
import userService from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const LoanHistory = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [offices, setOffices] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    total: 0
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    officeId: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  const { user } = useAuth();

  // fungsi untuk memuat daftar kantor
  const loadOffices = useCallback(async () => {
    try {
      console.log('Loading offices...');
      const response = await officeService.getOffices({ page: 1, limit: 100 });
      console.log('Offices response:', response);
      // Backend mengembalikan array langsung, bukan object dengan property offices
      const officesData = Array.isArray(response) ? response : (response.offices || []);
      setOffices(officesData);
      console.log('Offices set:', officesData);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat kantor:', error);
    }
  }, []);

  // fungsi untuk memuat daftar petugas
  const loadUsers = useCallback(async () => {
    try {
      console.log('Loading users...');
      const response = await userService.getUsers({ page: 1, limit: 100 });
      console.log('Users response:', response);
      // Backend mengembalikan object dengan property users
      const usersData = response.users || [];
      setUsers(usersData);
      console.log('Users set:', usersData);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat petugas:', error);
    }
  }, []);

  // fungsi untuk memuat data peminjaman
  const loadLoans = useCallback(async () => {
    try {
      console.log('Loading loans with filters:', filters);
      const response = await loanService.getLoans(filters);
      console.log('Loans response:', response);
      setLoans(response.loans);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat pinjaman:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // fungsi untuk memuat statistik total
  const loadStats = useCallback(async () => {
    try {
      // Ambil total untuk setiap status dengan filter yang sama (tanpa pagination)
      const baseFilters = {
        search: filters.search,
        officeId: filters.officeId,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      const [borrowedResponse, returnedResponse, totalResponse] = await Promise.all([
        loanService.getLoans({ ...baseFilters, status: 'BORROWED', limit: 1 }),
        loanService.getLoans({ ...baseFilters, status: 'RETURNED', limit: 1 }),
        loanService.getLoans({ ...baseFilters, limit: 1 })
      ]);

      setStats({
        borrowed: borrowedResponse.pagination.total || 0,
        returned: returnedResponse.pagination.total || 0,
        total: totalResponse.pagination.total || 0
      });
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat statistik:', error);
    }
  }, [filters.search, filters.officeId, filters.userId, filters.startDate, filters.endDate]);

  useEffect(() => {
    loadOffices();
    // ADMIN dan MANAGEMENT bisa melihat filter petugas
    if (user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') {
      loadUsers();
    }
  }, [loadOffices, loadUsers, user?.role]);

  useEffect(() => {
    loadLoans();
    loadStats();
  }, [loadLoans, loadStats]);

  // fungsi untuk mengekspor data peminjaman ke Excel
  const handleExportExcel = async () => {
    try {
      const blob = await loanService.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `riwayat_peminjaman_${moment().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Data berhasil diexport!');
    } catch (error) {
      console.error('Terjadi kesalahan saat mengekspor Excel:', error);
    }
  };

  // fungsi untuk mendapatkan badge status peminjaman
  const getStatusBadge = (status) => {
    switch (status) {
      case 'BORROWED':
        return <Badge bg="warning" className="badge-borrowed">Dipinjam</Badge>;
      case 'RETURNED':
        return <Badge bg="success" className="badge-returned">Dikembalikan</Badge>;
      case 'OVERDUE':
        return <Badge bg="danger" className="badge-overdue">Terlambat</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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

  // fungsi untuk menampilkan detail peminjaman
  const handleShowDetail = (loan) => {
    setSelectedLoan(loan);
    setShowDetailModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedLoan(null);
  };

  // fungsi untuk menangani perubahan halaman
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // fungsi untuk menghapus filter
  const clearDateFilters = () => {
    setFilters(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
      page: 1
    }));
  };

  // fungsi untuk menghapus semua filter
  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      officeId: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  console.log('Current user role:', user?.role);
  console.log('Offices data:', offices);
  console.log('Is ADMIN?', user?.role === 'ADMIN');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Riwayat Peminjaman</h2>
          <p className="text-muted mb-0">
            History peminjaman Aset kantor
            {user?.office && ` - ${user.office.name}`}
          </p>
        </div>
        <Button variant="success" onClick={handleExportExcel}>
          <i className="fas fa-download me-2"></i>
          Export Excel
        </Button>
      </div>

      {/* Statistics Card */}
      <Row className="mt-4 mb-3 justify-content-between">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h4 className="text-primary">{stats.borrowed}</h4>
              <small className="text-muted">Sedang Dipinjam</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h4 className="text-success">{stats.returned}</h4>
              <small className="text-muted">Sudah Dikembalikan</small>
            </Card.Body>
          </Card>
        </Col>
        {/* <Col md={3}> 
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h4 className="text-danger">{loans.filter(l => l.status === 'OVERDUE').length}</h4>
              <small className="text-muted">Terlambat</small>
            </Card.Body>
          </Card>
        </Col>
        */}
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h4 className="text-info">{stats.total}</h4>
              <small className="text-muted">Total Transaksi</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Row className="align-items-center g-2 mb-2">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Cari peminjam, asset, atau kode..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="BORROWED">Dipinjam</option>
                <option value="RETURNED">Dikembalikan</option>
                {/* <option value="OVERDUE">Terlambat</option> */}
              </Form.Select>
            </Col>
            {user?.role === 'ADMIN' && (
              <Col md={2}>
                <Form.Select
                  value={filters.officeId}
                  onChange={(e) => {
                    console.log('Office filter changed:', e.target.value);
                    handleFilterChange('officeId', e.target.value);
                  }}
                >
                  <option value="">Semua Kantor</option>
                  {offices.length > 0 ? (
                    offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading kantor...</option>
                  )}
                </Form.Select>
              </Col>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGEMENT') && (
              <Col md={2}>
                <Form.Select
                  value={filters.userId}
                  onChange={(e) => {
                    console.log('User filter changed:', e.target.value);
                    handleFilterChange('userId', e.target.value);
                  }}
                >
                  <option value="">Semua Petugas</option>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading petugas...</option>
                  )}
                </Form.Select>
              </Col>
            )}
            <Col md={2}>
              <Form.Control
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Tanggal Mulai"
              />
            </Col>
            <Col md={user?.role === 'ADMIN' ? 1 : 3}>
              <Form.Control
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="Tanggal Selesai"
              />
            </Col>
          </Row>
          <Row className="align-items-center g-2">
            <Col md="auto">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearDateFilters}
                title="Clear Date Filter"
                className="me-1"
              >
                <i className="fas fa-times me-1"></i>
                Clear Date
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={clearAllFilters}
                title="Reset Semua Filter"
              >
                <i className="fas fa-redo me-1"></i>
                Reset All
              </Button>
            </Col>
            <Col className="text-end">
              <small className="text-muted">
                Total: {pagination.total || 0} record
              </small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loans.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0" size="sm">
                <thead>
                  <tr>
                    <th>Asset</th>
                    {user?.role === 'ADMIN' && <th>Kantor</th>}
                    <th>Peminjam</th>
                    <th>Tanggal Pinjam</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                    <th>Petugas</th>
                    <th>Keperluan</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr 
                      key={loan.id}
                      style={{ cursor: 'pointer' }}
                      className="loan-row"
                      onClick={() => handleShowDetail(loan)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td>
                        <div>
                          <strong>{loan.asset.name}</strong>
                          <br />
                          <small className="text-muted">
                            {loan.asset.code} • {loan.asset.category.name}
                          </small>
                        </div>
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td>
                          <small>{loan.asset.office?.name || '-'}</small>
                        </td>
                      )}
                      <td>
                        <div>
                          <strong>{loan.borrowerName}</strong>
                          {loan.borrowerPhone && (
                            <>
                              <br />
                              <small className="text-muted">{loan.borrowerPhone}</small>
                            </>
                          )}
                          {loan.isThirdParty && (
                            <>
                              <br />
                              <Badge bg="info" className="mt-1" size="sm">
                                <i className="fas fa-building me-1"></i>
                                {loan.thirdPartyName || 'Pihak Ketiga'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <small>
                          {moment(loan.loanDate).format('DD/MM/YY HH:mm')}
                        </small>
                      </td>
                      <td>
                        <small>
                          {loan.status === 'RETURNED' && loan.actualReturnDate
                            ? moment(loan.actualReturnDate).format('DD/MM/YY HH:mm')
                            : loan.returnDate 
                              ? moment(loan.returnDate).format('DD/MM/YY HH:mm')
                              : '-'
                          }
                        </small>
                      </td>
                      <td>
                        {getStatusBadge(loan.status)}
                      </td>
                      <td>
                        <small>{loan.user.fullName}</small>
                      </td>
                      <td>
                        <small title={loan.purpose}>
                          {loan.purpose 
                            ? (loan.purpose.length > 20 
                                ? loan.purpose.substring(0, 20) + '...' 
                                : loan.purpose)
                            : '-'
                          }
                        </small>
                      </td>
                      <td>
                        <small title={loan.notes}>
                          {loan.notes 
                            ? (loan.notes.length > 15 
                                ? loan.notes.substring(0, 15) + '...' 
                                : loan.notes)
                            : '-'
                          }
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <p>Belum ada riwayat peminjaman</p>
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

      {/* Modal Detail Peminjaman */}
      <Modal show={showDetailModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detail Peminjaman</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLoan && (
            <>
              {console.log('Selected Loan:', selectedLoan)}
              {console.log('Loan Photo:', selectedLoan.loanPhoto)}
              {console.log('Return Photo:', selectedLoan.returnPhoto)}
              {console.log('Notes:', selectedLoan.notes)}
              <Row>
              <Col md={12}>
                <h6 className="text-primary mb-3">
                  <i className="fas fa-box me-2"></i>
                  Informasi Asset
                </h6>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Nama Asset</Form.Label>
                  <Form.Control type="text" value={selectedLoan.asset.name} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Kode Asset</Form.Label>
                  <Form.Control type="text" value={selectedLoan.asset.code} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Kategori</Form.Label>
                  <Form.Control type="text" value={selectedLoan.asset.category.name} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Kantor</Form.Label>
                  <Form.Control type="text" value={selectedLoan.asset.office?.name || '-'} readOnly />
                </Form.Group>
              </Col>

              <Col md={12}>
                <hr />
                <h6 className="text-primary mb-3">
                  <i className="fas fa-user me-2"></i>
                  Informasi Peminjam
                </h6>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Nama Peminjam</Form.Label>
                  <Form.Control type="text" value={selectedLoan.borrowerName} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">No. Telepon</Form.Label>
                  <Form.Control type="text" value={selectedLoan.borrowerPhone || '-'} readOnly />
                </Form.Group>
              </Col>

              {selectedLoan.isThirdParty && (
                <>
                  <Col md={12}>
                    <Badge bg="info" className="mb-3">
                      <i className="fas fa-building me-1"></i>
                      Peminjaman Pihak Ketiga
                    </Badge>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Nama Organisasi/Perusahaan</Form.Label>
                      <Form.Control type="text" value={selectedLoan.thirdPartyName || '-'} readOnly />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Alamat Pihak Ketiga</Form.Label>
                      <Form.Control type="text" value={selectedLoan.thirdPartyAddress || '-'} readOnly />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col md={12}>
                <hr />
                <h6 className="text-primary mb-3">
                  <i className="fas fa-calendar me-2"></i>
                  Informasi Waktu
                </h6>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tanggal Peminjaman</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={moment(selectedLoan.loanDate).format('DD/MM/YYYY HH:mm')} 
                    readOnly 
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Target Pengembalian</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={selectedLoan.returnDate ? moment(selectedLoan.returnDate).format('DD/MM/YYYY HH:mm') : '-'} 
                    readOnly 
                  />
                </Form.Group>
              </Col>

              {selectedLoan.status === 'RETURNED' && selectedLoan.actualReturnDate && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Tanggal Pengembalian Aktual</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={moment(selectedLoan.actualReturnDate).format('DD/MM/YYYY HH:mm')} 
                      readOnly 
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Status</Form.Label>
                  <div>
                    {selectedLoan.status === 'BORROWED' && (
                      <Badge bg="warning">Dipinjam</Badge>
                    )}
                    {selectedLoan.status === 'RETURNED' && (
                      <Badge bg="success">Dikembalikan</Badge>
                    )}
                    {selectedLoan.status === 'OVERDUE' && (
                      <Badge bg="danger">Terlambat</Badge>
                    )}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Diproses Oleh</Form.Label>
                  <Form.Control type="text" value={selectedLoan.user.fullName} readOnly />
                </Form.Group>
              </Col>

              {selectedLoan.purpose && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Keperluan</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      value={selectedLoan.purpose} 
                      readOnly 
                    />
                  </Form.Group>
                </Col>
              )}

              {selectedLoan.notes && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Catatan Pengembalian</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      value={selectedLoan.notes} 
                      readOnly 
                    />
                  </Form.Group>
                </Col>
              )}

              {(selectedLoan.loanPhoto || selectedLoan.returnPhoto) && (
                <>
                  <Col md={12}>
                    <hr />
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-camera me-2"></i>
                      Dokumentasi Foto
                    </h6>
                  </Col>

                  {selectedLoan.loanPhoto && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Foto Saat Peminjaman</Form.Label>
                        <div>
                          <img 
                            src={`http://localhost:5000${selectedLoan.loanPhoto}`}
                            alt="Loan" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              border: '2px solid #dee2e6',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5000${selectedLoan.loanPhoto}`, '_blank')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  )}

                  {selectedLoan.returnPhoto && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Foto Saat Pengembalian</Form.Label>
                        <div>
                          <img 
                            src={`http://localhost:5000${selectedLoan.returnPhoto}`}
                            alt="Return" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              border: '2px solid #dee2e6',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5000${selectedLoan.returnPhoto}`, '_blank')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  )}
                </>
              )}
            </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      
    </div>
  );
};

export default LoanHistory;
