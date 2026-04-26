import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Star, MessageSquare, ArrowRight } from 'lucide-react';

export default function AgentsPage() {
  const agents = [
    {
      name: 'أحمد محمود',
      role: 'وسيط عقاري متخصص',
      image: '/images/agent1.jpg',
      rating: 4.8,
      reviews: 156
    },
    {
      name: 'فاطمة علي',
      role: 'مستشارة عقارية',
      image: '/images/agent2.jpg',
      rating: 4.9,
      reviews: 203
    },
    {
      name: 'محمد الأمين',
      role: 'خبير في العقارات التجارية',
      image: '/images/agent3.jpg',
      rating: 4.7,
      reviews: 189
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--on-surface)]">
              فريق وكلائنا المتخصصين
            </h1>
            <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
              ابحث عن الوكيل العقاري المناسب لك من فريقنا المتخصص والموثوق
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {agents.map((agent, index) => (
              <div 
                key={index}
                className="rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white">
                    {agent.name.charAt(0)}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--on-surface)]">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-[var(--on-surface-variant)]">
                      {agent.role}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-[var(--on-surface)]">
                      {agent.rating}
                    </span>
                    <span className="text-xs text-[var(--on-surface-variant)]">
                      ({agent.reviews} تقييم)
                    </span>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all">
                    <span>التواصل بالوكيل</span>
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-opacity-90 transition-all">
              <span>ابحث عن وكيل</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
