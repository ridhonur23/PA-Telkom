import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-grow-1">
        <Header onToggleSidebar={toggleSidebar} />
        <Container fluid className="main-content">
          <Row>
            <Col>
              <Outlet />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Layout;
