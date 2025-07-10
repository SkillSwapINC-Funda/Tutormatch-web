import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Course } from '../../course/types/Course';
import { User } from '../../user/types/User';
import TimeSlotSelectorBySection from '../../schedule/components/TimeSelectorBySection';
import { SemesterService } from '../../dashboard/services/SemesterService';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringImageService } from '../../tutoring/services/TutoringImageService';
import { TutoringSession } from '../../tutoring/types/Tutoring';

// Props para el componente modal
interface EditTutoringModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (tutoring: any) => void;
  currentUser: User;
  tutoring: TutoringSession;
}

const EditTutoringModal: React.FC<EditTutoringModalProps> = ({
  visible,
  onHide,
  onSave,
  currentUser,
  tutoring
}) => {
  const toast = useRef<Toast>(null);

  // Estado para los semestres y cursos
  const [semesters, setSemesters] = useState<{ id: number; name: string; courses: Course[] }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Estado del formulario
  const [description, setDescription] = useState<string>(tutoring.description || '');
  const [price, setPrice] = useState<number>(tutoring.price || 0);
  const [whatTheyWillLearn, setWhatTheyWillLearn] = useState<string>('');
  const [courseImage, setCourseImage] = useState<string | undefined | null>(tutoring.imageUrl);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(true); // Por defecto true en edición
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Franjas horarias y días de la semana
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayMapping: Record<string, number> = {
    'SUN': 0,
    'MON': 1,
    'TUE': 2,
    'WED': 3,
    'THU': 4,
    'FRI': 5,
    'SAT': 6
  };
  const dayInverseMapping: Record<number, string> = {
    0: 'SUN',
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT'
  };
  const morningTimeSlots = ['08-09', '09-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  const allTimeSlots = [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots];
  const [availableTimes, setAvailableTimes] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>({});

  // Cargar los semestres desde el servicio
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await SemesterService.getSemesters();
        setSemesters(data);
        
        // Buscar el semestre del curso actual
        if (tutoring.courseId) {
          for (const semester of data) {
            const course = semester.courses.find((c: Course) => c.id === tutoring.courseId);
            if (course) {
              setSelectedSemester(semester.name);
              setAvailableCourses(semester.courses);
              setSelectedCourse(course);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los semestres.',
          life: 3000,
        });
      }
    };

    fetchSemesters();
  }, [tutoring.courseId]);

  // Inicializar las franjas horarias con los datos existentes
  useEffect(() => {
    initializeTimeSlots();
    
    // Convertir el array whatTheyWillLearn a string para el textarea
    if (Array.isArray(tutoring.whatTheyWillLearn)) {
      setWhatTheyWillLearn(tutoring.whatTheyWillLearn.join('\n'));
    } else if (typeof tutoring.whatTheyWillLearn === 'object' && tutoring.whatTheyWillLearn !== null) {
      setWhatTheyWillLearn(Object.values(tutoring.whatTheyWillLearn).join('\n'));
    }
  }, [tutoring]);

  // Verificar validez del formulario cuando cambian los valores
  useEffect(() => {
    checkFormValidity();
  }, [selectedSemester, selectedCourse, description, price, whatTheyWillLearn, courseImage, availableTimes]);

  // Inicializar slots de tiempo con los datos de la tutoría
  const initializeTimeSlots = () => {
    const times: { [day: string]: { [timeSlot: string]: boolean } } = {};
    
    // Inicializar todos los días y slots a false
    for (let day of daysOfWeek) {
      times[day] = {};
      for (let timeSlot of allTimeSlots) {
        times[day][timeSlot] = false;
      }
    }
    
    // Marcar los slots disponibles según la tutoría existente
    if (tutoring.availableTimes && tutoring.availableTimes.length > 0) {
      tutoring.availableTimes.forEach(slot => {
        try {
          // Obtener el día y hora
          let dayIndex = -1;
          
          if (typeof slot.dayOfWeek === 'number') {
            dayIndex = slot.dayOfWeek;
          } else if (typeof slot.day_of_week === 'number') {
            dayIndex = slot.day_of_week;
          } else if (typeof slot.dayOfWeek === 'string') {
            dayIndex = parseInt(slot.dayOfWeek);
          } else if (typeof slot.day_of_week === 'string') {
            dayIndex = parseInt(slot.day_of_week);
          }
          
          if (dayIndex >= 0 && dayIndex <= 6) {
            const day = dayInverseMapping[dayIndex];
            
            // Extraer la hora de inicio y fin
            const startHour = slot.startTime ? parseInt(slot.startTime.split(':')[0]) :
                             slot.start_time ? parseInt(slot.start_time.split(':')[0]) : -1;
            
            const endHour = slot.endTime ? parseInt(slot.endTime.split(':')[0]) :
                           slot.end_time ? parseInt(slot.end_time.split(':')[0]) : -1;
            
            if (startHour >= 0 && endHour >= 0) {
              const timeSlot = `${startHour}-${endHour}`;
              
              // Si el slot existe en nuestro array de slots, marcarlo como disponible
              if (times[day] && allTimeSlots.includes(timeSlot)) {
                times[day][timeSlot] = true;
              }
            }
          }
        } catch (error) {
          console.error('Error al procesar horario disponible:', error, slot);
        }
      });
    }
    
    setAvailableTimes(times);
  };

  // Manejar selección de semestre
  const onSemesterSelected = (semesterName: string) => {
    setSelectedSemester(semesterName);
    const selectedSemesterObj = semesters.find((sem) => sem.name === semesterName);
    setAvailableCourses(selectedSemesterObj ? selectedSemesterObj.courses : []);
    if (!selectedSemesterObj?.courses.find(c => c.id === selectedCourse?.id)) {
      setSelectedCourse(null);
    }
  };

  // Validar formulario
  const checkFormValidity = () => {
    const valid =
      selectedSemester !== '' &&
      selectedCourse !== null &&
      description !== '' &&
      price > 0 &&
      whatTheyWillLearn !== '' &&
      (courseImage !== undefined || originalFile !== null) &&
      areTimeSlotsSelected();

    setIsFormValid(valid);
  };

  // Verificar si hay slots de tiempo seleccionados
  const areTimeSlotsSelected = (): boolean => {
    for (let day of daysOfWeek) {
      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          return true;
        }
      }
    }
    return false;
  };

  // Manejar subida de archivo
  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.');
        setImageUploaded(false);
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrorMessage('Tipo de archivo inválido. Por favor, seleccione un archivo PNG, JPEG, GIF o WebP.');
        setImageUploaded(false);
        return;
      }

      // Guardar el archivo original para subirlo después
      setOriginalFile(file);

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setCourseImage(e.target.result);
        setImageUploaded(true);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const onConfirmEditTutoring = async () => {
    if (!isFormValid || !selectedCourse) return;

    try {
      setIsSubmitting(true);

      // 1. Preparar el formato del campo whatTheyWillLearn
      const formattedWhatTheyWillLearn = whatTheyWillLearn
        .split('\n')
        .map(item => item.trim())
        .filter(item => item);

      // 2. Preparar los horarios disponibles en el formato correcto
      const availableTimeSlots = [];
      for (let day of daysOfWeek) {
        for (let timeSlot of allTimeSlots) {
          if (availableTimes[day]?.[timeSlot]) {
            const [start, end] = timeSlot.split('-');

            availableTimeSlots.push({
              dayOfWeek: dayMapping[day],
              startTime: `${start}:00`,
              endTime: `${end}:00`
            });
          }
        }
      }

      // 3. Subir la imagen si se ha cambiado
      let imageUrl = courseImage;
      if (originalFile) {
        setUploadingImage(true);
        try {
          imageUrl = await TutoringImageService.uploadTutoringImage(tutoring.id, originalFile);
          console.log('Imagen subida correctamente:', imageUrl);
        } catch (imageError: any) {
          console.error('Error al subir la imagen:', imageError);

          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: imageError.message || 'No se pudo subir la imagen. Continuando con la actualización de la tutoría.',
            life: 3000,
          });
          
          // Mantener la imagen anterior si hay error
          imageUrl = tutoring.imageUrl;
        } finally {
          setUploadingImage(false);
        }
      }

      // 4. Crear el objeto de tutoría con todos los datos actualizados
      const updatedTutoring = {
        id: tutoring.id,
        tutorId: currentUser.id,
        courseId: selectedCourse.id,
        title: selectedCourse.name,
        description,
        price: Number(price),
        whatTheyWillLearn: formattedWhatTheyWillLearn,
        imageUrl,
        availableTimes: availableTimeSlots
      };

      console.log('Enviando datos actualizados de tutoría:', updatedTutoring);

      // 5. Actualizar la tutoría con el servicio
      const result = await TutoringService.updateTutoring(tutoring.id, updatedTutoring);

      // 6. Mostrar mensaje de éxito
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tutoría actualizada correctamente.',
        life: 3000,
      });

      onSave(result);
      onHide();

    } catch (error: any) {
      console.error('Error al actualizar la tutoría:', error);

      // Mensaje de error más descriptivo
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo actualizar la tutoría. Por favor, revise los datos e inténtelo de nuevo.';

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Editar Tutoría</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: '95%', maxWidth: '600px' }}
        modal
        header={headerElement}
        footer={false}
        className="border-none shadow-xl"
        draggable={false}
        resizable={false}
        closable={false}
        contentClassName="bg-[#1f1f1f] text-white p-6"
      >
        <div className="space-y-6">
          {/* Selector de semestre */}
          <div>
            <h3 className="text-lg font-medium mb-4">Semestre del curso</h3>
            <div className="grid grid-cols-4 gap-2">
              {semesters.map((semester) => (
                <button
                  key={semester.id}
                  onClick={() => onSemesterSelected(semester.name)}
                  className={`py-2 px-3 text-center border border-gray-600 rounded ${selectedSemester === semester.name
                      ? 'bg-primary text-white'
                      : 'bg-[#1f1f1f] text-white hover:border-gray-400'
                    }`}
                >
                  {semester.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Nombre del curso</h3>
            <Dropdown
              value={selectedCourse}
              options={availableCourses}
              onChange={(e) => setSelectedCourse(e.value)}
              optionLabel="name"
              placeholder="Seleccionar curso"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
          </div>

          {/* Descripción del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Descripción</h3>
            <InputTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Ingresa la descripción de tu tutoría"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
          </div>

          {/* Precio del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Precio</h3>
            <div className="flex items-center">
              <span className="text-white mr-2">S/.</span>
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setPrice(value > 0 ? value : 0);
                }}
                min="0.01"
                step="0.01"
                placeholder="Ingresa el precio"
                className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Imagen del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Imagen del curso</h3>
            <div className="space-y-2">
              {/* Mostrar imagen actual o botón para subir */}
              {!originalFile && courseImage ? (
                <div className="mt-3 relative">
                  <img
                    src={courseImage}
                    alt="Imagen actual"
                    className="max-w-full h-auto max-h-48 rounded"
                  />
                  <div className="flex items-center space-x-4 mt-2">
                    <label
                      htmlFor="file-upload"
                      className="block text-center text-sm text-white py-2 px-4 rounded bg-blue-500 font-semibold cursor-pointer hover:bg-blue-600"
                    >
                      Cambiar imagen
                    </label>
                    <button
                      onClick={() => {
                        setCourseImage(undefined);
                        setOriginalFile(null);
                        setImageUploaded(false);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Quitar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Si no hay imagen o se ha quitado, mostrar botón para subir */}
                  <div className="flex items-center space-x-4">
                    <label
                      htmlFor="file-upload"
                      className={`block text-center text-sm text-white py-2 px-4 rounded bg-red-500 font-semibold cursor-pointer hover:bg-red-600 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Subir imagen
                    </label>
                    <span className="text-sm text-gray-400">Sube una imagen para tu tutoría</span>
                  </div>
                  
                  {/* Vista previa de la nueva imagen */}
                  {originalFile && (
                    <div className="mt-3 relative">
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#1f1f1f" animationDuration=".5s" />
                        </div>
                      )}
                      <img
                        src={courseImage || undefined}
                        alt="Nueva imagen"
                        className="max-w-full h-auto max-h-48 rounded"
                      />
                      <button
                        onClick={() => {
                          setCourseImage(tutoring.imageUrl);
                          setOriginalFile(null);
                          setImageUploaded(false);
                          setErrorMessage('');
                        }}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        disabled={uploadingImage}
                      >
                        Cancelar cambio
                      </button>
                    </div>
                  )}
                </>
              )}
              
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={onFileUpload}
                className="hidden"
                disabled={uploadingImage}
              />

              {/* Mensajes de éxito o error */}
              {imageUploaded && (
                <p className="text-sm text-green-500">Imagen lista para subir</p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Qué aprenderán */}
          <div>
            <h3 className="text-lg font-medium mb-4">¿Qué aprenderán?</h3>
            <InputTextarea
              value={whatTheyWillLearn}
              onChange={(e) => setWhatTheyWillLearn(e.target.value)}
              rows={4}
              placeholder="Ingresa lo que aprenderán tus estudiantes"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
            <p className="text-xs text-gray-400 mt-1">Separa cada punto de aprendizaje con un salto de línea</p>
          </div>

          {/* Horarios disponibles */}
          <div>
            <h3 className="text-lg font-medium mb-2">Tus horarios disponibles</h3>
            <p className="text-sm text-gray-400 mb-4">Haz clic en las franjas horarias para marcar tu disponibilidad</p>

            <TimeSlotSelectorBySection
              days={daysOfWeek}
              initialSelectedSlots={availableTimes}
              onChange={(newSelectedSlots) => {
                setAvailableTimes(newSelectedSlots);
              }}
            />
          </div>

          {/* Botón para guardar cambios */}
          <div className="flex justify-end pt-4">
            <button
              className={`px-4 py-2 rounded ${isFormValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-700 cursor-not-allowed'} text-white relative`}
              onClick={onConfirmEditTutoring}
              disabled={!isFormValid || isSubmitting || uploadingImage}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" fill="none" animationDuration=".5s" className="mr-2" />
                  Guardando...
                </span>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EditTutoringModal;