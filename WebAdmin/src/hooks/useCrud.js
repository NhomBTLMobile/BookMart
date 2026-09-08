import { useState, useEffect, useCallback } from 'react'
import { App } from 'antd'

export function useCrud(apiFns, limit = 10) {
  const { message } = App.useApp()
  const [data, setData]       = useState([])
  const [meta, setMeta]       = useState(null)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFns.getAll({ page, limit, search })
      setData(res.data.data || [])
      setMeta(res.data.meta || null)
    } catch {
      message.error('Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])

  const create = async (payload) => {
    await apiFns.create(payload)
    message.success('Tạo thành công')
    await fetch()
  }

  const update = async (id, payload) => {
    await apiFns.update(id, payload)
    message.success('Cập nhật thành công')
    await fetch()
  }

  const remove = async (id) => {
    await apiFns.remove(id)
    message.success('Xóa thành công')
    await fetch()
  }

  const handleSearch = (q) => { setSearch(q); setPage(1) }

  return {
    data, meta, page, setPage,
    search, handleSearch,
    loading, create, update, remove, refresh: fetch,
  }
}
