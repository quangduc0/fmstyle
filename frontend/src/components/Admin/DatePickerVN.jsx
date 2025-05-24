import React, { useEffect, useState, useRef } from 'react'

const DatePickerVN = ({ value, onChange, placeholder = "DD/MM/YYYY" }) => {
    const [displayValue, setDisplayValue] = useState(value || '');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const datePickerRef = useRef(null);
    const inputRef = useRef(null);
    
    useEffect(() => {
        setDisplayValue(value || '');
    }, [value]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const isValidDate = (dateString) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
        
        const [day, month, year] = dateString.split('/').map(Number);
        
        if (month < 1 || month > 12) return false;
        
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) return false;
        
        return true;
    };
    
    const toISOFormat = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };
    
    const toVNFormat = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);
        
        if (isValidDate(inputValue)) {
            const isoDate = toISOFormat(inputValue);
            onChange(isoDate);
        }
    };
    
    const handleDateSelect = (e) => {
        const isoDate = e.target.value;
        onChange(isoDate);
        setDisplayValue(toVNFormat(isoDate));
        setIsCalendarOpen(false);
    };
    
    const toggleCalendar = () => {
        setIsCalendarOpen(!isCalendarOpen);
    };
    
    const isoValue = displayValue && isValidDate(displayValue) 
        ? toISOFormat(displayValue) 
        : '';
    
    return (
        <div className="relative" ref={datePickerRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="border rounded-md p-2 pr-10 w-full"
                    onClick={() => setIsCalendarOpen(true)}
                />
                <div 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={toggleCalendar}
                >
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                    </svg>
                </div>
            </div>
            
            {isCalendarOpen && (
                <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md p-2 border border-gray-200">
                    <input
                        type="date"
                        value={isoValue}
                        onChange={handleDateSelect}
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}
        </div>
    );
};

export default DatePickerVN