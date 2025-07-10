export type MembershipType = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type MembershipStatus = 'pending' | 'active' | 'rejected';

export interface MembershipEntity {
  id: string;
  user_id: string;
  type: MembershipType;
  status: MembershipStatus;
  payment_proof?: string | null;
  created_at: string;
}
