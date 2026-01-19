import { AlertTriangle, Shield, FileText, Scale, Info } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import SEO from '../components/SEO';
import { useOrigin } from '../hooks/useOrigin';

export default function Legal() {
  const origin = useOrigin();

  return (
    <div className="min-h-screen bg-[#05070b] relative pt-20">
      <SEO
        title="Research Use Only Disclaimer | Royal Peptides Canada"
        description="Royal Peptides provides research-only peptides and related compounds for laboratory use in Canada. Not for human consumption or medical use. Read our full legal disclaimer."
        canonical={origin ? `${origin}/legal` : undefined}
      />
      <PageBackground variant="legal" />

      <div className="relative z-10 bg-gradient-to-b from-[#0B0D12] to-[#05070b] text-white py-10 md:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-4 mb-4 md:mb-6">
            <Scale className="h-10 w-10 md:h-12 md:w-12 text-[#00A0E0] mb-3 md:mb-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">Research Use Only Disclaimer</h1>
          </div>
          <div className="h-px w-48 md:w-64 bg-gradient-to-r from-transparent via-[#00A0E0] to-transparent mx-auto mb-3 md:mb-4 shadow-[0_0_15px_rgba(0,160,224,0.4)]"></div>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg text-center max-w-3xl mx-auto">Research Use Only — Important Legal Information</p>
          <div className="flex items-center justify-center mt-4 md:mt-6">
            <span className="text-xs md:text-sm text-gray-400">Proudly operated from Canada</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="bg-amber-900/20 border-2 border-amber-500/40 rounded-lg md:rounded-xl p-4 md:p-8 mb-6 md:mb-8 backdrop-blur-sm">
          <div className="flex items-start space-x-3 md:space-x-4">
            <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-amber-400 flex-shrink-0 mt-0.5 md:mt-1" />
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-amber-300 mb-2 md:mb-3">
                RESEARCH PURPOSES ONLY — NOT FOR HUMAN USE
              </h2>
              <p className="text-amber-100/90 leading-relaxed text-sm md:text-base lg:text-lg">
                All products sold on this website are strictly for laboratory, scientific, and research
                purposes only. These products are NOT intended for human consumption, medical use, or
                veterinary applications. Products manufactured and shipped from Canada.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-lg md:rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-4 md:p-8 mb-6 md:mb-8">
          <div className="h-0.5 md:h-1 bg-gradient-to-r from-[#00A0E0] via-cyan-400 to-[#00A0E0] rounded mb-4 md:mb-8 shadow-[0_0_15px_rgba(0,160,224,0.4)]"></div>

          <div className="space-y-6 md:space-y-8">
            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex-shrink-0">
                  <Info className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Introduction</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  Royal Peptides is a Canadian supplier of research-use-only peptides and related compounds. All products available on this website are intended{' '}
                  <span className="font-semibold text-white">strictly for laboratory, scientific, and educational research purposes</span>.
                </p>
                <p>
                  Our products are not drugs, medicines, dietary supplements, or intended for any therapeutic application.
                  By accessing this website and purchasing any products, you acknowledge and agree that you understand and will comply with all terms outlined in this disclaimer.
                </p>
                <p>
                  <span className="font-semibold text-white">Operating from Canada:</span> Royal Peptides operates from Canada and provides research peptides to qualified researchers, laboratories, and academic institutions worldwide.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-[#00A0E0]/20 border border-[#00A0E0]/30 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-[#00A0E0]" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Not for Human Consumption / No Medical Use</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  All products sold by Royal Peptides are{' '}
                  <span className="font-semibold text-white">NOT intended for human or animal consumption, medical treatment, diagnosis, or prevention of any disease</span>.
                </p>
                <ul className="list-disc pl-5 md:pl-6 space-y-1.5 md:space-y-2 text-sm md:text-base">
                  <li><span className="font-semibold text-white">Not for human use:</span> Products must not be consumed, injected, or applied to humans in any manner</li>
                  <li><span className="font-semibold text-white">Not for veterinary use:</span> Products are not intended for animal treatment or veterinary applications</li>
                  <li><span className="font-semibold text-white">No medical purposes:</span> Not for medical, diagnostic, or therapeutic purposes of any kind</li>
                  <li><span className="font-semibold text-white">No dosage guidance:</span> We do not provide dosage information, administration protocols, or medical guidance</li>
                  <li><span className="font-semibold text-white">Not evaluated:</span> Products have not been evaluated by Health Canada, FDA, or any regulatory agency</li>
                  <li><span className="font-semibold text-white">No medical advice:</span> Nothing on this website constitutes medical advice, treatment recommendations, or health guidance</li>
                </ul>
                <p className="pt-3">
                  Customers must not use products as drugs, supplements, or treatments. Any such use is strictly prohibited and done at the user's own risk.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex-shrink-0">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Researcher Responsibility & Customer Eligibility</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  By purchasing from Royal Peptides, you agree that you are a qualified professional and that you will handle all products responsibly and in accordance with applicable regulations.
                </p>
                <p className="font-semibold text-white">You confirm that you are:</p>
                <ul className="list-disc pl-5 md:pl-6 space-y-1.5 md:space-y-2 text-sm md:text-base">
                  <li>A licensed researcher or representative of a qualified research institution</li>
                  <li>A laboratory or scientific organization conducting legitimate research</li>
                  <li>At least 18 years of age</li>
                  <li>Authorized to purchase and handle research chemicals in your jurisdiction</li>
                  <li>
                    Aware of and compliant with all Canadian federal laws, provincial regulations, and
                    international laws governing the purchase, possession, and use of research peptides
                  </li>
                </ul>
                <p className="pt-3">
                  <span className="font-semibold text-white">Customer Responsibilities:</span> Buyers are solely responsible for how they use, store, and handle all products.
                  You must follow all applicable safety protocols, laboratory best practices, and regulatory requirements in your jurisdiction.
                  All materials must be handled in controlled laboratory environments by qualified personnel.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg flex-shrink-0">
                  <Scale className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Age, Jurisdiction & Canadian Regulations</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  <span className="font-semibold text-white">Age Requirement:</span> All customers must be at least 18 years of age to purchase from Royal Peptides. By placing an order, you confirm that you meet this age requirement.
                </p>
                <p>
                  <span className="font-semibold text-white">Canadian Operations:</span> Royal Peptides operates from Canada and sells research products under Canadian law. All products are manufactured and shipped from Canadian facilities. By accessing this website and placing an order, you confirm that the purchase and use of these products is legal in your jurisdiction.
                </p>
                <p>
                  <span className="font-semibold text-white">Canadian Compliance:</span> All products comply with Canadian regulations for research-use compounds. Licensed labs and researchers only. Not for human use. For research purposes only.
                </p>
                <p>
                  <span className="font-semibold text-white">Customer Legal Responsibility:</span> Customers are solely responsible for ensuring that their purchase and use of our products complies with all applicable local, provincial, federal, and international laws and regulations in their jurisdiction.
                </p>
                <p>
                  Royal Peptides makes no representations regarding the legal status of our products in any jurisdiction outside of Canada. It is the customer's responsibility to determine whether the products they intend to purchase are legal in their location.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Limitation of Liability</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  Royal Peptides shall not be held liable for any misuse, improper handling, or unauthorized
                  use of our products. By purchasing, you agree to:
                </p>
                <ul className="list-disc pl-5 md:pl-6 space-y-1.5 md:space-y-2 text-sm md:text-base">
                  <li>Use products only for their intended research purposes</li>
                  <li>Follow all applicable safety protocols and regulations</li>
                  <li>Properly store and handle all products according to specifications</li>
                  <li>
                    Assume all risks associated with the purchase, possession, and use of these products
                  </li>
                  <li>
                    Indemnify and hold harmless Royal Peptides from any claims arising from product use
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex-shrink-0">
                  <Info className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">No Guarantees / Information Accuracy</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  <span className="font-semibold text-white">Product Information for Research Reference Only:</span> All product descriptions, specifications, and information provided on this website are for research reference purposes only. Royal Peptides makes no claims regarding therapeutic effects, benefits, or outcomes.
                </p>
                <p>
                  <span className="font-semibold text-white">No Performance Guarantees:</span> We provide no guarantees, warranties, or assurances regarding the outcomes, results, or performance of any research conducted with our products. All research results are dependent on numerous factors outside our control.
                </p>
                <p>
                  <span className="font-semibold text-white">Information Subject to Change:</span> Product information, specifications, and website content may change without notice and should not be treated as comprehensive scientific literature, medical guidance, or professional advice.
                </p>
                <p>
                  <span className="font-semibold text-white">Not Professional Advice:</span> Nothing on this website constitutes professional, medical, scientific, or legal advice. Customers must conduct their own due diligence and consult appropriate professionals regarding their research needs and regulatory compliance.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Terms of Purchase</h2>
              </div>
              <div className="pl-0 md:pl-14 space-y-2 md:space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
                <p>
                  By completing a purchase, you acknowledge that you have read, understood, and agree to
                  this disclaimer and all terms and conditions.
                </p>
                <p>
                  All sales are final. Returns are only accepted for damaged or defective products, subject
                  to verification.
                </p>
                <p className="font-semibold text-white">
                  If you do not agree with these terms, do not purchase or use our products.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B0D12] to-[#050608] border border-white/10 rounded-lg md:rounded-xl p-4 md:p-8 text-center backdrop-blur-sm">
          <p className="text-gray-300 text-base md:text-lg font-semibold mb-3 md:mb-4">
            Made & Shipped from Canada
          </p>
          <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
            For questions regarding these terms, please contact us at{' '}
            <a href="mailto:1984Gotfina@gmail.com" className="text-[#00A0E0] hover:text-cyan-400 transition-colors break-all">
              1984Gotfina@gmail.com
            </a>
          </p>
          <p className="text-gray-500 text-xs">Last updated: December 2024</p>
        </div>
      </div>
    </div>
  );
}
