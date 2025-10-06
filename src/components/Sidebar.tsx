'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Menu } from '@/types/menu';

export default function Sidebar() {
  const pathname = usePathname();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get<Menu[]>('/menu/my-menu');
      setMenus(response.data);
      
      // Auto expand menu yang aktif
      response.data.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          menu.children.forEach(child => {
            if (pathname === child.path) {
              setExpandedMenus(prev => [...prev, menu.id]);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
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

  const renderIcon = (iconPath: string) => {
    if (!iconPath) return null;
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
    );
  };

  const renderMenuItem = (menu: Menu) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.includes(menu.id);
    const isActive = pathname === menu.path;

    if (hasChildren) {
      return (
        <div key={menu.id}>
          <button
            onClick={() => toggleMenu(menu.id)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-purple-200 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <span className="text-purple-300">
                {renderIcon(menu.icon)}
              </span>
              <span className="font-medium">{menu.nama_menu}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-500/30 pl-4">
              {menu.children.map(child => renderMenuItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={menu.id}
        href={menu.path || '#'}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
          ${
            isActive
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
              : 'text-purple-200 hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <span className={isActive ? 'text-white' : 'text-purple-300'}>
          {renderIcon(menu.icon)}
        </span>
        <span className="font-medium">{menu.nama_menu}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-r border-white/10 z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Kasir App</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          menus.map(menu => renderMenuItem(menu))
        )}
      </nav>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none"></div>
    </aside>
  );
}