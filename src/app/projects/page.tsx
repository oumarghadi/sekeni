import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Building2, MapPin, Users, TrendingUp } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      title: 'مشروع الواحات الحديثة',
      location: 'نواكشوط - تفرغ زينة',
      status: 'قيد الإنجاز',
      units: 150,
      description: 'مشروع سكني متكامل يجمع بين الحداثة والراحة'
    },
    {
      title: 'برج التجارة المركزي',
      location: 'نواكشوط - العرج',
      status: 'مكتمل',
      units: 200,
      description: 'مركز تجاري وسكني فاخر'
    },
    {
      title: 'حي الرياض العصري',
      location: 'نواكشوط - الأمل',
      status: 'قيد الإنجاز',
      units: 300,
      description: 'مجمع سكني كبير بتصاميم عصرية'
    },
    {
      title: 'فندق الواحة الذهبية',
      location: 'نواكشوط - الشرق',
      status: 'قيد التطوير',
      units: 100,
      description: 'فندق فاخر ذو معايير دولية'
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
              المشاريع الحصرية
            </h1>
            <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
              استكشف أحدث مشاريعنا العقارية الحصرية والمميزة
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {projects.map((project, index) => (
              <div 
                key={index}
                className="rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-40 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-[var(--primary)]/30" />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--on-surface)] mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[var(--on-surface-variant)]">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                      <Users className="w-4 h-4" />
                      {project.units} وحدة سكنية
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'مكتمل' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status}
                    </span>
                    <button className="text-[var(--primary)] font-semibold text-sm hover:underline">
                      اعرف المزيد
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
