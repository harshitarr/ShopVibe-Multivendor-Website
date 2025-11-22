'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {

const { getToken } = useAuth();   
const dispatch = useDispatch();

// Add debugging for Redux state
const addressState = useSelector(state => {
    console.log('Full Redux state:', state);
    console.log('Address state:', state.address);
    return state.address;
});

console.log('Current address state in component:', addressState);

const [address, setAddress] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
})

const handleAddressChange = (e) => {
    setAddress({
        ...address,
        [e.target.name]: e.target.value
    })
}

const handleSubmit = async (e) => {
    e.preventDefault()

    try {
        console.log('Starting address submission with data:', address);
        const token = await getToken();
        console.log('Token obtained, making API call...');
        
        const { data } = await axios.post('/api/address', address, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API response received:', data);
        
        if (!data.newAddress) {
            throw new Error('No address data returned from API');
        }

        console.log('About to dispatch addAddress with:', data.newAddress);
        dispatch(addAddress(data.newAddress));
        console.log('Address dispatched successfully');
        
        toast.success(data.message || 'Address added successfully');
        setShowAddressModal(false);

    } catch (error) {
        console.error('Full error details:', {
            error: error,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        toast.error(error.response?.data?.message || error.message || 'Failed to add address');
    }
}

return (
    <form onSubmit={e => { e.preventDefault(); toast.promise(handleSubmit(e), { loading: 'Adding Address...' }) }} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
        <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
            <h2 className="text-3xl ">Add New <span className="font-semibold">Address</span></h2>
            <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Enter your name" required />
            <input name="email" onChange={handleAddressChange} value={address.email} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="email" placeholder="Email address" required />
            <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Street" required />
            <div className="flex gap-4">
                <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="City" required />
                <input name="state" onChange={handleAddressChange} value={address.state} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="State" required />
            </div>
            <div className="flex gap-4">
                <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Zip code" required />
                <input name="country" onChange={handleAddressChange} value={address.country} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Country" required />
            </div>
            <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone" required />
            <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">SAVE ADDRESS</button>
        </div>
        <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
    </form>
)


}

export default AddressModal
