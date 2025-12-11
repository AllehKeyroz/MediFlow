import { Timestamp } from 'firebase/firestore';
import React from 'react';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  specialty?: string;
  photoURL?: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  status: 'Lead' | 'Agendado' | 'Em Tratamento' | 'Finalizado';
  createdAt: Timestamp; 
}

export interface Deal {
  id: string;
  userId: string;
  patientName: string;
  value: number;
  status: 'Interessados' | 'Agendados' | 'Em Tratamento' | 'Finalizados';
  createdAt: Timestamp;
}

export interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}