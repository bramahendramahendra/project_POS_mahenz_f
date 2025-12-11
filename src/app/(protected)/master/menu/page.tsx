'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FormInput, FormTextarea } from '@/components/FormInput';

interface Menu {
  id: number;
  nama_menu: string;
  icon: string;
  path: string;
  urutan: number;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
  parent?: {
    id: number;
    nama_menu: string;
  };
}

interface Meta {
  page: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface MenusResponse {
  data: Menu[];
  meta: Meta;
}

interface ValidationErrors {
  nama_menu: string;
  icon: string;
  path: string;
  urutan: string;
}

export default function MasterMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [parentMenus, setParentMenus] = useState<Menu[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    icon: '',
    path: '',
    urutan: 0,
    parent_id: null as number | null,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    nama_menu: '',
    icon: '',
    path: '',
    urutan: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchMenus();
    fetchParentMenus();
  }, [currentPage, perPage, searchQuery]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get<MenusResponse>('/menu', {
        params: {
          page: currentPage,
          limit: perPage,
          search: searchQuery,
        },
      });
      setMenus(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setError('Gagal memuat data menu');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentMenus = async () => {
    try {
      const response = await api.get<Menu[]>('/menu/tree');
      setParentMenus(response.data);
    } catch (error) {
      console.error('Error fetching parent menus:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      nama_menu: '',
      icon: '',
      path: '',
      urutan: '',
    };
    let isValid = true;

    // Validasi nama menu
    if (!formData.nama_menu.trim()) {
      errors.nama_menu = 'Nama menu tidak boleh kosong';
      isValid = false;
    } else if (formData.nama_menu.length > 100) {
      errors.nama_menu = 'Nama menu maksimal 100 karakter';
      isValid = false;
    }

    // Validasi icon (opsional, tapi jika diisi harus valid)
    if (formData.icon && formData.icon.length > 100) {
      errors.icon = 'Icon SVG path maksimal 100 karakter';
      isValid = false;
    }

    // Validasi path (opsional, tapi jika diisi harus valid)
    if (formData.path && formData.path.length > 200) {
      errors.path = 'Path maksimal 200 karakter';
      isValid = false;
    }

    // Validasi urutan
    if (formData.urutan < 0) {
      errors.urutan = 'Urutan tidak boleh negatif';
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

  const handleOpenModal = (mode: 'create' | 'edit', menu?: Menu) => {
    setModalMode(mode);
    setSelectedMenu(menu || null);
    setFormData({
      nama_menu: menu?.nama_menu || '',
      icon: menu?.icon || '',
      path: menu?.path || '',
      urutan: menu?.urutan || 0,
      parent_id: menu?.parent_id || null,
      is_active: menu?.is_active !== undefined ? menu.is_active : true,
    });
    setShowModal(true);
    setError('');
    setValidationErrors({
      nama_menu: '',
      icon: '',
      path: '',
      urutan: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMenu(null);
    setFormData({ 
      nama_menu: '', 
      icon: '', 
      path: '', 
      urutan: 0, 
      parent_id: null,
      is_active: true 
    });
    setError('');
    setValidationErrors({
      nama_menu: '',
      icon: '',
      path: '',
      urutan: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        await api.post('/menu', formData);
        setSuccess('Menu berhasil ditambahkan');
      } else if (selectedMenu) {
        await api.patch(`/menu/${selectedMenu.id}`, formData);
        setSuccess('Menu berhasil diupdate');
      }
      
      handleCloseModal();
      fetchMenus();
      fetchParentMenus();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
      setError(errorMessage);
      
      // Handle validation errors dari backend
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${menu.nama_menu}"?`)) {
      return;
    }

    try {
      await api.delete(`/menu/${menu.id}`);
      setSuccess('Menu berhasil dihapus');
      fetchMenus();
      fetchParentMenus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus menu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getPaginationRange = () => {
    const range = [];
    const delta = 2;
    
    for (let i = 1; i <= meta.totalPages; i++) {
      if (
        i === 1 ||
        i === meta.totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
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
        <h2 className="text-3xl font-bold text-white mb-2">Master Menu 📋</h2>
        <p className="text-purple-200">Kelola menu dan navigasi aplikasi</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm animate-slideIn">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-200 text-sm">{success}</p>
          </div>
        </div>
      )}
      
      {error && !showModal && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm animate-slideIn">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Daftar Menu</h3>
            <p className="text-purple-300 text-sm">
              Total {meta.totalRecords} menu terdaftar
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
              <span>Tambah Menu</span>
            </span>
          </button>
        </div>

        {/* Search Bar & Per Page Selector */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama menu atau path..."
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

          {/* Per Page Selector */}
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

            {showPerPageDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPerPageDropdown(false)}
                />
                
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
        ) : menus.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-purple-300 font-medium">
              {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data menu'}
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
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Nama Menu</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Path</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Parent</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Urutan</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu, index) => (
                    <tr key={menu.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {menu.icon && (
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                            </svg>
                          )}
                          <span className="text-white font-medium">{menu.nama_menu}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {menu.path || '-'}
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {menu.parent ? (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {menu.parent.nama_menu}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            Main Menu
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-purple-200">
                        {menu.urutan}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          menu.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {menu.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal('edit', menu)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(menu)}
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
              <div className="text-purple-300 text-sm">
                Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, meta.totalRecords)} dari {meta.totalRecords} data
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

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
          {/* Modal Container */}
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-purple-900/50 border-b border-white/10 px-8 py-6 rounded-t-2xl backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {modalMode === 'create' ? 'Tambah Menu Baru' : 'Edit Menu'}
                  </h3>
                  <p className="text-purple-300 text-sm mt-1">
                    {modalMode === 'create' 
                      ? 'Isi formulir di bawah untuk menambah menu baru' 
                      : 'Perbarui informasi menu Anda'}
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

              <form onSubmit={handleSubmit} className="space-y-6" id="menu-form">
                {/* Nama Menu */}
                <FormInput
                  label="Nama Menu"
                  value={formData.nama_menu}
                  onChange={(e) => {
                    setFormData({ ...formData, nama_menu: e.target.value });
                    if (validationErrors.nama_menu) {
                      setValidationErrors({ ...validationErrors, nama_menu: '' });
                    }
                  }}
                  placeholder="Dashboard, Master, dll"
                  required
                  maxLength={100}
                  error={validationErrors.nama_menu}
                  icon={
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  }
                />

                {/* Icon SVG Path */}
                <FormTextarea
                  label="Icon SVG Path"
                  value={formData.icon}
                  onChange={(e) => {
                    setFormData({ ...formData, icon: e.target.value });
                    if (validationErrors.icon) {
                      setValidationErrors({ ...validationErrors, icon: '' });
                    }
                  }}
                  placeholder="M3 12l2-2m0 0l7-7..."
                  rows={2}
                  maxLength={100}
                  error={validationErrors.icon}
                  helperText="SVG path untuk icon menu (opsional)"
                />

                {/* Path/Route */}
                <FormInput
                  label="Path/Route"
                  value={formData.path}
                  onChange={(e) => {
                    setFormData({ ...formData, path: e.target.value });
                    if (validationErrors.path) {
                      setValidationErrors({ ...validationErrors, path: '' });
                    }
                  }}
                  placeholder="/dashboard, /master/menu, dll"
                  maxLength={200}
                  error={validationErrors.path}
                  helperText="Kosongkan jika menu parent tanpa route"
                  icon={
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />

                {/* Parent Menu & Urutan - Grid 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parent Menu */}
                  <div className="space-y-2">
                    <label className="block text-purple-200 text-sm font-semibold mb-2">
                      Parent Menu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <select
                        value={formData.parent_id || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          parent_id: e.target.value ? Number(e.target.value) : null 
                        })}
                        className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                        style={{
                          colorScheme: 'dark'
                        }}
                      >
                        <option value="" className="bg-slate-800 text-white py-2">-- Tidak Ada Parent (Main Menu) --</option>
                        {parentMenus.map((menu) => (
                          <option key={menu.id} value={menu.id} className="bg-slate-800 text-white py-2">
                            {menu.nama_menu}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Urutan */}
                  <FormInput
                    label="Urutan"
                    type="text"
                    value={formData.urutan.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData({ ...formData, urutan: value === '' ? 0 : Number(value) });
                        if (validationErrors.urutan) {
                          setValidationErrors({ ...validationErrors, urutan: '' });
                        }
                      }
                    }}
                    placeholder="0"
                    required
                    error={validationErrors.urutan}
                    icon={
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    }
                  />
                </div>

                {/* Menu Aktif - Checkbox */}
                <div className="space-y-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-6 h-6 rounded-lg border-2 border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-purple-200 font-semibold group-hover:text-white transition-colors">
                          Menu Aktif
                        </span>
                        <p className="text-xs text-purple-400/70 mt-0.5">
                          Centang untuk mengaktifkan menu ini di sidebar
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        formData.is_active 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {formData.is_active ? 'Aktif' : 'Nonaktif'}
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
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
                  form="menu-form"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{modalMode === 'create' ? 'Tambah Menu' : 'Update Menu'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
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

        /* Select Dropdown Options - Fix all backgrounds */
        select {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        select option {
          background-color: #1e293b !important;
          color: white !important;
          padding: 8px 12px !important;
        }
        
        /* Fix untuk selected option */
        select option:checked {
          background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%) !important;
          color: white !important;
          font-weight: 600 !important;
        }

        /* Fix untuk hover state */
        select option:hover {
          background-color: #334155 !important;
          color: white !important;
        }

        /* Fix untuk focus state */
        select option:focus {
          background-color: #475569 !important;
          color: white !important;
        }

        /* Alternative styling untuk browser yang tidak support */
        select:focus option:checked {
          background: #7c3aed !important;
          color: white !important;
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