import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

const GlassCubeScene = lazy(() => import("./GlassCubeScene"));

const GlassCubeSection = () => {
  const { language } = useTranslation();

  const title = language === 'it' ? 'Tecnologia MgO' : 
    language === 'en' ? 'MgO Technology' :
    language === 'de' ? 'MgO-Technologie' :
    'Technologie MgO';

  const subtitle = language === 'it' 
    ? 'Il core in ossido di magnesio: resistenza naturale, prestazioni straordinarie' 
    : language === 'en' 
    ? 'The magnesium oxide core: natural strength, extraordinary performance' 
    : language === 'de' 
    ? 'Der Magnesiumoxid-Kern: natürliche Stärke, außergewöhnliche Leistung' 
    : 'Le cœur en oxyde de magnésium : résistance naturelle, performances extraordinaires';

  return (
    <section className="relative h-[100svh] w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(220 15% 18%) 0%, hsl(220 12% 12%) 50%, hsl(220 10% 8%) 100%)',
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-12 md:pt-16 lg:pt-20 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3">
            {title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-white/60 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        }>
          <Canvas
            camera={{ position: [3.5, 2.5, 3.5], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <GlassCubeScene />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.2}
            />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default GlassCubeSection;
