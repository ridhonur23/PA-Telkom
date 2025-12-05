import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      roles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
    },
    {
      path: '/loans',
      icon: 'fas fa-handshake',
      label: 'Peminjaman',
      roles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
    },
    {
      path: '/history',
      icon: 'fas fa-history',
      label: 'Riwayat Peminjaman',
      roles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
    },
    {
      path: '/assets',
      icon: 'fas fa-car',
      label: 'Aset',
      roles: ['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']
    },
    {
      path: '/categories',
      icon: 'fas fa-tags',
      label: 'Kelola Kategori',
      roles: ['ADMIN']
    },
    {
      path: '/users',
      icon: 'fas fa-users',
      label: 'Kelola User',
      roles: ['ADMIN']
    },
    {
      path: '/offices',
      icon: 'fas fa-building',
      label: 'Kelola Kantor',
      roles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={onToggle}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'show' : ''} d-md-block col-md-3 col-lg-2`}>
        <div className="p-3">
          <div className="text-center mb-4">
            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                 style={{ width: '100px', height: '100px' }}>
              <img src="/images/tlkm.png" alt="Logo-Telkom" style={{ width: '80%', height: '80%' }} />
            </div>
            <h6 className="text-white mt-2 mb-0">Telkom Bojonegoro</h6>
          </div>
          
          <Nav className="flex-column">
            {filteredMenuItems.map((item, index) => (
              <Nav.Link
                key={index}
                as={Link}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => isOpen && onToggle()}
              >
                <i className={item.icon}></i>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
