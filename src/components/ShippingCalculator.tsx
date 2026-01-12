import { useState } from 'react';
import { Truck, MapPin } from 'lucide-react';
import { getShippingInfo, CANADIAN_PROVINCES } from '../lib/shippingCalculator';

interface ShippingCalculatorProps {
  vialCount?: number;
  productPrice?: number;
}

export default function ShippingCalculator({ vialCount = 1, productPrice = 0 }: ShippingCalculatorProps) {
  const [province, setProvince] = useState('ON');
  const [quantity, setQuantity] = useState(vialCount);
  const [country, setCountry] = useState('Canada');

  const shippingInfo = getShippingInfo(
    quantity,
    province,
    productPrice * quantity,
    country !== 'Canada'
  );

  return (
    <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-xl p-4 md:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="h-5 w-5 text-[#00A0E0]" />
        <h3 className="text-lg font-bold text-white">Calculate Shipping</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Shipping To
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 bg-[#050608] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
          >
            <option value="Canada">Canada</option>
            <option value="International">International</option>
          </select>
        </div>

        {country === 'Canada' && (
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
              Province
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 bg-[#050608] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
            >
              {CANADIAN_PROVINCES.map(prov => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Quantity (vials)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#050608] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#00A0E0] focus:border-[#00A0E0] transition-all"
          />
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className={`rounded-lg p-3 md:p-4 border ${
            shippingInfo.isFree
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
              : 'bg-gradient-to-br from-[#00A0E0]/10 to-[#11D0FF]/10 border-[#00A0E0]/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Shipping Cost:</span>
              <span className={`text-lg font-bold ${shippingInfo.isFree ? 'text-green-400' : 'text-white'}`}>
                {shippingInfo.isFree ? 'FREE' : `$${shippingInfo.cost.toFixed(2)} CAD`}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-[#00A0E0]" />
                <span>{shippingInfo.method}</span>
              </div>
              <p className={shippingInfo.isFree ? 'text-green-400' : 'text-[#00A0E0]'}>
                Estimated: {shippingInfo.estimatedDays} business days
              </p>
            </div>
            {shippingInfo.isFree ? (
              <div className="mt-2 pt-2 border-t border-green-500/30">
                <div className="flex items-center gap-2 text-xs text-green-400 font-semibold">
                  <Truck className="h-3 w-3" />
                  <span>Your order qualifies for FREE SHIPPING!</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Add <span className="text-white font-semibold">${(300 - (productPrice * quantity)).toFixed(2)}</span> more for free shipping + 10% OFF
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
