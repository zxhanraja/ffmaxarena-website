import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons/IconDefs';

interface CustomSelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    name?: string;
    error?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select an option', label, required, name, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <button
                type="button"
                name={name}
                id={name}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white/5 border rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-cyan-500'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`${selectedOption ? 'text-white' : 'text-gray-400'} truncate`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto animate-card-enter" role="listbox">
                    <ul>
                        {options.map(option => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`px-4 py-2 text-white cursor-pointer hover:bg-cyan-500/20 transition-colors duration-150 ${value === option.value ? 'bg-cyan-500/30 font-semibold' : ''}`}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;