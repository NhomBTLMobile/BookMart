import React from 'react'
import { Result, Button, Card, Typography } from 'antd'

const { Paragraph, Text } = Typography

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f5f5f5' }}>
          <Card style={{ maxWidth: 600, width: '100%', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <Result
              status="error"
              title="Giao diện gặp lỗi khi hiển thị"
              subTitle="Đã xảy ra lỗi không mong muốn trong ứng dụng."
              extra={[
                <Button type="primary" key="reload" onClick={this.handleReset}>
                  Tải lại trang
                </Button>,
              ]}
            >
              {this.state.error && (
                <div style={{ textAlign: 'left', background: '#fff1f0', border: '1px solid #ffa39e', padding: 12, borderRadius: 6, marginTop: 16 }}>
                  <Text danger strong>{this.state.error.toString()}</Text>
                  {this.state.errorInfo?.componentStack && (
                    <Paragraph style={{ marginTop: 8, fontSize: 11, fontFamily: 'monospace', maxHeight: 200, overflowY: 'auto' }}>
                      {this.state.errorInfo.componentStack}
                    </Paragraph>
                  )}
                </div>
              )}
            </Result>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
