import React from 'react'
import { useSearchParams } from 'react-router-dom'

const SortOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    searchParams.set("sortBy", sortBy)
    setSearchParams(searchParams)
  }

  return (
    <div className='mb-4 flex items-center justify-end'>
      <select id='sort' 
      className='border p-2 rounded-md focus:outline-none'
      onChange={handleSortChange}
      value={searchParams.get("sortBy") || ""} >
        <option value="">Mặc định</option>
        <option value="priceAsc">Giá: Thấp đến Cao</option>
        <option value="priceDesc">Giá: Cao đến thấp</option>
        <option value="popular">Phổ biến</option>
      </select>
    </div>
  )
}

export default SortOptions