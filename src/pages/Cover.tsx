interface CoverProps {
  onNavigate: (page: string) => void;
}

export default function Cover({ onNavigate }: CoverProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#00A0E0]/10 via-transparent to-transparent opacity-50"></div>

      <div className="relative z-10 text-center px-4">
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-[#00A0E0]/30 scale-150"></div>
            <img
              src="/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png"
              alt="Royal Peptides"
              className="h-32 w-32 relative z-10"
            />
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-light text-white mb-4 tracking-tight">
          Royal Peptides
        </h1>

        <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-[#00A0E0] to-transparent mb-6"></div>

        <p className="text-2xl md:text-3xl text-gray-400 font-light mb-2">
          Peptide Catalogue
        </p>

        <p className="text-lg text-gray-500 mb-16">
          Premium Research Compounds
        </p>

        <button
          onClick={() => onNavigate('shop')}
          className="group px-8 py-4 bg-transparent border border-[#00A0E0] text-[#00A0E0] rounded-sm hover:bg-[#00A0E0] hover:text-white transition-all duration-300 font-light tracking-wide"
        >
          <span className="flex items-center space-x-2">
            <span>EXPLORE CATALOGUE</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-600 uppercase tracking-widest">
          Research Use Only
        </p>
      </div>
    </div>
  );
}
