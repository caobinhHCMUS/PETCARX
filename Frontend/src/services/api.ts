import axios from 'axios';
import type { Pet, Appointment, MedicalRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API Functions
export const api = {
    // Auth
    login: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', {
            username: credentials.email || credentials.username,
            password: credentials.password,
        });
        return response.data.data;
    },

    register: async (userData: any) => {
        const response = await apiClient.post('/auth/signup', userData);
        return response.data.data;
    },

    // Pets
    getPets: async (customerId: string): Promise<Pet[]> => {
        const response = await apiClient.get(`/customer/${customerId}/pets`);
        return response.data.data;
    },

    getPetById: async (id: string): Promise<Pet | null> => {
        console.log('Fetching pet by id:', id);
        return null;
    },

    // Appointments
    getAppointments: async (userId: string, role: string): Promise<Appointment[]> => {
        let endpoint = '';
        if (role === 'customer') {
            endpoint = `/customer/${userId}/appointments`;
        } else if (role === 'doctor') {
            endpoint = `/doctor/${userId}/appointments`;
        }
        const response = await apiClient.get(endpoint);
        return response.data.data;
    },

    createAppointment: async (data: Partial<Appointment>): Promise<Appointment> => {
        const response = await apiClient.post('/customer/appointments', {
            petId: data.petId,
            doctorId: data.doctorId,
            date: data.date,
            notes: data.notes,
        });
        return response.data.data;
    },

    // Medical Records
    getMedicalRecords: async (petId: string): Promise<MedicalRecord[]> => {
        const response = await apiClient.get(`/customer/pets/${petId}/history`);
        return response.data.data;
    },

    createMedicalRecord: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
        const response = await apiClient.post('/doctor/BS001/medical-records', {
            petId: data.petId,
            symptoms: data.metadata?.symptoms || '',
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            reExamDate: data.metadata?.reExamDate,
        });
        return response.data.data;
    },

    // Stats (for dashboards)
    getCustomerStats: async (customerId: string) => {
        const response = await apiClient.get(`/customer/${customerId}/stats`);
        return response.data.data;
    },

    getDoctorStats: async (doctorId: string) => {
        const response = await apiClient.get(`/doctor/${doctorId}/stats`);
        return response.data.data;
    },

    getAdminStats: async () => {
        const response = await apiClient.get('/admin/stats');
        return response.data.data;
    },

    getRevenueReport: async (filters?: { branch?: string; month?: number; year?: number }) => {
        const response = await apiClient.get('/admin/revenue', { params: filters });
        return response.data.data;
    },
};

// Error handling interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
