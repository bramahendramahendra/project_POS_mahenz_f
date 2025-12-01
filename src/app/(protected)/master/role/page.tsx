'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Role {
  id: number;
  nama_role: string;
  deskripsi: string;
  created_at: string;
}

interface Meta {
  page: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface RolesResponse {
  data: Role[];
  meta: Meta;
}

export default function MasterRolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    nama_role: '',
    deskripsi: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
      setCurrentPage(1); // Reset ke halaman pertama saat search berubah
    }, 500); // Delay 500ms setelah user berhenti mengetik

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchRoles();
  }, [currentPage, perPage, searchQuery]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get<RolesResponse>('/roles', {
        params: {
          page: currentPage,
          limit: perPage,
          search: searchQuery,
        },
      });
      setRoles(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Gagal memuat data roles');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
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
    setCurrentPage(1); // Reset ke halaman pertama
    setShowPerPageDropdown(false); // Close dropdown
  };

  const handleOpenModal = (mode: 'create' | 'edit', role?: Role) => {
    setModalMode(mode);
    setSelectedRole(role || null);
    setFormData({
      nama_role: role?.nama_role || '',
      deskripsi: role?.deskripsi || '',
    });
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRole(null);
    setFormData({ nama_role: '', deskripsi: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await api.post('/roles', formData);
        setSuccess('Role berhasil ditambahkan');
      } else if (selectedRole) {
        await api.patch(`/roles/${selectedRole.id}`, formData);
        setSuccess('Role berhasil diupdate');
      }
      
      handleCloseModal();
      fetchRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.nama_role}"?`)) {
      return;
    }

    try {
      await api.delete(`/roles/${role.id}`);
      setSuccess('Role berhasil dihapus');
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus role');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Generate array untuk pagination buttons
  const getPaginationRange = () => {
    const range = [];
    const delta = 2; // Jumlah halaman yang ditampilkan di kiri dan kanan halaman aktif
    
    for (let i = 1; i <= meta.totalPages; i++) {
      if (
        i === 1 || // Halaman pertama
        i === meta.totalPages || // Halaman terakhir
        (i >= currentPage - delta && i <= currentPage + delta) // Halaman sekitar current page
      ) {
        range.push(i);
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        range.push('...');
      }
    }
    
    return range;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Master Role 👥</h2>
        <p className="text-purple-200">Kelola role dan permission pengguna</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm">
          <p className="text-green-200 text-sm">{success}</p>
        </div>
      )}
      
      {error && !showModal && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Daftar Role</h3>
            <p className="text-purple-300 text-sm">
              Total {meta.totalRecords} role terdaftar
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
              <span>Tambah Role</span>
            </span>
          </button>
        </div>

        {/* Search Bar & Per Page Selector */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Input - Auto Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama role atau deskripsi..."
                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs text-purple-300">
                Hasil pencarian untuk: <span className="font-semibold">"{searchQuery}"</span>
              </p>
            )}
          </div>

          {/* Per Page Selector - Custom 3D Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowPerPageDropdown(!showPerPageDropdown)}
              className="flex items-center space-x-3 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 rounded-xl px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <span className="text-purple-300 text-sm">Tampilkan:</span>
              <span className="text-white font-bold text-lg px-3 py-1 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30">
                {perPage}
              </span>
              <span className="text-purple-300 text-sm">data</span>
              <svg 
                className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${showPerPageDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Custom Dropdown Menu */}
            {showPerPageDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPerPageDropdown(false)}
                />
                
                {/* Dropdown Options */}
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-20 animate-slideDown">
                  <div className="p-2 space-y-1">
                    {[5, 10, 20, 50].map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePerPageChange(option)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                          perPage === option
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                            : 'text-purple-200 hover:bg-white/10 hover:text-white hover:scale-102'
                        }`}
                      >
                        <span className="flex items-center space-x-3">
                          <span className={`font-semibold text-lg ${
                            perPage === option ? 'text-white' : 'text-purple-400'
                          }`}>
                            {option}
                          </span>
                          <span className="text-sm opacity-80">data per halaman</span>
                        </span>
                        {perPage === option && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Decorative gradient line */}
                  <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-purple-300 font-medium">Loading...</span>
            </div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-purple-300 font-medium">
              {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data role'}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">No</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Nama Role</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Deskripsi</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Tanggal Dibuat</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, index) => (
                    <tr key={role.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                          {role.nama_role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {role.deskripsi || '-'}
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {new Date(role.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal('edit', role)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
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
            <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div className="text-purple-300 text-sm">
                Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, meta.totalRecords)} dari {meta.totalRecords} data
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {getPaginationRange().map((page, index) => (
                    page === '...' ? (
                      <span key={`dots-${index}`} className="px-3 py-2 text-purple-300">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal dengan Scroll */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          {/* Modal Container dengan max height */}
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">  
            
            {/* Modal Header - Fixed di atas */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-purple-900/50 border-b border-white/10 px-8 py-6 rounded-t-2xl backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {modalMode === 'create' ? 'Tambah Role Baru' : 'Edit Role'}
                  </h3>
                  <p className="text-purple-300 text-sm mt-1">
                    {modalMode === 'create' 
                      ? 'Isi formulir di bawah untuk menambah role baru' 
                      : 'Perbarui informasi role Anda'}
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

              <form onSubmit={handleSubmit} className="space-y-6" id="role-form">
                {/* Nama Role */}
                <div className="space-y-2">
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Nama Role <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.nama_role}
                      onChange={(e) => setFormData({ ...formData, nama_role: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Contoh: Manager, Supervisor, dll"
                      required
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-purple-400/70 ml-1">
                    Maksimal 50 karakter ({formData.nama_role.length}/50)
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Deskripsi Role
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Deskripsi role Anda..."
                      rows={4}
                      maxLength={200}
                    />
                  </div>
                  <p className="text-xs text-purple-400/70 ml-1">
                    Maksimal 200 karakter ({formData.deskripsi.length}/200)
                  </p>
                </div>
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
                  form="role-form"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {modalMode === 'create' ? 'Tambah Role' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add animation keyframes */}
      <style jsx>{`
        /* Custom Scrollbar */
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

        /* Animations */
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
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}