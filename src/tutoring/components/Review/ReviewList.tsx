import React from 'react';
import ReviewCard from './ReviewCard';
import { TutoringReview } from '../../types/Tutoring';

interface ReviewListProps {
    reviews: TutoringReview[];
    currentUserId?: string;
    onReviewUpdated?: () => void;
    onReviewDeleted?: () => void;
    tutorName?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
    reviews, 
    currentUserId, 
    onReviewUpdated, 
    onReviewDeleted, 
    tutorName 
}) => {
    return (
        <div className="flex flex-col gap-4">
            {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((review) => (
                    <ReviewCard 
                        key={review.id} 
                        review={review} 
                        currentUserId={currentUserId}
                        onReviewUpdated={onReviewUpdated}
                        onReviewDeleted={onReviewDeleted}
                        tutorName={tutorName}
                    />
                ))
            ) : (
                <p className="text-gray-400 text-sm">No hay reseñas disponibles.</p>
            )}
        </div>
    );
};

export default ReviewList;