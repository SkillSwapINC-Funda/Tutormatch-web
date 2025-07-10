import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col justify-center items-center text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-2">Página no encontrada</h2>
        <p className="text-gray-400 mb-6">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover hover:text-white transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;