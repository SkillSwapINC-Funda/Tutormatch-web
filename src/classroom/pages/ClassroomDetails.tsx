import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, FileText, Info } from 'lucide-react';
import ClassroomNavbar from '../components/ClassroomNavbar';
import ClassroomFooter from '../components/ClassroomFooter';
import ChatTab from '../components/classroom-detail/chat/ChatTab';
import MaterialsTab from '../components/classroom-detail/materials/MaterialsTab';
import InformationTab from '../components/classroom-detail/info/InformationTab';

const ClassroomDetails: React.FC = () => {
  const { tutoringId } = useParams<{ tutoringId: string }>();
  const [activeTab, setActiveTab] = useState('chat');
  const [viewMode, setViewMode] = useState('list');

  // Datos de ejemplo - estos vendrán de tu API
  const courseInfo = {
    title: 'Algoritmos y Estructura de datos: Árboles Binarios',
    tutor: 'Ana Martínez',
    description: 'Comprenderla nos permite evaluar la eficiencia de nuestros algoritmos y tomar decisiones informadas al seleccionar las mejores herramientas para nuestros proyectos.',
    startDate: '6 de mayo de 2025',
    endDate: '5 de julio de 2025',
    sessions: '2 de 8 completadas',
    type: 'Personalizada (1 a 1)',
    tutorBio: 'Ingeniero de Software con más de 8 años de experiencia. Especialista en algoritmos y estructuras de datos. Profesor universitario y mentor de estudiantes de Ingeniería.',
    studentName: 'María García',
    studentBio: 'Estudiante de Ingeniería de Software, cursando el 6to semestre. Interesada en algoritmos y desarrollo web.'
  };

  const materials = [
    { id: 1, name: 'Introducción a Árboles Binarios.pdf', size: '2.3 MB', date: '31 de mayo de 2025', type: 'pdf', icon: '📄' },
    { id: 2, name: 'Algoritmos de Búsqueda en Árboles.docx', size: '1.8 MB', date: '2 de junio de 2025', type: 'docx', icon: '📄' },
    { id: 3, name: 'Presentación - Tipos de Árboles.pptx', size: '4.2 MB', date: '3 de junio de 2025', type: 'pptx', icon: '📊' },
    { id: 4, name: 'Ejercicios Prácticos - Datos.xlsx', size: '856 KB', date: '3 de junio de 2025', type: 'xlsx', icon: '📊' },
    { id: 5, name: 'Video Explicativo - Recorridos.mp4', size: '45.2 MB', date: '4 de junio de 2025', type: 'mp4', icon: '▶️' }
  ];

  const chatMessages = [
    { id: 1, sender: 'Ana Martínez', isCurrentUser: false, message: '¡Genial! Me gusta cómo explicas con ejemplos de código. ¿Podrías mostrarme también la implementación en TypeScript?', time: '10:54 a. m.', type: 'message' }
  ];

  const syllabus = [
    'Introducción a la Complejidad Algorítmica',
    'Análisis de Algoritmos Recursivos',
    'Algoritmos de Ordenamiento',
    'Algoritmos de Búsqueda',
    'Estructuras de Datos Avanzadas',
    'Algoritmos Voraces (Greedy)',
    'Programación Dinámica',
    'Algoritmos de Grafos'
  ];

  const participants = [
    { name: 'Ana Martínez', role: 'Tutor', initials: 'A', status: 'online' },
    { name: 'Estudiante Actual', role: 'Estudiante', initials: 'E', status: 'online' }
  ];

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      <ClassroomNavbar />
      <div className="px-6 pt-6">
        <div className="mb-4 text-lg font-bold">
          Classroom details de la tutoría: <b>{tutoringId}</b>
        </div>
      </div>
      {/* Navigation Tabs */}
      <nav className="bg-dark px-6 py-2 border-b border-dark-border">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'materials'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Materiales</span>
          </button>
          <button
            onClick={() => setActiveTab('information')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'information'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Información</span>
          </button>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === 'chat' && (
          <ChatTab participants={participants} chatMessages={chatMessages} />
        )}
        {activeTab === 'materials' && (
          <MaterialsTab materials={materials} viewMode={viewMode} setViewMode={setViewMode} />
        )}
        {activeTab === 'information' && (
          <InformationTab courseInfo={courseInfo} syllabus={syllabus} />
        )}
      </main>
      <ClassroomFooter />
    </div>
  );
};

export default ClassroomDetails;