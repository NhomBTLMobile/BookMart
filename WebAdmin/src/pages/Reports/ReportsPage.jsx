import React, { useState, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Table, Typography, Space, Button, Statistic, Empty, App } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { DownloadOutlined, BarChartOutlined, DollarOutlined, ShoppingCartOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { dashboardApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

const { RangePicker } = DatePicker
const { Title, Text } = Typography

const fmt = n => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)

export default function ReportsPage() {
  const { message } = App.useApp()
  const { isDark } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()])
  
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalBooksSold: 0, newUsers: 0 })
  const [revenueData, setRevenueData] = useState([])
  const [topBooks, setTopBooks] = useState([])

  const fetchReports = async (start, end) => {
    if (!start || !end) return
    setLoading(true)
    try {
      const params = {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD')
      }
      
      const [st, ch, tb] = await Promise.all([
        dashboardApi.getStats(params),
        dashboardApi.getRevenueChart(params),
        dashboardApi.getTopBooks(params)
      ])
      
      if (st.data?.success) setStats(st.data.data)
      if (ch.data?.success) setRevenueData(ch.data.data)
      if (tb.data?.success) setTopBooks(tb.data.data)
      
    } catch (error) {
      console.error(error)
      message.error('Không thể tải báo cáo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(dateRange[0], dateRange[1])
  }, [])

  const handleDateChange = (dates) => {
    setDateRange(dates)
    if (dates && dates.length === 2) {
      fetchReports(dates[0], dates[1])
    }
  }

  const getLogoBase64 = async () => {
    try {
      const response = await fetch('/bookmart_logo_full.png')
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.log('Cannot load logo')
      return null
    }
  }


  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      }
      
      const exportRes = await dashboardApi.getExportData(params)
      if (!exportRes.data?.success) throw new Error('Failed to fetch export data')
      
      const { orders, books } = exportRes.data.data
      
      const wb = new ExcelJS.Workbook()
      wb.creator = 'BookMart System'
      wb.created = new Date()

      // Header styles
      const headerStyle = {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: { 
          top: { style: 'thin', color: { argb: 'FF000000' } }, 
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } }, 
          right: { style: 'thin', color: { argb: 'FF000000' } } 
        }
      }

      // Add Logo
      const logoDataUrl = await getLogoBase64()
      let logoId = null
      if (logoDataUrl) {
        const base64Data = logoDataUrl.includes(',') ? logoDataUrl.split(',')[1] : logoDataUrl
        try {
          logoId = wb.addImage({
            base64: base64Data,
            extension: 'png',
          })
        } catch (e) {
          console.warn('Cannot add logo', e)
        }
      }

      // ── Sheet 1: BÁO CÁO DOANH THU ──
      const wsOverview = wb.addWorksheet('Báo Cáo Doanh Thu')
      
      // Title
      wsOverview.mergeCells('A1:G1')
      const titleCell = wsOverview.getCell('A1')
      titleCell.value = 'BÁO CÁO DOANH THU BÁN HÀNG'
      titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1B5E20' } }
      titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

      // Subtitle
      wsOverview.mergeCells('A2:G2')
      const subCell = wsOverview.getCell('A2')
      subCell.value = 'Trích xuất dữ liệu từ hệ thống quản lý BookMart. Bảng báo cáo chi tiết doanh thu theo từng đầu sách.'
      subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF1B5E20' } }

      // Summary Header row (Row 4)
      wsOverview.getCell('A4').value = 'NGƯỜI XUẤT'
      wsOverview.mergeCells('B4:D4')
      wsOverview.getCell('B4').value = 'THỜI GIAN BÁO CÁO'
      
      wsOverview.getCell('F4').value = 'TỔNG DOANH THU'
      wsOverview.getCell('G4').value = Number(stats.totalRevenue)

      // Summary Values row (Row 5)
      wsOverview.getCell('A5').value = 'Admin'
      wsOverview.mergeCells('B5:D5')
      wsOverview.getCell('B5').value = `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`

      wsOverview.getCell('F5').value = 'SỐ ĐƠN HÀNG'
      wsOverview.getCell('G5').value = Number(stats.totalOrders)

      wsOverview.getCell('F6').value = 'SỐ SÁCH BÁN RA'
      wsOverview.getCell('G6').value = Number(stats.totalBooksSold)

      wsOverview.getCell('F7').value = 'KHÁCH HÀNG MỚI'
      wsOverview.getCell('G7').value = Number(stats.newUsers)

      // Styling summary
      ;['A4', 'B4', 'F4', 'F5', 'F6', 'F7'].forEach(cell => {
        wsOverview.getCell(cell).font = { name: 'Arial', size: 10, color: { argb: 'FF1B5E20' }, bold: true }
      })
      ;['A5', 'B5'].forEach(cell => {
        wsOverview.getCell(cell).font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } }
        wsOverview.getCell(cell).border = { 
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
        wsOverview.getCell(cell).alignment = { horizontal: 'center' }
      })
      ;['G4', 'G5', 'G6', 'G7'].forEach(cell => {
        wsOverview.getCell(cell).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } }
        wsOverview.getCell(cell).alignment = { horizontal: 'right' }
      })
      wsOverview.getCell('G4').numFmt = '#,##0'
      wsOverview.getCell('G5').numFmt = '#,##0'
      wsOverview.getCell('G6').numFmt = '#,##0'
      wsOverview.getCell('G7').numFmt = '#,##0'

      // Underline Totals to match the template
      ;['F4', 'F5', 'F6', 'F7', 'G4', 'G5', 'G6', 'G7'].forEach(cell => {
        wsOverview.getCell(cell).border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      })
      
      // Table Header (Row 9)
      const startRow = 9
      wsOverview.getRow(startRow).values = ['MÃ ISBN', 'TÊN SÁCH', 'THỂ LOẠI', 'ĐƠN GIÁ (VNĐ)', 'SỐ LƯỢNG', 'DOANH THU', 'ĐÓNG GÓP %']
      wsOverview.getRow(startRow).height = 20
      wsOverview.getRow(startRow).eachCell((cell) => {
        cell.style = headerStyle
      })

      // Table Data
      let rowIdx = startRow + 1
      ;(books || []).forEach((b, idx) => {
        const row = wsOverview.getRow(rowIdx)
        const revenue = Number(b.total_revenue) || 0
        const percentage = stats.totalRevenue > 0 ? (revenue / stats.totalRevenue) : 0

        row.values = [
          b.book_code || '-',
          b.title,
          b.category || 'Khác',
          Number(b.sale_price) || 0,
          Number(b.qty_sold) || 0,
          revenue,
          percentage
        ]
        
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 }
          
          // Alternating background color
          if (idx % 2 !== 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F4' } }
          }
          
          cell.border = { 
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          }
          if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
            cell.numFmt = '#,##0'
          }
          if (colNumber === 7) {
            cell.numFmt = '0.00%'
          }
        })
        rowIdx++
      })

      // Logo placement
      if (logoId) {
        // Place logo near G1 or right align
        wsOverview.addImage(logoId, {
          tl: { col: 5, row: 0 },
          ext: { width: 100, height: 35 }
        })
      }

      // Columns Width
      wsOverview.columns = [
        { width: 15 }, // A: ISBN
        { width: 45 }, // B: Title
        { width: 20 }, // C: Category
        { width: 15 }, // D: Price
        { width: 12 }, // E: Qty
        { width: 18 }, // F: Revenue
        { width: 15 }, // G: % Contribution
      ]


      // ── Sheet 2: Chi tiết đơn hàng ──
      const wsOrders = wb.addWorksheet('Chi Tiết Đơn Hàng')
      
      wsOrders.mergeCells('A1:J1')
      const titleOrders = wsOrders.getCell('A1')
      titleOrders.value = 'BẢNG KÊ CHI TIẾT ĐƠN HÀNG'
      titleOrders.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1B5E20' } }
      titleOrders.alignment = { vertical: 'middle', horizontal: 'center' }

      wsOrders.getRow(3).values = ['Mã Đơn', 'Khách Hàng', 'SĐT', 'Ngày Đặt', 'Thanh Toán', 'Trạng Thái', 'Tạm Tính', 'Phí Ship', 'Khuyến Mãi', 'Thực Thu']
      wsOrders.getRow(3).height = 20
      wsOrders.getRow(3).eachCell((cell) => {
        cell.style = headerStyle
      })
      wsOrders.autoFilter = 'A3:J3'

      wsOrders.columns = [
        { key: 'code', width: 15 },
        { key: 'name', width: 25 },
        { key: 'phone', width: 15 },
        { key: 'date', width: 20 },
        { key: 'payment', width: 15 },
        { key: 'status', width: 15 },
        { key: 'subtotal', width: 15 },
        { key: 'shipping', width: 15 },
        { key: 'discount', width: 15 },
        { key: 'total', width: 15 }
      ]

      ;(orders || []).forEach((o, index) => {
        const row = wsOrders.addRow({
          code: o.order_code,
          name: o.customer_name || 'Khách vãng lai',
          phone: o.customer_phone || '',
          date: o.order_date,
          payment: o.payment_method === 'vnpay' ? 'VNPay' : 'COD',
          status: o.order_status,
          subtotal: Number(o.subtotal) || 0,
          shipping: Number(o.shipping_fee) || 0,
          discount: Number(o.discount_amount) || 0,
          total: Number(o.total_amount) || 0
        })

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 }
          if (index % 2 !== 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F4' } }
          }
          cell.border = { 
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          }
          if (colNumber > 6) {
            cell.numFmt = '#,##0'
          }
        })
      })

      // Generate and save file
      const buffer = await wb.xlsx.writeBuffer()
      const fileName = `BaoCao_BookMart_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName)
      
      message.success('Đã xuất báo cáo chuyên nghiệp thành công')
    } catch (error) {
      console.error(error)
      message.error('Có lỗi xảy ra khi xuất báo cáo')
    } finally {
      setLoading(false)
    }
  }
  const revenueColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: v => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', align: 'right', render: v => <Text strong>₫ {fmt(v)}</Text> }
  ]

  const tooltipStyle = {
    background: isDark ? '#27272A' : '#ffffff',
    border: `1px solid ${isDark ? '#3F3F46' : '#e2e8f0'}`,
    borderRadius: 8,
    fontSize: 13,
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>Báo Cáo Thống Kê</Title>
          <Text type="secondary">Phân tích chi tiết số liệu toàn hệ thống theo thời gian</Text>
        </div>
        <Space>
          <RangePicker 
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            allowClear={false}
            presets={[
              { label: 'Hôm nay', value: [dayjs(), dayjs()] },
              { label: '7 ngày qua', value: [dayjs().subtract(7, 'd'), dayjs()] },
              { label: '30 ngày qua', value: [dayjs().subtract(30, 'd'), dayjs()] },
              { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              { label: 'Năm nay', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
            ]}
          />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
            Xuất Báo Cáo
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Tổng doanh thu" value={stats.totalRevenue} prefix="₫" formatter={v => fmt(v)} valueStyle={{ color: '#059669', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Tổng đơn hàng" value={stats.totalOrders} suffix="đơn" valueStyle={{ color: '#1677ff', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Sách đã bán" value={stats.totalBooksSold} suffix="cuốn" valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Khách hàng mới" value={stats.newUsers} suffix="người" valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ Doanh Thu" style={{ borderRadius: 12, height: '100%' }} variant="outlined">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3F3F46' : '#f1f5f9'} />
                  <XAxis dataKey="date" tick={{ fill: isDark ? '#8c8c8c' : '#64748b', fontSize: 11 }} tickFormatter={v => dayjs(v).format('DD/MM')} />
                  <YAxis tick={{ fill: isDark ? '#8c8c8c' : '#64748b', fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                  <ReTooltip contentStyle={tooltipStyle} formatter={(v) => [`₫ ${fmt(v)}`, 'Doanh thu']} labelFormatter={v => dayjs(v).format('DD/MM/YYYY')} />
                  <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty description="Không có dữ liệu trong khoảng thời gian này" />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Bảng Doanh Thu Chi Tiết" style={{ borderRadius: 12, height: '100%' }} variant="outlined">
            <Table 
              dataSource={revenueData.slice().reverse()} 
              columns={revenueColumns} 
              rowKey="date" 
              size="small"
              pagination={{ pageSize: 6 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Top Sách Bán Chạy Nhất" style={{ borderRadius: 12 }} variant="outlined">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topBooks} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={250} tick={{ fontSize: 12 }} />
                <ReTooltip contentStyle={tooltipStyle} formatter={(v) => [`${fmt(v)} cuốn`, 'Số lượng bán']} />
                <Bar dataKey="total_quantity" fill="#1677ff" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
