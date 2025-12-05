import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dashboardService from '../services/dashboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

// daftar registrasi ChartJS yang diperlukan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // fungsi untuk memuat data dasbor dari server
  const loadDashboardData = async () => {
    try {
      const [statsResponse, chartResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData()
      ]);

      setStats(statsResponse.stats);
      setRecentLoans(statsResponse.recentLoans);
      setChartData(chartResponse);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat data dasbor:', error);
    } finally {
      setLoading(false);
    }
  };

  // fungsi untuk mendapatkan badge status peminjaman
  const getStatusBadge = (status) => {
    switch (status) {
      case 'BORROWED':
        return <span className="badge badge-borrowed">Dipinjam</span>;
      case 'RETURNED':
        return <span className="badge badge-returned">Dikembalikan</span>;
      case 'OVERDUE':
        return <span className="badge badge-overdue">Terlambat</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">
            Selamat datang, {user?.fullName}
            {user?.office && ` - ${user.office.name}`}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-tags"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.totalCategories || 0}</h3>
                <small className="text-muted">Total Kategori</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-car"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.totalAssets || 0}</h3>
                <small className="text-muted">Total Asset</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-calendar-day"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.loansToday || 0}</h3>
                <small className="text-muted">Peminjaman Hari Ini</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-handshake"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.activeLoanCount || 0}</h3>
                <small className="text-muted">Sedang Dipinjam</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-check-circle"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.returnedTodayCount || 0}</h3>
                <small className="text-muted">Dikembalikan Hari Ini</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.overdueLoanCount || 0}</h3>
                <small className="text-muted">Terlambat</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
         */}

        {/* <Col md={3} className="mb-3"> 
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-check"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.availableAssets || 0}</h3>
                <small className="text-muted">Asset Tersedia</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
         */}

        {/* <Col md={3} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon me-3">
                <i className="fas fa-times"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats?.unavailableAssets || 0}</h3>
                <small className="text-muted">Asset Tidak Tersedia</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
          */}
      </Row>

      <Row>
        {/* Chart */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Grafik Peminjaman 7 Hari Terakhir
              </h5>
            </Card.Header>
            <Card.Body>
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Tidak ada data grafik</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Loans */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Peminjaman Terbaru
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {recentLoans.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0" size="sm">
                    <tbody>
                      {recentLoans.slice(0, 8).map((loan) => (
                        <tr key={loan.id}>
                          <td>
                            <div>
                              <strong>{loan.asset.name}</strong>
                              <br />
                              <small className="text-muted">
                                {loan.borrowerName}
                              </small>
                            </div>
                          </td>
                          <td className="text-end">
                            {getStatusBadge(loan.status)}
                            <br />
                            <small className="text-muted">
                              {moment(loan.loanDate).format('DD/MM HH:mm')}
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
                  <p>Belum ada peminjaman</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
