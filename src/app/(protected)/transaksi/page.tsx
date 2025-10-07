'use client';

export default function TransaksiPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">
          Transaksi Penjualan 💳
        </h2>
        <p className="text-purple-200">
          Proses transaksi kasir dengan cepat dan mudah
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">Transaksi Kasir</h3>
          <p className="text-purple-300 mb-8 max-w-md mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">Rp 15.5M</div>
              <div className="text-purple-200">Total Today</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">87</div>
              <div className="text-purple-200">Transactions</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-3xl font-bold text-sky-400 mb-2">Rp 178K</div>
              <div className="text-purple-200">Avg. Transaction</div>
            </div>
          </div>
          
          <button className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105">
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Transaksi Baru</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}