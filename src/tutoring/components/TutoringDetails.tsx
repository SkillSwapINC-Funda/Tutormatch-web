import React, { useState, useEffect, useRef } from 'react';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import { Check, Users, Monitor, Edit, Star, Expand } from 'lucide-react';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import ReviewList from './Review/ReviewList';
import CreateReviewModal from './Review/CreateReviewModal';
import { User } from '../../user/types/User';
import { Course } from '../../course/types/Course';
import { Link } from 'react-router-dom';
import Avatar from '../../user/components/Avatar';
import ContactTutorModal from './ContactTutorModal';
import { UserService } from '../../user/services/UserService';

//
import DeleteTutoringModal from '../../dashboard/components/DeleteTutoringModal';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Trash } from 'lucide-react';
import { TutoringService } from '../services/TutoringService';
import EditTutoringModal from '../../dashboard/components/EditTutoringModal';

interface TutoringDetailsProps {
    tutoring: TutoringSession;
    reviews: TutoringReview[];
    tutor?: User;
    course?: Course;
}

const TutoringDetails: React.FC<TutoringDetailsProps> = ({
    tutoring,
    reviews,
    tutor,
    course
}) => {
    const { title, description, price, whatTheyWillLearn, imageUrl, availableTimes, tutorId } = tutoring;    const [averageRating, setAverageRating] = useState<number>(0);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [contactModalVisible, setContactModalVisible] = useState<boolean>(false);
    const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const checkOwnership = () => {
            try {
                const currentUserId = localStorage.getItem('currentUserId');

                if (currentUserId) {

                    const tutorIdToCheck = tutorId || (tutor?.id);

                    if (tutorIdToCheck && currentUserId === tutorIdToCheck) {
                        setIsOwner(true);
                    } else {
                        setIsOwner(false);
                    }
                } else {
                    setIsOwner(false);
                }
            } catch (error) {
                console.error('Error al verificar propiedad de la tutoría:', error);
                setIsOwner(false);
            }
        };

        checkOwnership();
        const intervalId = setInterval(checkOwnership, 30000);

        return () => clearInterval(intervalId);
    }, [tutorId, tutor]);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const currentUserId = localStorage.getItem('currentUserId');
                if (currentUserId) {
                    const userData = await UserService.getUserById(currentUserId);
                    setCurrentUser(userData);
                }
            } catch (error) {
                console.error('Error al cargar usuario actual:', error);
            }
        };

        loadCurrentUser();
    }, []);

    const handleDeleteTutoring = async () => {
        try {
            await TutoringService.deleteTutoring(tutoring.id);

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'La tutoría ha sido eliminada correctamente',
                life: 3000
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error al eliminar la tutoría:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar la tutoría',
                life: 3000
            });
        }
    };

    const handleUpdateTutoring = () => {

        window.location.reload();

        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tutoría actualizada correctamente',
            life: 3000
        });
    };

    const handleReviewCreated = () => {
        window.location.reload();
    };

    const canLeaveReview = () => {
        if (!currentUser || isOwner) return false;
        
        const hasReviewed = reviews.some(review => review.studentId === currentUser.id);
        return !hasReviewed;
    };

    useEffect(() => {
        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(parseFloat((totalRating / reviews.length).toFixed(1)));
        }
    }, [reviews]);

    const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

    const timeSlots = [];
    for (let hour = 8; hour < 22; hour++) {
        timeSlots.push(`${hour}-${hour + 1}`);
    }

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const groupedAvailabilities: { [day: string]: string[] } = {};

    daysOfWeek.forEach(day => {
        groupedAvailabilities[day] = [];
    });

    if (availableTimes && availableTimes.length > 0) {

        availableTimes.forEach(timeSlot => {
            try {
                // Obtener el índice del día con soporte para ambos formatos
                let dayIndex = -1;

                if (typeof timeSlot.day_of_week === 'number' && !isNaN(timeSlot.day_of_week)) {
                    dayIndex = timeSlot.day_of_week;
                } else if (typeof timeSlot.dayOfWeek === 'number' && !isNaN(timeSlot.dayOfWeek)) {
                    dayIndex = timeSlot.dayOfWeek;
                } else if (typeof timeSlot.day_of_week === 'string') {
                    dayIndex = parseInt(timeSlot.day_of_week, 10);
                } else if (typeof timeSlot.dayOfWeek === 'string') {
                    dayIndex = parseInt(timeSlot.dayOfWeek, 10);
                }

                if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
                    console.warn('Índice de día inválido:', dayIndex, timeSlot);
                    return;
                }

                const day = daysOfWeek[dayIndex];

                let startTime = timeSlot.start_time || timeSlot.startTime || '';
                let endTime = timeSlot.end_time || timeSlot.endTime || '';

                if (!startTime || !endTime) {
                    console.warn('Horario sin tiempo de inicio o fin:', timeSlot);
                    return;
                }

                if (startTime.includes(':')) {
                    const [startHours, startMinutes] = startTime.split(':');
                    startTime = `${startHours}:${startMinutes}`;
                }

                if (endTime.includes(':')) {
                    const [endHours, endMinutes] = endTime.split(':');
                    endTime = `${endHours}:${endMinutes}`;
                }

                const startHour = parseInt(startTime.split(':')[0], 10);
                const endHour = parseInt(endTime.split(':')[0], 10);

                const endMinutes = endTime.split(':')[1] ? parseInt(endTime.split(':')[1], 10) : 0;
                const adjustedEndHour = endMinutes > 0 ? endHour + 1 : endHour;

                for (let hour = startHour; hour < adjustedEndHour; hour++) {
                    const timeSlotStr = `${hour}-${hour + 1}`;
                    if (!groupedAvailabilities[day].includes(timeSlotStr)) {
                        groupedAvailabilities[day].push(timeSlotStr);
                    }
                }
            } catch (error) {
                console.error('Error al procesar horario:', error, timeSlot);
            }
        });
    } else {
        console.warn('No hay horarios disponibles o el formato no es válido:', availableTimes);
    }

    const getTutorName = () => {
        if (tutor) {
            return `${tutor.firstName} ${tutor.lastName}`;
        } else {
            return 'Tutor no disponible';
        }
    }

    const learningPoints = Array.isArray(whatTheyWillLearn)
        ? whatTheyWillLearn
        : typeof whatTheyWillLearn === 'object' && whatTheyWillLearn !== null
            ? Object.values(whatTheyWillLearn)
            : [];

    const customStyles = `
    .p-rating .p-rating-item .p-rating-icon {
      color: #f05c5c;
    }
    
    .p-rating .p-rating-item:not(.p-rating-item-active) .p-rating-icon {
      color: rgba(240, 92, 92, 0.4);
    }
    
    .p-rating:not(.p-disabled):not(.p-readonly) .p-rating-item:hover .p-rating-icon {
      color: #d14949;
    }
  `;

    return (
        <div className="w-full">
            <Toast ref={toast} />

            <DeleteTutoringModal
                visible={deleteModalVisible}
                onHide={() => setDeleteModalVisible(false)}
                onDelete={handleDeleteTutoring}
                tutoring={tutoring}
            />
            {isOwner && (
                <EditTutoringModal
                    visible={editModalVisible}
                    onHide={() => setEditModalVisible(false)}
                    onSave={handleUpdateTutoring}
                    currentUser={tutor as User}
                    tutoring={tutoring}
                />
            )}            
            <CreateReviewModal
                visible={reviewModalVisible}
                onHide={() => setReviewModalVisible(false)}
                onReviewCreated={handleReviewCreated}
                tutoringId={tutoring.id}
                currentUser={currentUser}
                tutorName={tutor ? `${tutor.firstName} ${tutor.lastName}` : undefined}
            />
            <style>{customStyles}</style>

            {/* Header con información básica */}
            <div className="w-full bg-[#252525]">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex gap-2 mb-4">
                        {course && (
                            <>
                                <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded-full text-xs font-medium">
                                    {course.semesterNumber}° Semestre
                                </span>
                                <span className="px-2 py-1 bg-green-600/20 text-green-500 rounded-full text-xs font-medium">
                                    {course.name}
                                </span>
                            </>
                        )}
                        {!course && (
                            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-medium">
                                Tutoría
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-white mb-4">{description}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-red-600 font-semibold text-lg">
                            {averageRating.toFixed(1)}
                        </span>
                        <Rating
                            value={Math.round(averageRating)}
                            readOnly
                            cancel={false}
                        />
                        <span className="text-white text-sm">({reviews.length} reseñas)</span>
                    </div>                    <div className="flex items-center gap-3 mt-4 mb-4">
                        {tutor && (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <Avatar user={tutor} size="sm" className="mr-2" />
                                        <Link to={`/profile/${tutor.id}`} className="text-red-600 hover:underline">
                                            {getTutorName()}
                                        </Link>
                                    </div>
                                    {/* Solo mostrar botón "Ver Tutorías" si es tutor */}
                                    {tutor.role === 'tutor' && (
                                        <Link 
                                            to={`/tutor/${tutor.id}/tutorings`}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all"
                                        >
                                            Ver Tutorías
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="w-full bg-[#303031]">
                <div className="container mx-auto py-4 px-4">
                    <div className="flex flex-col-reverse lg:flex-row gap-8 mb-8">
                        {/* Contenido izquierdo (aprendizaje + horarios + reseñas) */}
                        <div className="w-full lg:w-3/4 flex flex-col gap-6">
                            {/* Sección: What you will learn */}
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <h2 className="text-xl font-semibold mb-6">Lo que aprenderás</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {learningPoints.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">
                                                <Check size={18} />
                                            </span>
                                            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>                            
                            {/* Sección: Horarios disponibles */}
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Horarios disponibles del tutor</h2>
                                    <button
                                        onClick={() => setScheduleModalVisible(true)}
                                        className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-all flex items-center gap-2"
                                    >
                                        <Expand size={16} />
                                        Expandir horario
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse min-w-[600px] table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="w-1/8 p-2"></th>
                                                {daysOfWeek.map(day => (
                                                    <th key={day} className="w-1/8 text-center p-2 text-sm text-white uppercase font-bold">
                                                        {day.slice(0, 3)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timeSlots.map(timeSlot => (
                                                <tr key={timeSlot}>
                                                    <td className="w-1/8 text-center p-1 text-sm text-gray-400">{timeSlot}h</td>
                                                    {daysOfWeek.map(day => {
                                                        const isAvailable = groupedAvailabilities[day]?.includes(timeSlot);
                                                        return (
                                                            <td key={`${day}-${timeSlot}`} className="w-1/8 p-1">
                                                                <div
                                                                    className={`h-10 flex items-center justify-center rounded 
                                                                    ${isAvailable
                                                                            ? 'bg-green-600 text-white font-bold'
                                                                            : 'border border-[#4a4a4a] text-gray-500'
                                                                        }`}
                                                                >
                                                                    {isAvailable ? <Check size={16} /> : ''}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Reseñas de estudiantes</h2>
                                    {canLeaveReview() && (
                                        <button
                                            onClick={() => setReviewModalVisible(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all"
                                        >
                                            <Star size={16} />
                                            <span>Dejar Reseña</span>
                                        </button>
                                    )}                                </div>
                                {reviews && reviews.length > 0 ? (
                                    <ReviewList 
                                        reviews={reviews} 
                                        currentUserId={currentUser?.id}
                                        onReviewUpdated={handleReviewCreated}
                                        onReviewDeleted={handleReviewCreated}
                                        tutorName={tutor ? `${tutor.firstName} ${tutor.lastName}` : undefined}
                                    />
                                ) : (
                                    <p className="text-gray-400">Aún no hay reseñas. ¡Sé el primero en dejar una reseña!</p>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-1/4">
                            <div className="bg-[#252525] p-6 sticky top-6 rounded-lg border border-[#4a4a4a]">
                                <img
                                    src={imageUrl || defaultImageUrl}
                                    alt={title}
                                    className="w-full aspect-video object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-xl font-bold mb-2">{title}</h3>
                                <p className="text-2xl font-bold text-[#f05c5c] my-3">S/. {price.toFixed(2)} </p>
                                {isOwner ? (
                                    <button
                                        onClick={() => setEditModalVisible(true)}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all my-4 flex items-center justify-center gap-2"
                                    >
                                        <Edit size={18} />
                                        <span>Editar Tutoría</span>
                                    </button>
                                ) : (
                                    <button 
                                        className="w-full py-3 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all my-4"
                                        onClick={() => setContactModalVisible(true)}
                                    >
                                        Solicitar Tutoría
                                    </button>
                                )}
                                {isOwner && (
                                    <button
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all mb-4 flex items-center justify-center gap-2"
                                    >
                                        <Trash size={18} />
                                        <span>Eliminar tutoría</span>
                                    </button>
                                )}

                                <div className="w-full text-sm text-gray-300">
                                    <p className="font-semibold text-white mb-2">Esta tutoría incluye:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <Users size={16} className="text-[#f05c5c]" />
                                            <span>Sesiones personalizadas</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Monitor size={16} className="text-[#f05c5c]" />
                                            <span>Modalidad: 100% virtual</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>            <ContactTutorModal 
                visible={contactModalVisible}
                onHide={() => setContactModalVisible(false)}
                tutor={tutor}
            />

            {/* Modal de horarios expandidos */}
            <Dialog
                visible={scheduleModalVisible}
                onHide={() => setScheduleModalVisible(false)}
                style={{ width: '95%', maxWidth: '1000px' }}
                modal
                header={
                    <div className="w-full flex justify-between items-center text-white">
                        <h2 className="text-xl font-semibold">Horarios disponibles - {tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Tutor'}</h2>
                        <button
                            onClick={() => setScheduleModalVisible(false)}
                            className="text-white bg-transparent hover:text-gray-400"
                        >
                            ✕
                        </button>
                    </div>
                }
                footer={false}
                className="border-none shadow-xl"
                draggable={false}
                resizable={false}
                closable={false}
                contentClassName="bg-[#1f1f1f] text-white p-6"
            >
                <div className="space-y-4">
                    <div className="text-center mb-6">
                        <p className="text-gray-300 text-sm">
                            Los horarios marcados en verde indican disponibilidad del tutor
                        </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px] table-fixed">
                            <thead>
                                <tr>
                                    <th className="w-20 p-3 text-center text-gray-400 font-semibold">Hora</th>
                                    {daysOfWeek.map(day => (
                                        <th key={day} className="text-center p-3 text-white uppercase font-bold text-sm">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map(timeSlot => (
                                    <tr key={timeSlot} className="border-b border-gray-700">
                                        <td className="text-center p-3 text-gray-400 font-medium">
                                            {timeSlot}h
                                        </td>
                                        {daysOfWeek.map(day => {
                                            const isAvailable = groupedAvailabilities[day]?.includes(timeSlot);
                                            return (
                                                <td key={`${day}-${timeSlot}`} className="p-2">
                                                    <div
                                                        className={`h-12 flex items-center justify-center rounded-lg transition-all duration-200
                                                        ${isAvailable
                                                                ? 'bg-green-600 text-white font-bold shadow-lg scale-105'
                                                                : 'border-2 border-gray-600 text-gray-500 bg-transparent'
                                                            }`}
                                                    >
                                                        {isAvailable ? (
                                                            <div className="flex items-center gap-1">
                                                                <Check size={18} />
                                                                <span className="text-xs">Disponible</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs">No disponible</span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <div className="flex justify-center items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                                <span className="text-gray-300">Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-600 bg-gray-800 rounded"></div>
                                <span className="text-gray-300">No disponible</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default TutoringDetails;