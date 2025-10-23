'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getAuthUser();
  
  const role = searchParams.get('role') || user?.role?.nama_role || 'Unknown';
  const attemptedPath = searchParams.get('attempted') || 'Unknown path';
  const reason = searchParams.get('reason') || 'insufficient_permissions';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-3xl blur-2xl"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 p-12 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Animated ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                
                {/* Icon container */}
                <div className="relative w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                403
              </h1>
              <p className="text-2xl font-semibold text-red-300 mb-2">
                Akses Ditolak
              </p>
              <p className="text-red-200/80">
                Maaf, Anda tidak memiliki izin untuk mengakses halaman ini
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4 mb-10">
              {/* User Role */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Role Anda</p>
                      <p className="text-lg font-semibold text-white capitalize">{role}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                    <span className="text-xs font-medium text-purple-300">Current Role</span>
                  </div>
                </div>
              </div>

              {/* Attempted Path */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-red-500/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-300 mb-2">Halaman yang Anda coba akses</p>
                    <div className="bg-black/30 rounded-lg px-4 py-3 border border-red-500/20">
                      <code className="text-red-300 text-sm font-mono break-all">
                        {attemptedPath}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {reason === 'insufficient_permissions' && (
                <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-5 border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">
                        Role Anda tidak memiliki izin untuk mengakses halaman ini
                      </p>
                      <p className="text-orange-400/80 text-xs">
                        Hubungi administrator untuk mendapatkan akses lebih
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:border-white/40"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Kembali</span>
                </span>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Ke Dashboard</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-purple-300/80 text-sm">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ForbiddenContent />
    </Suspense>
  );
}