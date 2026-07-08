import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const VendorProfile = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    shopName: 'Tariq Road Gifts',
    ownerName: user?.name || 'Ahmed Ali',
    email: user?.email || 'vendor@tariqroadgifts.pk',
    phone: '+92 300 1234567',
    city: 'Karachi',
    address: 'Shop 42, Tariq Road Center',
    description: 'We specialize in customized premium gifts for all events.',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Store Profile</h2>

      <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6 pb-6 border-b border-[var(--color-border)]">
            <div className="h-24 w-24 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center border-2 border-[var(--color-primary)] overflow-hidden">
              <span className="text-3xl font-bold text-[var(--color-primary)]">{profile.shopName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{profile.shopName}</h3>
              <p className="text-[var(--color-text-secondary)]">Verified Vendor</p>
              <button type="button" className="mt-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium">Change Logo</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Shop Name</label>
              <input type="text" name="shopName" value={profile.shopName} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Owner Name</label>
              <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Email Address</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Phone Number</label>
              <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">City</label>
              <select name="city" value={profile.city} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none">
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Store Address</label>
              <input type="text" name="address" value={profile.address} onChange={handleChange} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Shop Description</label>
              <textarea name="description" value={profile.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none"></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfile;
