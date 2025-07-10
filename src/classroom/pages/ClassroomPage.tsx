import { useState } from 'react';
import { Search, Filter, MessageCircle, FileText, Bell, User } from 'lucide-react';

const ClassroomPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllTutorials, setShowAllTutorials] = useState(false);

  // Datos de ejemplo - estos vendrán de tu API
  const courses = [
    {
      id: 1,
      title: 'Algoritmos y Estructura de datos: Árboles Binarios',
      tutor: 'Ana Martínez',
      status: 'En curso',
      nextSession: '15 de abril de 2024, 15:00',
      chatNotifications: 1,
      materialsNotifications: 0
    },
    {
      id: 2,
      title: 'Diseño de Base de Datos: MongoDB',
      tutor: 'Roberto Sánchez',
      status: 'Completado',
      completedDate: '20 de marzo de 2024, 09:00',
      chatNotifications: 0,
      materialsNotifications: 0
    },
    {
      id: 3,
      title: 'Complejidad Algorítmica: Asesorías',
      tutor: 'Carlos Domínguez',
      status: 'En curso',
      nextSession: '16 de abril de 2024, 17:30',
      chatNotifications: 0,
      materialsNotifications: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En curso':
        return 'bg-green-500';
      case 'Completado':
        return 'bg-blue-500';
      default:
        return 'bg-light-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'En curso':
        return 'En curso';
      case 'Completado':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      {/* Header */}
      <header className="bg-dark-light px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-light">TutorMatch</h1>
          <span className="bg-primary text-light text-sm px-2 py-1 rounded">Classroom</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-light-gray" />
            <span className="absolute -top-1 -right-1 bg-primary text-xs w-5 h-5 rounded-full flex items-center justify-center">1</span>
          </div>
          <div className="w-8 h-8 bg-dark-border rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-light-gray" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">Mis Cursos en Classroom</h2>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tutorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-light placeholder-light-gray focus:outline-none focus:border-primary"
            />
          </div>
          <button 
            onClick={() => setShowAllTutorials(!showAllTutorials)}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-light transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Todas las tutorías</span>
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-dark-card rounded-lg overflow-hidden hover:bg-dark-light transition-colors">
              {/* Course Content Area */}
              <div className="bg-light-gray h-40 flex items-center justify-center">
                <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-light-gray" />
                </div>
              </div>

              {/* Course Info */}
              <div className="px-4 py-4">
                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium text-light ${getStatusColor(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-light leading-tight">
                  {course.title}
                </h3>
                <p className="text-light-gray text-sm mb-1">
                  Tutor: {course.tutor}
                </p>
                <p className="text-light-gray text-sm mb-4">
                  {course.status === 'Completado' ? (
                    <>🔴 Completado el {course.completedDate}</>
                  ) : (
                    <>🔴 Próxima sesión: {course.nextSession}</>
                  )}
                </p>

                {/* Enter Classroom Button */}
                <button className="w-full bg-primary hover:bg-primary-hover text-light font-medium py-3 px-4 rounded-lg transition-colors mb-4">
                  Entrar al Classroom
                </button>

                {/* Chat and Materials */}
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2 text-light-gray">
                    <div className="relative">
                      <MessageCircle className="w-5 h-5" />
                      {course.chatNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                          {course.chatNotifications}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">Chat</span>
                  </div>
                  <div className="flex items-center space-x-2 text-light-gray">
                    <div className="relative">
                      <FileText className="w-5 h-5" />
                      {course.materialsNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                          {course.materialsNotifications}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">Materiales</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-light text-center py-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-bold">TutorMatch</span>
          <span className="bg-secondary px-2 py-1 rounded text-sm">Classroom</span>
        </div>
        <p className="text-sm mt-2 opacity-90">© 2025 TutorMatch. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default ClassroomPage;