import React, { use } from "react";
import { motion } from "framer-motion";
import { Scale, Shield, Mic, MessageSquare, Users, ChevronRight, Menu } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  
  const features = [
  {
    id: "evidence-tamper",
    title: "Evidence Authenticity Engine",
    description:
      "Detect tampered, edited, or AI-generated evidence using advanced forensic analysis, ensuring only verified and admissible data is used in court.",
    icon: Shield,
    image: "https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    span: "col-span-12 md:col-span-8 row-span-2",
  },
  {
    id: "recording",
    title: "Role-Based Hearing Intelligence",
    description:
      "Securely capture courtroom proceedings with role-specific voice-to-text conversion, enabling structured and searchable legal records.",
    icon: Mic,
    image: "https://images.unsplash.com/photo-1676181739859-08330dea8999?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxsZWdhbCUyMGdhdmVsfGVufDB8fHx8MTc3NTI0MjY4NHww&ixlib=rb-4.1.0&q=85",
    span: "col-span-12 md:col-span-4 row-span-2",
  },
  {
    id: "ai-chatbot",
    title: "Legal Intelligence Chatbot",
    description:
      "Instantly retrieve relevant laws, sections, and past case precedents to assist judges, lawyers, and citizens in decision-making.",
    icon: MessageSquare,
    image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    span: "col-span-12 md:col-span-6 row-span-1",
  },
  {
    id: "debate-simulator",
    title: "Multi-Agent Legal Debate Simulator",
    description:
      "Simulate courtroom arguments with AI agents representing defense, prosecution, and judge to refine legal strategies and counter-arguments.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxzY2FsZXMlMjBvZiUyMGp1c3RpY2V8ZW58MHx8fHwxNzc1MjQyNjg0fDA&ixlib=rb-4.1.0&q=85",
    span: "col-span-12 md:col-span-6 row-span-1",
  },
];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleNavigate = () => {
 navigate("/evidence");
  
};

  return (
    <div className="min-h-screen bg-white">
    <Navbar 
      mobileMenuOpen={mobileMenuOpen} 
      setMobileMenuOpen={setMobileMenuOpen} 
    />
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/31735033/pexels-photo-31735033.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt="Modern architecture"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        

        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-sm tracking-wide uppercase text-[#4B5563] mb-6 font-medium">
              AI-Powered Justice Technology
            </p>
            <h1
              className="text-5xl sm:text-6xl tracking-tight leading-none font-bold text-[#0B132B] mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Building India's End-to-End Justice Tech Stack
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[#4B5563] mb-10 max-w-2xl">
              TensorCourt revolutionizes courtroom operations with cutting-edge AI solutions to eliminate delays, streamline workflows, and ensure timely justice for all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                data-testid="hero-get-started-btn"
                className="btn-primary bg-[#C5A880] text-white px-8 py-4 rounded-none font-medium inline-flex items-center gap-2 transition-all duration-300 ease-in-out 
hover:scale-105 hover:shadow-lg"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                data-testid="hero-learn-more-btn"
                className="btn-secondary bg-transparent text-[#0B132B] border border-[#0B132B] px-8 py-4 rounded-none font-medium"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-18 sm:py-8 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="text-sm tracking-wide uppercase text-[#4B5563] mb-4 font-medium">
              Core Capabilities
            </p>
            <h2
              className="text-3xl sm:text-4xl tracking-tight leading-tight font-semibold text-[#0B132B] max-w-3xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Transforming Judicial Systems with AI and Technology
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  variants={itemVariants}
                  data-testid={`feature-${feature.id}`}
                  className={`bento-card ${feature.span} bg-white border border-[#E5E7EB] rounded-sm overflow-hidden group`}
                >
                  {feature.image ? (
                    <div className="relative h-full">
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/50 to-transparent"></div>
                      </div>
                      <div className="relative h-full flex flex-col justify-end p-8 lg:p-10">
                        <Icon className="w-12 h-12 text-[#C5A880] mb-4" />
                        <h3
                          className="text-2xl sm:text-3xl tracking-tight leading-snug font-medium text-white mb-3"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {feature.title}
                        </h3>
                        <p className="text-base leading-relaxed text-gray-200">
                          {feature.description}
                        </p>
                        <button
  onClick={() => handleNavigate(feature.id)}
  className="mt-6 w-fit px-5 py-2 bg-[#C5A880] text-white text-sm 
  hover:scale-105 transition-all duration-300"
>
  Explore →
</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 lg:p-10 h-full flex flex-col justify-center">
                      <Icon className="w-12 h-12 text-[#C5A880] mb-6" />
                      <h3
                        className="text-2xl sm:text-3xl tracking-tight leading-snug font-medium text-[#0B132B] mb-3"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[#4B5563]">
                        {feature.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-sm p-12 lg:p-16 text-center"
          >
            <p className="text-sm tracking-wide uppercase text-[#4B5563] mb-4 font-medium">
              Join Us
            </p>
            <h2
              className="text-3xl sm:text-4xl tracking-tight leading-tight font-semibold text-[#0B132B] mb-6 max-w-3xl mx-auto"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Justice Delayed is Justice Denied
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-[#4B5563] mb-10 max-w-2xl mx-auto">
              Join us in building a future where courtrooms are efficient, accessible, and fair for all.
            </p>
            <button
              data-testid="cta-contact-btn"
              className="btn-primary bg-[#C5A880] text-white px-8 py-4 rounded-none font-medium inline-flex items-center gap-2"
            >
              Get in Touch
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-[#0B132B] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-[#C5A880]" />
                <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  TensorCourt
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transforming judicial systems by leveraging AI and technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-[#C5A880] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#C5A880] transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 TensorCourt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
