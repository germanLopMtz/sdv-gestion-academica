import React, { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import Navigation from '@/components/Navigation';
import AlumnosSection from '@/components/AlumnosSection';
import MensualidadesSection from '@/components/MensualidadesSection';
import SeminariosSection from '@/components/SeminariosSection';
import DiplomadosSection from '@/components/DiplomadosSection';
import HorariosSection from '@/components/HorariosSection';
import PerfilSection from '@/components/PerfilSection';
import AsistenciasSection from '@/components/AsistenciasSection';
import MaestrosSection from '@/components/MaestrosSection';
import AvisosSection from '@/components/AvisosSection';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('alumnos');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection('alumnos');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'alumnos':
        return <AlumnosSection />;
      case 'mensualidades':
        return <MensualidadesSection />;
      case 'seminarios':
        return <SeminariosSection />;
      case 'diplomado':
        return <DiplomadosSection />;
      case 'horarios':
        return <HorariosSection />;
      case 'ver-perfil':
        return <PerfilSection />;
      case 'asistencias':
        return <AsistenciasSection />;
      case 'lista-maestros':
        return <MaestrosSection />;
      case 'avisos':
        return <AvisosSection />;
      default:
        return <AlumnosSection />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="min-h-screen">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Index;
