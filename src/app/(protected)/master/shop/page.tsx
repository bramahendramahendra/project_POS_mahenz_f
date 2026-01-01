'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

// Import types
import type { Shop, CreateShopDto, UpdateShopDto } from '@/types/models';
import type { 
  ShopsResponse, 
  PaginationMeta, 
  PaginationQuery 
} from '@/types/api';
import type { ShopValidationErrors } from '@/types/forms';

// Import components
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { SearchBar } from '@/components/search/SearchBar';
import { PerPageSelector } from '@/components/search/PerPageSelector';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MasterShopPage() {
  // State
  const [shops, setShops] = useState<Shop[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<CreateShopDto>({
    nama_toko: '',
    deskripsi: '',
    nomor_telepon: '',
    nomor_whatsapp: '',
    alamat: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ShopValidationErrors>({
    nama_toko: '',
    deskripsi: '',
    nomor_telepon: '',
    nomor_whatsapp: '',
    alamat: '',
  });
  
  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

  // Debounce untuk auto-search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchShops();
  }, [currentPage, perPage, searchQuery]);

  const fetchShops = async (): Promise<void> => {
    try {
      setLoading(true);

      const params: PaginationQuery = {
        page: currentPage,
        limit: perPage,
        search: searchQuery,
      };

      const response = await api.get<ShopsResponse>('/shops', {params });

      setShops(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError('Gagal memuat data shops');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ShopValidationErrors = {
      nama_toko: '',
      deskripsi: '',
      nomor_telepon: '',
      nomor_whatsapp: '',
      alamat: '',
    };
    let isValid = true;

    if (!formData.nama_toko.trim()) {
      errors.nama_toko = 'Nama toko tidak boleh kosong';
      isValid = false;
    } else if (formData.nama_toko.length > 50) {
      errors.nama_toko = 'Nama toko maksimal 50 karakter';
      isValid = false;
    }

    // Validasi deskripsi (opsional, tapi jika diisi harus valid)
    if (formData.deskripsi && formData.deskripsi.length > 200) {
      errors.deskripsi = 'Deskripsi maksimal 200 karakter';
      isValid = false;
    }

    // Validasi nomor telepon
    if (!formData.nomor_telepon.trim()) {
      errors.nomor_telepon = 'Nomor telepon tidak boleh kosong';
      isValid = false;
    } else if (formData.nomor_telepon.length > 20) {
      errors.nomor_telepon = 'Nomor telepon maksimal 20 karakter';
      isValid = false;
    }

    // Validasi nomor whatsapp
    if (!formData.nomor_whatsapp.trim()) {
      errors.nomor_whatsapp = 'Nomor whatsapp tidak boleh kosong';
      isValid = false;
    } else if (formData.nomor_whatsapp.length > 20) {
      errors.nomor_whatsapp = 'Nomor whatsapp maksimal 20 karakter';
      isValid = false;
    }

    // Validasi alamat (opsional, tapi jika diisi harus valid)
    if (formData.alamat && formData.alamat.length > 200) {
      errors.alamat = 'Alamat maksimal 200 karakter';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    setShowPerPageDropdown(false);
  };

  const handleOpenModal = (mode: 'create' | 'edit', shop?: Shop) => {
    setModalMode(mode);
    setSelectedShop(shop || null);
    setFormData({
      nama_toko: shop?.nama_toko || '',
      deskripsi: shop?.deskripsi || '',
      nomor_telepon: shop?.nomor_telepon || '',
      nomor_whatsapp: shop?.nomor_whatsapp || '',
      alamat: shop?.alamat || '',
    });
    setShowModal(true);
    setError('');
    setValidationErrors({
      nama_toko: '',
      deskripsi: '',
      nomor_telepon: '',
      nomor_whatsapp: '',
      alamat: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShop(null);
    setFormData({ 
      nama_toko: '', 
      deskripsi: '', 
      nomor_telepon: '', 
      nomor_whatsapp: '', 
      alamat: '', 
    });
    setError('');
    setValidationErrors({
      nama_toko: '', 
      deskripsi: '', 
      nomor_telepon: '', 
      nomor_whatsapp: '', 
      alamat: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi form
    if (!validateForm()) {
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/shops', formData);
        await api.post<Shop>('/shops', formData as CreateShopDto);
        setSuccess('Toko berhasil ditambahkan');
      } else if (selectedShop) {
        await api.patch<Shop>(`/shops/${selectedShop.id}`, formData as UpdateShopDto);
        setSuccess('Toko berhasil diupdate');
      }
      
      handleCloseModal();
      fetchShops();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
      setError(errorMessage);

      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleDelete = async (shop: Shop) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus toko "${shop.nama_toko}"?`)) {
      return;
    }

    try {
      await api.delete(`/shops/${shop.id}`);
      setSuccess('Shop berhasil dihapus');
      fetchShops();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus shop');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <PageHeader 
        title="Master Toko"
        subtitle="Kelola toko dan permission pengguna"
        icon="🏪"
      />

      {/* Alert Messages */}
      {success && (
        <AlertMessage 
          type="success" 
          message={success}
          onClose={() => setSuccess('')}
        />
      )}
      
      {error && !showModal && (
        <AlertMessage 
          type="error" 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Daftar Toko</h3>
            <p className="text-purple-300 text-sm">
              Total {meta.totalRecords} toko terdaftar
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal('create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Tambah Shop</span>
            </span>
          </button>
        </div>

        {/* Search Bar & Per Page Selector */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClearSearch}
            placeholder="Cari nama shop atau deskripsi..."
            resultText={searchQuery ? `Hasil pencarian untuk: "${searchQuery}"` : undefined}
          />

          <PerPageSelector
            value={perPage}
            onChange={handlePerPageChange}
            isOpen={showPerPageDropdown}
            onToggle={() => setShowPerPageDropdown(!showPerPageDropdown)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : shops.length === 0 ? (
          <EmptyState
            message={searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data toko'}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">No</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Nama Toko</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Deskripsi</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Tanggal Dibuat</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop: Shop, index: number) => (
                    <tr key={shop.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                          {shop.nama_toko}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {shop.deskripsi || '-'}
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {formatDate(shop.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal('edit', shop)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(shop)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                            title="Hapus"
                          >
                            <svg className="w-5 h-5 text-red-400 group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              totalRecords={meta.totalRecords}
              perPage={perPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modal dengan Scroll */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-purple-900/50 border-b border-white/10 px-8 py-6 rounded-t-2xl backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {modalMode === 'create' ? 'Tambah Shop Baru' : 'Edit Shop'}
                  </h3>
                  <p className="text-purple-300 text-sm mt-1">
                    {modalMode === 'create' 
                      ? 'Isi formulir di bawah untuk menambah toko baru' 
                      : 'Perbarui informasi toko Anda'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                  title="Tutup"
                >
                  <svg className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar">
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg animate-shake">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" id="shop-form">
                {/* Nama Toko */}
                <FormInput
                  label="Nama Toko"
                  value={formData.nama_toko}
                  onChange={(e) => {
                    setFormData({ ...formData, nama_toko: e.target.value });
                    if (validationErrors.nama_toko) {
                      setValidationErrors({ ...validationErrors, nama_toko: '' });
                    }
                  }}
                  placeholder="Contoh: Toko Buku Cahaya"
                  required
                  maxLength={50}
                  error={validationErrors.nama_toko}
                  icon={
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />

                {/* Deskripsi */}
                <FormTextarea
                  label="Deskripsi Toko"
                  value={formData.deskripsi}
                  onChange={(e) => {
                    setFormData({ ...formData, deskripsi: e.target.value });
                    if (validationErrors.deskripsi) {
                      setValidationErrors({ ...validationErrors, deskripsi: '' });
                    }
                  }}
                  placeholder="Jelaskan tentang toko Anda..."
                  rows={4}
                  maxLength={200}
                  error={validationErrors.deskripsi}
                />

                {/* Nomor Telepon & WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nomor Telepon */}
                  <FormInput
                    label="Nomor Telepon"
                    value={formData.nomor_telepon}
                    onChange={(e) => {
                      setFormData({ ...formData, nomor_telepon: e.target.value });
                      if (validationErrors.nomor_telepon) {
                        setValidationErrors({ ...validationErrors, nomor_telepon: '' });
                      }
                    }}
                    placeholder="Contoh: 08123456789"
                    required
                    maxLength={20}
                    error={validationErrors.nomor_telepon}
                    icon={
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />

                  {/* Nomor WhatsApp */}
                  <FormInput
                    label="Nomor WhatsApp"
                    value={formData.nomor_whatsapp}
                    onChange={(e) => {
                      setFormData({ ...formData, nomor_whatsapp: e.target.value });
                      if (validationErrors.nomor_whatsapp) {
                        setValidationErrors({ ...validationErrors, nomor_whatsapp: '' });
                      }
                    }}
                    placeholder="Contoh: 08123456789"
                    required
                    maxLength={20}
                    error={validationErrors.nomor_whatsapp}
                    icon={
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    }
                  />
                </div>

                {/* Alamat */}
                <FormTextarea
                  label="Alamat Toko"
                  value={formData.alamat}
                  onChange={(e) => {
                    setFormData({ ...formData, alamat: e.target.value });
                    if (validationErrors.alamat) {
                      setValidationErrors({ ...validationErrors, alamat: '' });
                    }
                  }}
                  placeholder="Contoh : Jl. Contoh No. 123, Kota..."
                  rows={3}
                  maxLength={200}
                  error={validationErrors.alamat}
                />
              </form>
            </div>

            {/* Modal Footer - Fixed di bawah */}
            <div className="sticky bottom-0 bg-gradient-to-r from-slate-900 to-purple-900/50 border-t border-white/10 px-8 py-6 rounded-b-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  form="shop-form"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{modalMode === 'create' ? 'Tambah Toko' : 'Update Toko'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a855f7, #60a5fa);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}