import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { TutoringService } from '../../services/TutoringService';
import { User } from '../../../user/types/User';

interface CreateReviewModalProps {
  visible: boolean;
  onHide: () => void;
  onReviewCreated: () => void;
  tutoringId: string;
  currentUser: User | null;
  tutorName?: string;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  visible,
  onHide,
  onReviewCreated,
  tutoringId,
  currentUser,
  tutorName
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Debes estar autenticado para dejar una reseña',
        life: 3000
      });
      return;
    }

    if (rating === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, selecciona una calificación',
        life: 3000
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'El comentario debe tener al menos 10 caracteres',
        life: 3000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        studentId: currentUser.id,
        rating: rating,
        comment: comment.trim()
      };

      await TutoringService.addReview(tutoringId, reviewData);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tu reseña ha sido enviada correctamente',
        life: 3000
      });

      // Resetear el formulario
      setRating(0);
      setComment('');
      
      // Notificar al componente padre
      onReviewCreated();
      
      // Cerrar el modal
      onHide();

    } catch (error: any) {
      console.error('Error al crear reseña:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Error al enviar la reseña. Inténtalo de nuevo.';

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    onHide();
  };

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

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        onClick={handleCancel}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button 
        label={isSubmitting ? "Enviando..." : "Enviar Reseña"} 
        icon="pi pi-check" 
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={rating === 0 || comment.trim().length < 10}
        className="bg-[#f05c5c] border-[#f05c5c] hover:bg-[#d14949] hover:border-[#d14949]"
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <style>{customStyles}</style>
      <Dialog
        header={`Evaluar tutoría${tutorName ? ` de ${tutorName}` : ''}`}
        visible={visible}
        onHide={handleCancel}
        footer={footerContent}
        className="w-full max-w-2xl mx-4"
        modal
        draggable={false}
        resizable={false}
        style={{ 
          backgroundColor: '#252525',
          border: '1px solid #4a4a4a'
        }}
        headerStyle={{
          backgroundColor: '#252525',
          borderBottom: '1px solid #4a4a4a',
          color: 'white'
        }}
        contentStyle={{
          backgroundColor: '#252525',
          color: 'white'
        }}
      >
        <div className="flex flex-col gap-6 p-4">
          {currentUser && (
            <div className="flex items-center gap-3 p-4 bg-[#1e1e1e] rounded-lg">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={`${currentUser.firstName} ${currentUser.lastName}`} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                  {currentUser.firstName?.charAt(0)?.toUpperCase()}
                  {currentUser.lastName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-white font-medium">
                  {currentUser.firstName} {currentUser.lastName}
                </h4>
                <p className="text-gray-400 text-sm">Escribiendo como estudiante</p>
              </div>
            </div>
          )}

          {/* Calificación */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium">
              Calificación *
            </label>
            <div className="flex items-center gap-3">
              <Rating
                value={rating}
                onChange={(e) => setRating(e.value || 0)}
                stars={5}
                cancel={false}
              />
              <span className="text-gray-300 text-sm">
                {rating > 0 ? `${rating}/5` : 'Selecciona una calificación'}
              </span>
            </div>
          </div>

          {/* Comentario */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium">
              Comentario *
            </label>
            <InputTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con esta tutoría. ¿Qué te gustó? ¿Qué aprendiste? ¿Recomendarías al tutor?"
              rows={5}
              maxLength={500}
              className="w-full p-3 bg-[#1e1e1e] border border-[#4a4a4a] rounded-lg text-white placeholder-gray-400 focus:border-[#f05c5c] focus:ring-1 focus:ring-[#f05c5c]"
              style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #4a4a4a',
                color: 'white'
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">
                Mínimo 10 caracteres
              </span>
              <span className="text-gray-400 text-xs">
                {comment.length}/500
              </span>
            </div>
          </div>

          {/* Guías para una buena reseña */}
          <div className="p-4 bg-[#1e1e1e] rounded-lg border border-[#4a4a4a]">
            <h5 className="text-white font-medium mb-2">💡 Consejos para una buena reseña:</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Sé específico sobre lo que aprendiste</li>
              <li>• Menciona la calidad de la explicación del tutor</li>
              <li>• Comenta sobre la puntualidad y preparación</li>
              <li>• Mantén un tono constructivo y respetuoso</li>
            </ul>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CreateReviewModal;
