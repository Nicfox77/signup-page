'use client'

import {useState, useEffect, ChangeEvent} from 'react';
import {useRouter} from 'next/navigation';
import {TextInput, RadioInput, SelectInput} from './CustomInputs';

interface FormData {
    fName: string;
    lName: string;
    gender: string;
    zip: string;
    city: string;
    latitude: string;
    longitude: string;
    state: string;
    county: string;
    username: string;
    password: string;
    retypePassword: string;
}

interface FormErrors {
    zip?: string;
    username?: string;
    password?: string;
    retypePassword?: string;
}

interface State {
    id: string;
    state: string;
    usps: string;
    ap: string;
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
    });
    const [states, setStates] = useState<State[]>([]);
    const [counties, setCounties] = useState<string[]>([]);
    const [usernameError, setUsernameError] = useState<string>('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [suggestedPassword, setSuggestedPassword] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch('https://csumb.space/api/allStatesAPI.php');
                const data = await response.json();
                setStates(data);
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };

        fetchStates();
    }, []);

    const handleChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

        if (name === 'zip') {
            await fetchCityInfo(value);
        } else if (name === 'state') {
            await fetchCounties(value);
        } else if (name === 'username') {
            await checkUsername(value);
        }
    };

    const fetchCityInfo = async (zipCode: string) => {
        if (!zipCode) {
            setFormErrors(prev => ({...prev, zip: 'Zip code not found'}));
            return;
        }

        try {
            const response = await fetch(`https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`);
            const data = await response.json();
            if (data.city) {
                setFormData(prev => ({
                    ...prev,
                    city: data.city,
                    latitude: data.latitude,
                    longitude: data.longitude
                }));
                setFormErrors(prev => ({...prev, zip: ''}));
            } else {
                setFormErrors(prev => ({...prev, zip: 'Zip code not found'}));
            }
        } catch (error) {
            console.error('Error fetching city info:', error);
            setFormErrors(prev => ({...prev, zip: 'Error fetching city info'}));
        }
    };

    const fetchCounties = async (state: string) => {
        try {
            const response = await fetch(`https://csumb.space/api/countyListAPI.php?state=${state}`);
            const data = await response.json();
            setCounties(data.map((item: { county: string }) => item.county));
        } catch (error) {
            console.error('Error fetching counties:', error);
        }
    };

    const checkUsername = async (username: string) => {
        try {
            const response = await fetch(`https://csumb.space/api/usernamesAPI.php?username=${username}`);
            const data = await response.json();
            if (data.available) {
                setUsernameError('');
                setFormErrors(prev => ({...prev, username: 'Username is available'}));
            } else {
                setUsernameError('Username is already taken');
                setFormErrors(prev => ({...prev, username: ''}));
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    };

    const fetchSuggestedPassword = async () => {
        try {
            const response = await fetch('https://csumb.space/api/suggestedPassword.php?length=8');
            const data = await response.json();
            setSuggestedPassword(data.password);
        } catch (error) {
            console.error('Error fetching suggested password:', error);
        }
    };

    const validateForm = () => {
        const errors: FormErrors = {};
        if (!formData.username) errors.username = 'Username is required';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.retypePassword) errors.retypePassword = 'Passwords do not match';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && !usernameError) {
            router.push('/welcome');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-6 py-4">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

            <div>
                <label htmlFor="fName" className="block text-sm font-medium text-gray-700">First Name:</label>
                <TextInput type="text" id="fName" name="fName" value={formData.fName} onChange={handleChange}/>
            </div>

            <div>
                <label htmlFor="lName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                <TextInput type="text" id="lName" name="lName" value={formData.lName} onChange={handleChange}/>
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700">Gender:</span>
                <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                        <RadioInput type="radio" name="gender" value="m" checked={formData.gender === 'm'}
                                    onChange={handleChange}/>
                        <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                        <RadioInput type="radio" name="gender" value="f" checked={formData.gender === 'f'}
                                    onChange={handleChange}/>
                        <span className="ml-2">Female</span>
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code:</label>
                <TextInput type="text" id="zip" name="zip" value={formData.zip} onChange={handleChange}/>
                {formErrors.zip && <span className="text-red-500 text-sm">{formErrors.zip}</span>}
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
                    {states.map(state => (
                        <option key={state.id} value={state.usps}>{state.state}</option>
                    ))}
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
                <TextInput type="text" id="username" name="username" value={formData.username} onChange={handleChange}/>
                {usernameError && <span className="text-red-500 text-sm">{usernameError}</span>}
                {formErrors.username && (
                    <div className={formErrors.username === 'Username is available' ? 'text-green-500' : 'text-red-500'}
                         text-sm>
                        {formErrors.username}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                <TextInput type="password" id="password" name="password" value={formData.password}
                           onChange={handleChange} onClick={fetchSuggestedPassword}/>
                {formErrors.password && <div className="text-red-500 text-sm">{formErrors.password}</div>}
                {suggestedPassword &&
                    <div className="text-green-500 text-sm">Suggested Password: {suggestedPassword}</div>}
            </div>

            <div>
                <label htmlFor="retypePassword" className="block text-sm font-medium text-gray-700">Type Password
                    Again:</label>
                <TextInput type="password" id="retypePassword" name="retypePassword" value={formData.retypePassword}
                           onChange={handleChange}/>
                {formErrors.retypePassword && <span className="text-red-500 text-sm">{formErrors.retypePassword}</span>}
            </div>

            <div>
                <button type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign up!
                </button>
            </div>
        </form>
    );
}