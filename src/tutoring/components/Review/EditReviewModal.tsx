import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { TutoringReview } from '../../types/Tutoring';
import { TutoringService } from '../../services/TutoringService';

interface EditReviewModalProps {
  visible: boolean;
  onHide: () => void;
  onReviewUpdated: () => void;
  review: TutoringReview;
  tutorName?: string;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  visible,
  onHide,
  onReviewUpdated,
  review,
  tutorName
}) => {
  const [rating, setRating] = useState<number>(review.rating);
  const [comment, setComment] = useState<string>(review.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  // Resetear valores cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setRating(review.rating);
      setComment(review.comment || '');
    }
  }, [visible, review]);

  const handleSubmit = async () => {
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
        rating: rating,
        comment: comment.trim()
      };

      await TutoringService.updateReview(review.id, reviewData);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tu reseña ha sido actualizada correctamente',
        life: 3000
      });
      
      // Notificar al componente padre
      onReviewUpdated();
      
      // Cerrar el modal
      onHide();

    } catch (error: any) {
      console.error('Error al actualizar reseña:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Error al actualizar la reseña. Inténtalo de nuevo.';

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
    setRating(review.rating);
    setComment(review.comment || '');
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
        label={isSubmitting ? "Actualizando..." : "Actualizar Reseña"} 
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
        header={`Editar reseña${tutorName ? ` de ${tutorName}` : ''}`}
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
          {/* Información del usuario */}
          {review.student && (
            <div className="flex items-center gap-3 p-4 bg-[#1e1e1e] rounded-lg">
              {review.student.avatar ? (
                <img 
                  src={review.student.avatar} 
                  alt={`${review.student.firstName} ${review.student.lastName}`} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                  {review.student.firstName?.charAt(0)?.toUpperCase()}
                  {review.student.lastName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-white font-medium">
                  {review.student.firstName} {review.student.lastName}
                </h4>
                <p className="text-gray-400 text-sm">Editando reseña</p>
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
              placeholder="Actualiza tu experiencia con esta tutoría..."
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
        </div>
      </Dialog>
    </>
  );
};

export default EditReviewModal;
