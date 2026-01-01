export type UserRole = 'customer' | 'doctor' | 'admin';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface Pet {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    ownerId: string;
}

export interface Appointment {
    id: string;
    petId: string;
    petName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

export interface MedicalRecord {
    id: string;
    petId: string;
    date: string;
    diagnosis: string;
    treatment: string;
    metadata?: Record<string, unknown>;
}
