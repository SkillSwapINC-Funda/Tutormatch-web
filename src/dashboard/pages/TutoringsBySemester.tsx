import React, { useEffect, useState } from 'react';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TutoringCard from '../../tutoring/components/TutoringCard';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { SemesterService } from '../services/SemesterService';
import { ProgressSpinner } from 'primereact/progressspinner';

const TutoringsBySemester: React.FC = () => {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [tutorings, setTutorings] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterName, setSemesterName] = useState<string>('');

  useEffect(() => {
    const fetchTutorings = async () => {
      if (!semesterId) {
        setError("No se especificó un semestre");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Obtener información del semestre
        const semesterData = await SemesterService.getSemesterById(semesterId);

        // Guardar el nombre del semestre para mostrarlo en el título
        if (semesterData && semesterData.name) {
          setSemesterName(semesterData.name);
        } else {
          setSemesterName('Semestre');
        }

        // 2. Obtener todos los cursos del semestre
        const courses = semesterData.courses || [];

        // 3. Obtener todas las tutorías
        const allTutorings = await TutoringService.getAllTutoringSessions();

        // 4. Filtrar tutorías por los cursos del semestre
        const courseIds = courses.map((course: any) => course.id);
        const filteredTutorings = allTutorings.filter(tutoring =>
          tutoring.courseId && courseIds.includes(tutoring.courseId)
        );

        setTutorings(filteredTutorings);
      } catch (err) {
        console.error('Error al cargar las tutorías:', err);
        setError('Error al cargar las tutorías. Intente nuevamente más tarde.');
        setSemesterName('Semestre desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorings();
  }, [semesterId]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          {semesterName} Semester
        </h1>

        {loading ? (
          <div className="flex justify-center">
           <div className="text-center">
             <ProgressSpinner style={{ width: '50px', height: '50px' }}
              strokeWidth="4"
              fill="#1e1e1e"
              animationDuration=".5s" />
            <p className="text-white mt-4">Cargando tutorías...</p>
           </div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-25 border border-red-700 rounded-md p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        ) : tutorings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorings.map((tutoring) => (
              <TutoringCard key={tutoring.id} tutoring={tutoring} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay tutorías disponibles para este semestre.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TutoringsBySemester;