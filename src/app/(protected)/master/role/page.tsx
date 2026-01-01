'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

// Import types
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/types/models';
import type { 
  RolesResponse, 
  PaginationMeta, 
  PaginationQuery 
} from '@/types/api';
import type { RoleValidationErrors } from '@/types/forms';

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

export default function MasterRolePage() {
  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleDto>({
    nama_role: '',
    deskripsi: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<RoleValidationErrors>({
    nama_role: '',
    deskripsi: '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [showPerPageDropdown, setShowPerPageDropdown] = useState<boolean>(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data
  useEffect(() => {
    fetchRoles();
  }, [currentPage, perPage, searchQuery]);

  const fetchRoles = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const params: PaginationQuery = {
        page: currentPage,
        limit: perPage,
        search: searchQuery,
      };
      
      const response = await api.get<RolesResponse>('/roles', { params });
      
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

  const validateForm = (): boolean => {
    const errors: RoleValidationErrors = {
      nama_role: '',
      deskripsi: '',
    };
    let isValid = true;

    if (!formData.nama_role.trim()) {
      errors.nama_role = 'Nama role tidak boleh kosong';
      isValid = false;
    } else if (formData.nama_role.length > 50) {
      errors.nama_role = 'Nama role maksimal 50 karakter';
      isValid = false;
    }

    if (formData.deskripsi && formData.deskripsi.length > 200) {
      errors.deskripsi = 'Deskripsi maksimal 200 karakter';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number): void => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleOpenModal = (mode: 'create' | 'edit', role?: Role): void => {
    setModalMode(mode);
    setSelectedRole(role || null);
    setFormData({
      nama_role: role?.nama_role || '',
      deskripsi: role?.deskripsi || '',
    });
    setShowModal(true);
    setError('');
    setValidationErrors({
      nama_role: '',
      deskripsi: '',
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedRole(null);
    setFormData({ 
      nama_role: '', 
      deskripsi: '' 
    });
    setError('');
    setValidationErrors({
      nama_role: '',
      deskripsi: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post<Role>('/roles', formData as CreateRoleDto);
        setSuccess('Role berhasil ditambahkan');
      } else if (selectedRole) {
        await api.patch<Role>(`/roles/${selectedRole.id}`, formData as UpdateRoleDto);
        setSuccess('Role berhasil diupdate');
      }
      
      handleCloseModal();
      fetchRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleDelete = async (role: Role): Promise<void> => {
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
        title="Master Role"
        subtitle="Kelola role dan permission pengguna"
        icon="👥"
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
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClearSearch}
            placeholder="Cari nama role atau deskripsi..."
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
        ) : roles.length === 0 ? (
          <EmptyState
            message={searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data role'}
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
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Nama Role</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Deskripsi</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Tanggal Dibuat</th>
                    <th className="text-left py-4 px-4 text-purple-300 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role: Role, index: number) => (
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
                        {formatDate(role.created_at)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar">
              {error && (
                <AlertMessage type="error" message={error} />
              )}

              <form onSubmit={handleSubmit} className="space-y-6" id="role-form">
                <FormInput
                  label="Nama Role"
                  value={formData.nama_role}
                  onChange={(e) => {
                    setFormData({ ...formData, nama_role: e.target.value });
                    if (validationErrors.nama_role) {
                      setValidationErrors({ ...validationErrors, nama_role: '' });
                    }
                  }}
                  placeholder="Contoh: Manager, Supervisor, dll"
                  required
                  maxLength={50}
                  error={validationErrors.nama_role}
                  icon={
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />

                <FormTextarea
                  label="Deskripsi Role"
                  value={formData.deskripsi || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, deskripsi: e.target.value });
                    if (validationErrors.deskripsi) {
                      setValidationErrors({ ...validationErrors, deskripsi: '' });
                    }
                  }}
                  placeholder="Jelaskan peran dan tanggung jawab role ini..."
                  rows={4}
                  maxLength={200}
                  error={validationErrors.deskripsi}
                />
              </form>
            </div>

            {/* Modal Footer */}
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
                  <span>{modalMode === 'create' ? 'Tambah Role' : 'Update Role'}</span>
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