import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatter } from '../../utils/fomater';

const FilterSideBar = () => {
    const [searchParam, setSearchParam] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: "",
        gender: "",
        color: "",
        size: [],
        material: [],
        brand: [],
        minPrice: 0,
        maxPrice: 10000000,
    });

    const [priceRange, setPriceRange] = useState([0, 10000000]);

    const categories = ["Áo", "Quần & Váy"];

    const colors = [
        "Red",
        "Blue", 
        "Black", 
        "Green", 
        "Yellow", 
        "Gray", 
        "White", 
        "Pink", 
        "Beige", 
        "Navy",
    ];
            
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
    
    const materials = [
        "Cotton (Vải bông)",
        "Wool (Len)",
        "Denim (Vải bò)",
        "Polyester (Sợi tổng hợp)",
        "Silk (Lụa)",
        "Linen (Vải lanh)",
        "Viscose (Vải nhân tạo mềm mịn)",
        "Fleece (Vải nỉ ấm)"
    ];

    const brands = [
        "Coolmate",
        "YODY",
        "Canifa",
        "Routine",
        "CELEB Store",
        "Hades Studio",
        "TheBlueTshirt",
        "SIXDO",
    ];

    const genders = ["Nam", "Nữ"];

    useEffect(() => {
        const params = Object.fromEntries([...searchParam]);
        setFilters({
            category: params.category || "",
            gender: params.gender || "",
            color: params.color || "",
            size: params.size ? params.size.split(",") : [],
            material: params.material ? params.material.split(",") : [],
            brand: params.brand ? params.brand.split(",") : [],
            minPrice: params.minPrice || 0,
            maxPrice: params.maxPrice || 10000000,
        });
        setPriceRange([0, params.maxPrice || 10000000]);
    }, [searchParam]);

    const handleFilterChange = (e) => {
        const {name, value, checked, type} = e.target;
        let newFilters = { ...filters};

        if(type === "checkbox"){
            if(checked){
                newFilters[name] = [...(newFilters[name] || []), value]; 
            } else{
                newFilters[name] = newFilters[name].filter((item) => item !== value);
            }
        } else{
            newFilters[name] = value;
        }
        setFilters(newFilters);
        updateURL(newFilters);
    }

    const updateURL = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach((key) => {
            if(Array.isArray(newFilters[key]) && newFilters[key].length > 0){
                params.append(key, newFilters[key].join(","));
            } else if(newFilters[key]){
                params.append(key, newFilters[key]);
            }
        });
        setSearchParam(params);
        navigate(`?${params.toString()}`);
    }

    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setPriceRange([0, newPrice])
        const newFilters = {...filters, minPrice: 0, maxPrice: newPrice};
        setFilters(filters);
        updateURL(newFilters);
    }

  return (
    <div className='p-4'>
        <h3 className='text-xl font-medium text-gray-800 mb-4'>Lọc sản phẩm</h3>
        
        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Danh mục</label>
            {categories.map((category) => (
                <div key={category} className='flex items-center mb-1'>
                    <input type="radio" 
                    name='category'
                    value={category}
                    onChange={handleFilterChange}
                    checked={filters.category === category}
                    className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300' />
                    <span className='text-gray-700'>{category}</span>
                </div>
            ))}
        </div>

        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Giới tính</label>
            {genders.map((gender) => (
                <div key={gender} className='flex items-center mb-1'>
                    <input type="radio" 
                    name='gender'
                    value={gender}
                    onChange={handleFilterChange}
                    checked={filters.gender === gender}
                    className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300' />
                    <span className='text-gray-700'>{gender}</span>
                </div>
            ))}
        </div>

        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Màu sắc</label>
            <div className='flex flex-wrap gap-2'>
                {colors.map((color) => (
                    <button key={color}
                    name='color'
                    value={color}
                    onClick={handleFilterChange}
                    className={`w-8 h-8 rounded-full border border-gray-300 cursor-pointer transition hover:scale-105 
                        ${filters.color === color ? 'ring-2 ring-blue-500' : ''}`}
                    style={{backgroundColor: color.toLowerCase()}} >
                    </button>
                ))}
            </div>
        </div>

        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Kích cỡ</label>
            {sizes.map((size) => (
                <div key={size} className='flex items-center mb-1'>
                    <input type="checkbox" 
                    name='size'
                    value={size}
                    onChange={handleFilterChange}
                    checked={filters.size.includes(size)}
                    className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300' />
                    <span className='text-gray-700'>{size}</span>
                </div>
            ))}
        </div>

        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Chất liệu</label>
            {materials.map((material) => (
                <div key={material} className='flex items-center mb-1'>
                    <input type="checkbox" 
                    name='material'
                    value={material}
                    onChange={handleFilterChange}
                    checked={filters.material.includes(material)}
                    className='mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300' />
                    <span className='text-gray-700'>{material}</span>
                </div>
            ))}
        </div>
        
        <div className='mb-6'>
            <label className='block text-gray-600 font-medium mb-2'>Thương hiệu</label>
            {brands.map((brand) => (
                <div key={brand} className='flex items-center mb-1'>
                    <input type="checkbox" 
                    name='brand'
                    value={brand}
                    onChange={handleFilterChange}
                    checked={filters.brand.includes(brand)}
                    className='mr-2 h-4 w-4 text-blue-500 focus:ring-red-400 border-gray-300' />
                    <span className='text-gray-700'>{brand}</span>
                </div>
            ))}
        </div>

        <div className='mb-8'>
            <label className='block text-gray-600 font-medium mb-2' >Khoảng giá</label>
            <input type="range" 
            name='priceRange'
            min={0} max={10000000}
            value={priceRange[1]}
            onChange={handlePriceChange}
            className='w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer' />
            <div className='flex justify-between text-gray-600 mt-2'>
                <span>{formatter(0)}</span>
                <span>{formatter(priceRange[1])}</span>
            </div>
        </div>
    </div>

    
  )
}

export default FilterSideBar