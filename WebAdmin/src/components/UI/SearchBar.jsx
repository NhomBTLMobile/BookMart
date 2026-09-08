import { LuSearch } from 'react-icons/lu'

export default function SearchBar({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return (
    <div className="search-wrap">
      <LuSearch />
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
