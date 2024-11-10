'use client'

import { useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { TextInput, RadioInput, SelectInput } from './CustomInputs';


interface FormData {
    fName: string
    lName: string
    gender: string
    zip: string
    city: string
    latitude: string
    longitude: string
    state: string
    county: string
    username: string
    password: string
    retypePassword: string
}

interface FormErrors {
    username?: string
    password?: string
    retypePassword?: string
}

export default function SignUpForm() {
    const [formData, setFormData] = useState<FormData>({
        fName: '',
        lName: '',
        gender: '',
        zip: '',
        city: '',
        latitude: '',
        longitude: '',
        state: '',
        county: '',
        username: '',
        password: '',
        retypePassword: ''
    })
    const [counties, setCounties] = useState<string[]>([])
    const [usernameError, setUsernameError] = useState<string>('')
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const router = useRouter()

    const handleChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'zip') {
            await fetchCityInfo(value)
        } else if (name === 'state') {
            await fetchCounties(value)
        } else if (name === 'username') {
            await checkUsername(value)
        }
    }

    const fetchCityInfo = async (zipCode: string) => {
        try {
            const response = await fetch(`https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`)
            const data = await response.json()
            if (data.city) {
                setFormData(prev => ({
                    ...prev,
                    city: data.city,
                    latitude: data.latitude,
                    longitude: data.longitude
                }))
            }
        } catch (error) {
            console.error('Error fetching city info:', error)
        }
    }

    const fetchCounties = async (state: string) => {
        try {
            const response = await fetch(`https://csumb.space/api/countyListAPI.php?state=${state}`)
            const data = await response.json()
            setCounties(data.map((item: { county: string }) => item.county))
        } catch (error) {
            console.error('Error fetching counties:', error)
        }
    }

    const checkUsername = async (username: string) => {
        try {
            const response = await fetch(`https://csumb.space/api/usernamesAPI.php?username=${username}`)
            const data = await response.json()
            setUsernameError(data.available ? '' : 'Username is already taken')
        } catch (error) {
            console.error('Error checking username:', error)
        }
    }

    const validateForm = () => {
        const errors: FormErrors = {}
        if (!formData.username) errors.username = 'Username is required'
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
        if (formData.password !== formData.retypePassword) errors.retypePassword = 'Passwords do not match'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm() && !usernameError) {
            router.push('/welcome')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-6 py-4">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

            <div>
                <label htmlFor="fName" className="block text-sm font-medium text-gray-700">First Name:</label>
                <TextInput type="text" id="fName" name="fName" value={formData.fName} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="lName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                <TextInput type="text" id="lName" name="lName" value={formData.lName} onChange={handleChange} />
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700">Gender:</span>
                <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                        <RadioInput type="radio" name="gender" value="m" checked={formData.gender === 'm'} onChange={handleChange} />
                        <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                        <RadioInput type="radio" name="gender" value="f" checked={formData.gender === 'f'} onChange={handleChange} />
                        <span className="ml-2">Female</span>
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code:</label>
                <TextInput type="text" id="zip" name="zip" value={formData.zip} onChange={handleChange} />
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700">City: {formData.city}</span>
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700">Latitude: {formData.latitude}</span>
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700">Longitude: {formData.longitude}</span>
            </div>

            <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State:</label>
                <SelectInput id="state" name="state" value={formData.state} onChange={handleChange}>
                    <option value="">Select One</option>
                    <option value="ca">California</option>
                    <option value="ny">New York</option>
                    <option value="tx">Texas</option>
                </SelectInput>
            </div>

            <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">Select a County:</label>
                <SelectInput id="county" name="county" value={formData.county} onChange={handleChange}>
                    <option value="">Select One</option>
                    {counties.map(county => (
                        <option key={county} value={county}>{county}</option>
                    ))}
                </SelectInput>
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Desired Username:</label>
                <TextInput type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
                {usernameError && <span className="text-red-500 text-sm">{usernameError}</span>}
                {formErrors.username && <span className="text-red-500 text-sm">{formErrors.username}</span>}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                <TextInput type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                {formErrors.password && <span className="text-red-500 text-sm">{formErrors.password}</span>}
            </div>

            <div>
                <label htmlFor="retypePassword" className="block text-sm font-medium text-gray-700">Type Password Again:</label>
                <TextInput type="password" id="retypePassword" name="retypePassword" value={formData.retypePassword} onChange={handleChange} />
                {formErrors.retypePassword && <span className="text-red-500 text-sm">{formErrors.retypePassword}</span>}
            </div>

            <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign up!
                </button>
            </div>
        </form>
    );
}