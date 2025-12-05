import React from 'react';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
      <Button
        variant="outline-light"
        className="d-md-none me-2"
        onClick={onToggleSidebar}
      >
        <i className="fas fa-bars"></i>
      </Button>
      
      <Navbar.Brand>
        <i className="fas fa-building me-2"></i>
        Sistem Peminjaman Telkom Bojonegoro
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-light" id="user-dropdown">
              <i className="fas fa-user me-2"></i>
              {user?.fullName}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <i className="fas fa-id-badge me-2"></i>
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'SECURITY_GUARD' ? 'Satpam' : 'Manajemen'}
              </Dropdown.Item>
              {user?.office && (
                <Dropdown.Item>
                  <i className="fas fa-building me-2"></i>
                  {user.office.name}
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
