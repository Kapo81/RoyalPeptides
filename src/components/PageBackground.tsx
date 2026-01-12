import BioEnergySignature from './BioEnergySignature';

interface PageBackgroundProps {
  variant: 'home' | 'catalogue' | 'stacks' | 'product' | 'about' | 'shipping' | 'legal' | 'admin' | 'default';
  children?: React.ReactNode;
}

export default function PageBackground({ variant, children }: PageBackgroundProps) {
  const getBackgroundImage = () => {
    switch (variant) {
      case 'home':
        return 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'catalogue':
        return 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'stacks':
        return 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'product':
        return 'https://images.pexels.com/photos/3825529/pexels-photo-3825529.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'about':
        return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'shipping':
        return 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'legal':
        return 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1920';

      case 'admin':
        return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920';

      default:
        return 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1920';
    }
  };

  const backgroundImage = getBackgroundImage();

  const getBioEnergyIntensity = () => {
    if (variant === 'admin') return 'minimal';
    return 'subtle';
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: 'brightness(0.3) contrast(1.1)'
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#020305]/95 via-[#050608]/90 to-[#020305]/95" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/10 via-transparent to-[#11D0FF]/10" />

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="subtle-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="1" fill="#00A0E0" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#subtle-grid)" />
      </svg>

      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[8%] w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-[#00A0E0]/8 rounded-full blur-[120px] animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-[#11D0FF]/8 rounded-full blur-[140px] animate-[float_15s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
      </div>

      <BioEnergySignature intensity={getBioEnergyIntensity()} />

      {children}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.05); }
          66% { transform: translate(-30px, 25px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
