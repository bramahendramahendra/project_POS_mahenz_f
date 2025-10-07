'use client';

export default function MasterUserPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">
          Master User 👤
        </h2>
        <p className="text-purple-200">
          Manajemen data pengguna sistem
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Master User</h3>
          <p className="text-purple-300 mb-8 max-w-md mx-auto">
            Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">250+</div>
              <div className="text-purple-200">Registered Users</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">185</div>
              <div className="text-purple-200">Active Users</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-teal-400 mb-2">12</div>
              <div className="text-purple-200">New This Month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}