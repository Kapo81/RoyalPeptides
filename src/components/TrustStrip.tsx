import { Lock, FlaskConical, Package, BarChart3, Truck, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const iconMap: Record<string, any> = {
  Lock,
  FlaskConical,
  Package,
  BarChart3,
  Truck,
  CheckCircle,
};

export default function TrustStrip() {
  const { settings } = useSiteSettings();

  const defaultTrustPoints = [
    'Quality-Tested Research Compounds',
    'Fast Canada-Wide Shipping',
    'Discreet Packaging',
    'Secure Payment Options',
    'Responsive Customer Support',
  ];

  const trustPoints = settings?.global_trust_points || defaultTrustPoints;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-4">
      {trustPoints.map((point, index) => (
        <div key={index} className="flex items-center gap-2 group cursor-default">
          <CheckCircle className="h-4 w-4 text-gray-400 group-hover:text-[#0093D0] transition-colors" />
          <span className="text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            {point}
          </span>
        </div>
      ))}
    </div>
  );
}
