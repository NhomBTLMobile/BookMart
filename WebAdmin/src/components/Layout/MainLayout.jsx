import { Layout } from 'antd'
import Sidebar from './Sidebar'
import AppHeader from './Header'

const { Content } = Layout

export default function MainLayout({ children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <AppHeader />
        <Content style={{ padding: 24, overflowY: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
