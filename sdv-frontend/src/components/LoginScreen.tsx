import React, { useState } from 'react';
import { usuariosApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !password) {
      alert('Por favor, ingrese su usuario y contraseña');
      return;
    }
    
    try {
      // Limpiar espacios en blanco del correo electrónico
      const correoLimpiado = usuario.trim();
      const res = await usuariosApi.login({ 
        CorreoElectronico: correoLimpiado, 
        Contrasena: password 
      });
      
      if (res.status >= 200 && res.status < 300) {
        onLogin();
      }
    } catch (error: any) {
      console.error('Error de login', error);
      
      // Mensaje más descriptivo basado en el tipo de error
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || error.response.data;
        
        if (status === 401 || status === 403) {
          errorMessage = 'Credenciales inválidas. Verifique su correo electrónico y contraseña.';
        } else if (status === 400) {
          errorMessage = message || 'Datos de login inválidos. Por favor, verifique los campos.';
        } else if (status === 500) {
          errorMessage = message || 'Error del servidor. Por favor, intente más tarde.';
        } else {
          errorMessage = message || `Error ${status}: No se pudo completar la solicitud.`;
        }
      } else if (error.request) {
        // Error de red - no se recibió respuesta
        errorMessage = 'Error de conexión. Verifique que el servidor esté disponible.';
      } else {
        // Error en la configuración de la solicitud
        errorMessage = 'Error al procesar la solicitud.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm bg-white/90 relative">
        {/* Left side - Branding */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-12 relative">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Content */}
          <div className="h-full flex flex-col justify-center items-center relative">
            <div className="relative mb-12">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-xl opacity-25 animate-pulse"></div>
              <img src="/sdv_logo.png" alt="SDV Logo" className="h-72 w-auto relative" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              Bienvenido a SDV
            </h1>
            <p className="text-xl text-gray-600 text-center font-medium">
              Servicios de Voz
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 bg-white/95 p-8 md:p-12 backdrop-blur-sm">
          <div className="md:hidden flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-xl opacity-25 animate-pulse"></div>
              <img src="/sdv_logo.png" alt="SDV Logo" className="h-40 w-auto relative" />
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 mb-8 text-lg">Ingresa tus credenciales para continuar</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-sm font-medium text-gray-700">
                  Usuario
                </Label>
                <div className="relative group">
                  <Input
                    id="usuario"
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 group-hover:border-blue-400 rounded-xl"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 group-hover:border-blue-400 rounded-xl"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl"
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
