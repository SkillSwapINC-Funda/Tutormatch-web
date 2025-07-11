import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_TUTORMATCH_MICROSERVICES;

export interface CreateVideoCallDto {
  jitsiRoomName: string;
  roomId?: string;
  tutoringSessionId?: string;
  scheduledFor?: string;
}

export interface JoinVideoCallDto {
  callId: string;
}

export interface EndVideoCallDto {
  callId: string;
  recordingUrl?: string;
  durationMinutes?: number;
}

export interface VideoCall {
  id: string;
  jitsiRoomName: string;
  status: 'scheduled' | 'active' | 'ended';
  createdBy: string;
  roomId?: string;
  tutoringSessionId?: string;
  scheduledFor?: string;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
  durationMinutes?: number;
}

export interface VideoCallParticipant {
  id: string;
  callId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  durationMinutes?: number;
}

class VideoCallService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Función para mapear respuesta del backend a formato frontend
  private mapVideoCallResponse(backendData: any): VideoCall {
    return {
      id: backendData.id,
      jitsiRoomName: backendData.jitsi_room_name || backendData.jitsiRoomName,
      status: backendData.status,
      createdBy: backendData.started_by || backendData.createdBy,
      roomId: backendData.room_id || backendData.roomId,
      tutoringSessionId: backendData.tutoring_session_id || backendData.tutoringSessionId,
      scheduledFor: backendData.scheduled_for || backendData.scheduledFor,
      startedAt: backendData.started_at || backendData.startedAt,
      endedAt: backendData.ended_at || backendData.endedAt,
      recordingUrl: backendData.recording_url || backendData.recordingUrl,
      durationMinutes: backendData.duration_minutes || backendData.durationMinutes
    };
  }

  async createVideoCall(data: CreateVideoCallDto): Promise<VideoCall> {
    const response = await axios.post(
      `${API_BASE_URL}/api/classroom/video-calls`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return this.mapVideoCallResponse(response.data);
  }

  async joinVideoCall(data: JoinVideoCallDto): Promise<VideoCall> {
    const response = await axios.post(
      `${API_BASE_URL}/api/classroom/video-calls/join`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return this.mapVideoCallResponse(response.data);
  }

  async leaveVideoCall(callId: string): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/classroom/video-calls/${callId}/leave`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async endVideoCall(data: EndVideoCallDto): Promise<{ message: string }> {
    const response = await axios.patch(
      `${API_BASE_URL}/api/classroom/video-calls/${data.callId}/end`,
      {
        recordingUrl: data.recordingUrl,
        durationMinutes: data.durationMinutes
      },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getVideoCallDetails(callId: string): Promise<VideoCall> {
    const response = await axios.get(
      `${API_BASE_URL}/api/classroom/video-calls/${callId}`,
      { headers: this.getAuthHeaders() }
    );
    return this.mapVideoCallResponse(response.data);
  }

  async getActiveVideoCalls(): Promise<VideoCall[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/classroom/video-calls/active`,
      { headers: this.getAuthHeaders() }
    );
    return response.data.map((call: any) => this.mapVideoCallResponse(call));
  }

  async getVideoCallParticipants(callId: string): Promise<VideoCallParticipant[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/classroom/video-calls/${callId}/participants`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export default new VideoCallService();