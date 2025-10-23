'use client';

export default function MasterMenuPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">
          Master Menu 📋
        </h2>
        <p className="text-purple-200">
          Kelola menu aplikasi dengan mudah
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Master Menu</h3>
          <p className="text-purple-300 mb-8 max-w-md mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">150+</div>
              <div className="text-purple-200">Total Menu Items</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">25</div>
              <div className="text-purple-200">Active Categories</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-purple-200">Menu Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}