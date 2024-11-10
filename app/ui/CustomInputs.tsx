import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: InputProps) {
    return (
        <input
            {...props}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
    );
}

export function RadioInput(props: InputProps) {
    return (
        <input
            {...props}
            className="form-radio"
        />
    );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function SelectInput(props: SelectProps) {
    return (
        <select
            {...props}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
    );
}