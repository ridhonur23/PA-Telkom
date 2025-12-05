import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import loanService from '../services/loanService';
import assetService from '../services/assetService';
import LoadingSpinner from '../components/LoadingSpinner';
import moment from 'moment';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });

  const [loanForm, setLoanForm] = useState({
    assetId: null,
    borrowerName: '',
    borrowerPhone: '',
    purpose: '',
    returnDate: '',
    isThirdParty: false,
    thirdPartyName: '',
    thirdPartyAddress: ''
  });

  const [returnForm, setReturnForm] = useState({
    notes: ''
  });

  // fungsi untuk memuat data peminjaman
  const loadLoans = useCallback(async () => {
    try {
      const response = await loanService.getLoans(filters);
      setLoans(response.loans);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat pinjaman:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLoans();
    loadAssets();

    // tutup dropdown saat klik di luar
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-asset-search]')) {
        setShowAssetDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filters, loadLoans]);

  // fungsi untuk memuat data asset
  const loadAssets = async () => {
    try {
      const response = await assetService.getAssets({ 
        isAvailable: true, 
        isActive: true,
        limit: 100
      });
      setAssets(response.assets);
      setFilteredAssets(response.assets);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat aset:', error);
    }
  };

  // fungsi untuk menangani pencarian asset
  const handleAssetSearch = (searchValue) => {
    setAssetSearch(searchValue);
    
    if (searchValue.trim() === '') {
      setFilteredAssets(assets);
      setShowAssetDropdown(false);
    } else {
      const filtered = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        asset.category.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredAssets(filtered);
      setShowAssetDropdown(true);
    }
  };
  // fungsi untuk menangani pemilihan asset dari dropdown
  const handleAssetSelect = (asset) => {
    setLoanForm(prev => ({...prev, assetId: asset.id}));
    setAssetSearch(`${asset.name} - ${asset.code} (${asset.category.name})`);
    setShowAssetDropdown(false);
  };

  // fungsi untuk menampilkan modal peminjaman
  const handleShowModal = () => {
    setLoanForm({
      assetId: null,
      borrowerName: '',
      borrowerPhone: '',
      purpose: '',
      returnDate: '',
      isThirdParty: false,
      thirdPartyName: '',
      thirdPartyAddress: ''
    });
    setAssetSearch('');
    setShowAssetDropdown(false);
    setShowModal(true);
  };

  // fungsi untuk menutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    setShowReturnModal(false);
    setSelectedLoan(null);
  };

  // fungsi untuk membuat peminjaman
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form di frontend
    if (!loanForm.assetId) {
      toast.error('Silakan pilih asset terlebih dahulu');
      return;
    }
    
    if (!loanForm.borrowerName.trim()) {
      toast.error('Nama peminjam harus diisi');
      return;
    }

    // Validasi untuk pihak ketiga
    if (loanForm.isThirdParty && !loanForm.thirdPartyName.trim()) {
      toast.error('Nama organisasi/perusahaan pihak ketiga harus diisi');
      return;
    }
    
    console.log('mengirim data peminjaman:', loanForm);
    
    try {
      // Pastikan assetId adalah integer
      const submitData = {
        ...loanForm,
        assetId: parseInt(loanForm.assetId),
        borrowerName: loanForm.borrowerName.trim(),
        borrowerPhone: loanForm.borrowerPhone?.trim() || '',
        purpose: loanForm.purpose?.trim() || '',
        returnDate: loanForm.returnDate || undefined,
        isThirdParty: loanForm.isThirdParty,
        thirdPartyName: loanForm.isThirdParty ? loanForm.thirdPartyName.trim() : undefined,
        thirdPartyAddress: loanForm.isThirdParty ? loanForm.thirdPartyAddress?.trim() : undefined
      };
      
      console.log('Pengiriman data diproses:', submitData);
      
      await loanService.createLoan(submitData);
      toast.success('Peminjaman berhasil dibuat!');
      handleCloseModal();
      loadLoans();
      loadAssets(); // Refresh aset yang tersedia
    } catch (error) {
      console.error('Terjadi kesalahan saat membuat peminjaman:', error);
      toast.error('Gagal membuat peminjaman: ' + (error.response?.data?.error || error.message));
    }
  };

  // fungsi untuk menangani pengembalian asset
  const handleReturn = (loan) => {
    setSelectedLoan(loan);
    setReturnForm({ notes: '' });
    setShowReturnModal(true);
  };

  // fungsi untuk mengembalikan asset
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await loanService.returnAsset(selectedLoan.id, returnForm.notes);
      toast.success('Asset berhasil dikembalikan!');
      handleCloseModal();
      loadLoans();
      loadAssets(); // Refresh aset yang tersedia
    } catch (error) {
      console.error('Terjadi kesalahan saat mengembalikan asset:', error);
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
  
  // Fungsi helper untuk menghitung keterlambatan dalam jam dan menit
  const calculateOverdueTime = (returnDate) => {
    const now = moment();
    const targetReturn = moment(returnDate);
    
    if (now.isBefore(targetReturn)) {
      return null; // Belum terlambat
    }
    
    const diffMinutes = now.diff(targetReturn, 'minutes');
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    } else {
      return `${minutes} menit`;
    }
  };

  // fungsi untuk menangani perubahan filter
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Setel ulang ke halaman pertama saat memfilter
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
          <h2>Manajemen Peminjaman</h2>
          <p className="text-muted mb-0">Kelola peminjaman Aset</p>
        </div>
        <Button variant="primary" onClick={handleShowModal}>
          <i className="fas fa-plus me-2"></i>
          Buat Peminjaman
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Cari peminjam, asset, atau kode..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="BORROWED">Dipinjam</option>
                <option value="RETURNED">Dikembalikan</option>
                <option value="OVERDUE">Terlambat</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <small className="text-muted">
                Total: {pagination.total || 0} peminjaman
              </small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loans.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0 loan-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Peminjam</th>
                    <th>Tanggal Pinjam</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                    <th>Petugas</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <div>
                          <strong>{loan.asset.name}</strong>
                          <br />
                          <small className="text-muted">{loan.asset.code}</small>
                        </div>
                      </td>
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
                              <Badge bg="info" className="mt-1">
                                <i className="fas fa-building me-1"></i>
                                Pihak Ketiga
                              </Badge>
                              {loan.thirdPartyName && (
                                <>
                                  <br />
                                  <small className="text-primary fw-bold">
                                    {loan.thirdPartyName}
                                  </small>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{moment(loan.loanDate).format('DD/MM/YYYY HH:mm')}</strong>
                          <br />
                          {/* <small className="text-muted loan-duration">
                            {loan.status === 'BORROWED' 
                              ? `${moment().diff(moment(loan.loanDate), 'days')} hari yang lalu` 
                              : loan.actualReturnDate 
                                ? `Durasi: ${moment(loan.actualReturnDate).diff(moment(loan.loanDate), 'days')} hari`
                                : 'Selesai'
                            }
                          </small> */}
                        </div>
                      </td>
                      <td>
                        <div className="return-time-container">
                          {loan.status === 'RETURNED' && loan.actualReturnDate ? (
                            <div className="return-time-target">
                              <span className="text-success">
                                {moment(loan.actualReturnDate).format('DD/MM/YYYY HH:mm')}
                              </span>
                            </div>
                          ) : loan.returnDate ? (
                            <>
                              <div className="return-time-target">
                                <span className={
                                  loan.status === 'BORROWED' && moment().isAfter(moment(loan.returnDate))
                                    ? 'text-danger fw-bold overdue-indicator' // Teks merah tebal jika terlambat
                                    : 'text-primary'
                                }>
                                  {moment(loan.returnDate).format('DD/MM/YYYY HH:mm')}
                                </span>
                                {loan.status === 'BORROWED' && moment().isAfter(moment(loan.returnDate)) && (
                                  <div className="loan-info-item">
                                    <small className="text-danger overdue-indicator">
                                      <i className="fas fa-exclamation-triangle me-1"></i>
                                      Terlambat {calculateOverdueTime(loan.returnDate)}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted">Tidak ada target</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(loan.status)}
                      </td>
                      <td>
                        <small>{loan.user.fullName}</small>
                      </td>
                      <td>
                        {loan.status === 'BORROWED' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleReturn(loan)}
                          >
                            <i className="fas fa-check me-1"></i>
                            Kembalikan
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-handshake"></i>
              <p>Belum ada data peminjaman</p>
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

      {/* Create Loan Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Buat Peminjaman Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLoanSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Asset *</Form.Label>
                  <div style={{ position: 'relative' }} data-asset-search>
                    <Form.Control
                      type="text"
                      placeholder="Ketik untuk mencari asset..."
                      value={assetSearch}
                      onChange={(e) => handleAssetSearch(e.target.value)}
                      onFocus={() => {
                        if (assetSearch.trim() !== '') {
                          setShowAssetDropdown(true);
                        }
                      }}
                      required
                    />
                    {showAssetDropdown && filteredAssets.length > 0 && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #dee2e6',
                          borderTop: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {filteredAssets.map((asset) => (
                          <div
                            key={asset.id}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f8f9fa'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            onClick={() => handleAssetSelect(asset)}
                          >
                            <div style={{ fontWeight: '500' }}>
                              {asset.name} - {asset.code}
                            </div>
                            <small style={{ color: '#6c757d' }}>
                              {asset.category.name} • {asset.office.name}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                    {showAssetDropdown && filteredAssets.length === 0 && assetSearch.trim() !== '' && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #dee2e6',
                          borderTop: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem',
                          padding: '12px',
                          zIndex: 1000,
                          textAlign: 'center',
                          color: '#6c757d',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Tidak ada asset yang ditemukan
                      </div>
                    )}
                  </div>
                  <Form.Text className="text-muted">
                    Cari berdasarkan nama asset, kode, atau kategori
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Peminjam *</Form.Label>
                  <Form.Control
                    type="text"
                    value={loanForm.borrowerName}
                    onChange={(e) => setLoanForm({...loanForm, borrowerName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>No. Telepon</Form.Label>
                  <Form.Control
                    type="tel"
                    value={loanForm.borrowerPhone}
                    onChange={(e) => setLoanForm({...loanForm, borrowerPhone: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Kembali</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={loanForm.returnDate}
                    onChange={(e) => setLoanForm({...loanForm, returnDate: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Keperluan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={loanForm.purpose}
                    onChange={(e) => setLoanForm({...loanForm, purpose: e.target.value})}
                    placeholder="Deskripsikan keperluan peminjaman..."
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Peminjaman oleh Pihak Ketiga (Organisasi/Perusahaan)"
                    checked={loanForm.isThirdParty}
                    onChange={(e) => setLoanForm({
                      ...loanForm, 
                      isThirdParty: e.target.checked,
                      // Reset field pihak ketiga jika checkbox dinonaktifkan
                      thirdPartyName: e.target.checked ? loanForm.thirdPartyName : '',
                      thirdPartyAddress: e.target.checked ? loanForm.thirdPartyAddress : ''
                    })}
                  />
                </Form.Group>
              </Col>

              {loanForm.isThirdParty && (
                <>
                  <Col md={12}>
                    <hr />
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-building me-2"></i>
                      Informasi Pihak Ketiga
                    </h6>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nama Organisasi/Perusahaan *</Form.Label>
                      <Form.Control
                        type="text"
                        value={loanForm.thirdPartyName}
                        onChange={(e) => setLoanForm({...loanForm, thirdPartyName: e.target.value})}
                        placeholder="Contoh: PT. Telkom Indonesia"
                        required={loanForm.isThirdParty}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Alamat Pihak Ketiga</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={loanForm.thirdPartyAddress}
                        onChange={(e) => setLoanForm({...loanForm, thirdPartyAddress: e.target.value})}
                        placeholder="Alamat lengkap organisasi/perusahaan"
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i>
              Simpan Peminjaman
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Return Asset Modal */}
      <Modal show={showReturnModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Kembalikan Asset</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReturnSubmit}>
          <Modal.Body>
            {selectedLoan && (
              <div className="mb-3">
                <strong>Asset:</strong> {selectedLoan.asset.name} - {selectedLoan.asset.code}
                <br />
                <strong>Peminjam:</strong> {selectedLoan.borrowerName}
                <br />
                <strong>Tanggal Pinjam:</strong> {moment(selectedLoan.loanDate).format('DD/MM/YYYY HH:mm')}
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Catatan Pengembalian</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={returnForm.notes}
                onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                placeholder="Kondisi asset, kerusakan, atau catatan lainnya..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              <i className="fas fa-check me-2"></i>
              Konfirmasi Pengembalian
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LoanManagement;