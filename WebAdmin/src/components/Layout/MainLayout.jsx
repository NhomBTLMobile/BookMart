import { Layout, Drawer } from 'antd'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import AppHeader from './Header'

const { Content } = Layout

export default function MainLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          styles={{ body: { padding: 0 } }}
          width={240}
        >
          <Sidebar isMobile={isMobile} onClose={() => setMobileMenuOpen(false)} />
        </Drawer>
      ) : (
        <Sidebar isMobile={isMobile} />
      )}
      <Layout style={{ minWidth: 0 }}>
        <AppHeader isMobile={isMobile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <Content style={{ padding: isMobile ? 16 : 24, overflowY: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
