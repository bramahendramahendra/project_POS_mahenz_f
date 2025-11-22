'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Role {
  id: number;
  nama_role: string;
  deskripsi: string;
}

interface Menu {
  id: number;
  nama_menu: string;
  icon: string;
  path: string;
  urutan: number;
  parent_id: number | null;
  children?: Menu[];
}

interface RoleMenuAccess {
  role: Role;
  menuCount: number;
  menus: Menu[];
}

export default function MenuAccessPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menusTree, setMenusTree] = useState<Menu[]>([]);
  const [rolesWithMenus, setRolesWithMenus] = useState<RoleMenuAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRoles(),
        fetchMenusTree(),
        fetchRolesWithMenus(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles', {
        params: { page: 1, limit: 100 },
      });
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchMenusTree = async () => {
    try {
      const response = await api.get<Menu[]>('/menu/tree');
      setMenusTree(response.data);
    } catch (error) {
      console.error('Error fetching menus tree:', error);
    }
  };

  const fetchRolesWithMenus = async () => {
    try {
      const response = await api.get<RoleMenuAccess[]>('/menu-access/roles-menus');
      setRolesWithMenus(response.data);
    } catch (error) {
      console.error('Error fetching roles with menus:', error);
    }
  };

  const handleOpenModal = async (role: Role) => {
    try {
      setSelectedRole(role);
      
      // Fetch current menu access for this role
      const response = await api.get(`/menu-access/role/${role.id}`);
      const currentMenuIds = response.data.menuIds || [];
      
      setSelectedMenuIds(currentMenuIds);
      
      // Auto expand parent menus that have selected children
      const toExpand: number[] = [];
      menusTree.forEach(parent => {
        if (parent.children) {
          const hasSelectedChild = parent.children.some(child => 
            currentMenuIds.includes(child.id)
          );
          if (hasSelectedChild) {
            toExpand.push(parent.id);
          }
        }
      });
      setExpandedMenus(toExpand);
      
      setShowModal(true);
      setError('');
    } catch (error: any) {
      console.error('Error loading menu access:', error);
      setError(error.response?.data?.message || 'Gagal memuat data akses menu');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRole(null);
    setSelectedMenuIds([]);
    setExpandedMenus([]);
    setError('');
  };

  const toggleMenu = (menuId: number) => {
    setExpandedMenus(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  const handleMenuSelect = (menu: Menu) => {
    setSelectedMenuIds(prev => {
      if (prev.includes(menu.id)) {
        // Deselect - also deselect children if any
        let toRemove = [menu.id];
        if (menu.children) {
          toRemove = [...toRemove, ...menu.children.map(c => c.id)];
        }
        return prev.filter(id => !toRemove.includes(id));
      } else {
        // Select
        return [...prev, menu.id];
      }
    });
  };

  const handleParentSelect = (parent: Menu) => {
    const childIds = parent.children?.map(c => c.id) || [];
    const allIds = [parent.id, ...childIds];
    
    // Check if all are selected
    const allSelected = allIds.every(id => selectedMenuIds.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedMenuIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      // Select all
      setSelectedMenuIds(prev => {
        const newIds = [...prev];
        allIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedRole) return;

    if (selectedMenuIds.length === 0) {
      setError('Minimal pilih satu menu');
      return;
    }

    try {
      await api.post('/menu-access', {
        role_id: selectedRole.id,
        menu_ids: selectedMenuIds,
      });
      
      setSuccess(`Akses menu untuk role ${selectedRole.nama_role} berhasil disimpan`);
      handleCloseModal();
      fetchRolesWithMenus();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const renderMenuCheckbox = (menu: Menu, isChild: boolean = false) => {
    const isSelected = selectedMenuIds.includes(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.includes(menu.id);
    
    // For parent menu, check if all children are selected
    let isIndeterminate = false;
    if (hasChildren) {
      const childIds = menu.children!.map(c => c.id);
      const selectedChildCount = childIds.filter(id => selectedMenuIds.includes(id)).length;
      isIndeterminate = selectedChildCount > 0 && selectedChildCount < childIds.length;
    }

    return (
      <div key={menu.id} className={isChild ? 'ml-8' : ''}>
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isSelected ? 'bg-purple-500/20' : 'hover:bg-white/5'
        } transition-colors`}>
          {hasChildren && !isChild && (
            <button
              type="button"
              onClick={() => toggleMenu(menu.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <svg
                className={`w-4 h-4 text-purple-300 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {!hasChildren && isChild && (
            <div className="w-5" />
          )}

          <label className="flex items-center space-x-3 cursor-pointer flex-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => hasChildren && !isChild ? handleParentSelect(menu) : handleMenuSelect(menu)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              {isIndeterminate && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-0.5 bg-purple-400 rounded"></div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 flex-1">
              {menu.icon && (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                </svg>
              )}
              <span className="text-white font-medium">{menu.nama_menu}</span>
              {menu.path && (
                <span className="text-xs text-purple-400">({menu.path})</span>
              )}
            </div>
          </label>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {menu.children!.map(child => renderMenuCheckbox(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Menu Access 🔐</h2>
        <p className="text-purple-200">Kelola akses menu untuk setiap role</p>
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
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-1">Daftar Role & Menu Access</h3>
          <p className="text-purple-300 text-sm">
            Klik "Atur Menu" untuk mengatur akses menu per role
          </p>
        </div>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesWithMenus.map((item) => (
              <div
                key={item.role.id}
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {item.role.nama_role}
                    </h4>
                    <p className="text-sm text-purple-300">
                      {item.role.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {item.menuCount}
                    </span>
                  </div>
                </div>

                <div className="mb-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-purple-400 mb-2">Menu yang bisa diakses:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {item.menus.length === 0 ? (
                      <p className="text-sm text-purple-300/50 italic">
                        Belum ada menu
                      </p>
                    ) : (
                      item.menus.slice(0, 5).map((menu) => (
                        <div key={menu.id} className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm text-purple-200">{menu.nama_menu}</span>
                        </div>
                      ))
                    )}
                    {item.menus.length > 5 && (
                      <p className="text-xs text-purple-400 italic">
                        +{item.menus.length - 5} menu lainnya
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(item.role)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Atur Menu</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Atur Menu Access
                </h3>
                <p className="text-purple-300">
                  Role: <span className="font-semibold">{selectedRole.nama_role}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <strong>Tips:</strong> Centang parent menu untuk memilih semua submenu sekaligus.
                  Atau pilih submenu secara individual.
                </p>
              </div>

              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto pr-2">
                {menusTree.map(menu => renderMenuCheckbox(menu))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-sm text-purple-300">
                  <span className="font-semibold">{selectedMenuIds.length}</span> menu dipilih
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={selectedMenuIds.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}