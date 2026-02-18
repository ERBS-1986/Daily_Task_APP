
import React from 'react';
import { X } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    className?: string;
    isLight?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = '', isLight }) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            className={`
        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
        bg-white border-black
        ${className}
      `}
        >
            {checked && <X className="w-4 h-4 text-black stroke-[4px]" />}
        </button>
    );
};

export default Checkbox;
