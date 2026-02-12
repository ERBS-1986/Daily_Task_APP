import { DailyWorkout } from '../types';

export const WORKOUT_TEMPLATES: Omit<DailyWorkout, 'day'>[] = [
    {
        focus: 'Peito e Tríceps',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
        exercises: [
            { id: crypto.randomUUID(), name: 'Supino Reto', sets: 4, reps: '10-12', weight: '60', completed: false, gifUrl: 'https://i.pinimg.com/originals/7c/1b/e3/7c1be32f26fb96311c146b678d4e42f8.gif' },
            { id: crypto.randomUUID(), name: 'Supino Inclinado', sets: 3, reps: '12', weight: '50', completed: false },
            { id: crypto.randomUUID(), name: 'Crucifixo', sets: 3, reps: '12-15', completed: false },
            { id: crypto.randomUUID(), name: 'Tríceps Testa', sets: 3, reps: '12', weight: '30', completed: false },
            { id: crypto.randomUUID(), name: 'Tríceps Corda', sets: 3, reps: '15', completed: false }
        ]
    },
    {
        focus: 'Costas e Bíceps',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800',
        exercises: [
            { id: crypto.randomUUID(), name: 'Barra Fixa', sets: 4, reps: '8-10', completed: false },
            { id: crypto.randomUUID(), name: 'Remada Curvada', sets: 4, reps: '10', weight: '70', completed: false },
            { id: crypto.randomUUID(), name: 'Pulldown', sets: 3, reps: '12', completed: false },
            { id: crypto.randomUUID(), name: 'Rosca Direta', sets: 3, reps: '12', weight: '20', completed: false },
            { id: crypto.randomUUID(), name: 'Rosca Martelo', sets: 3, reps: '12', weight: '18', completed: false }
        ]
    },
    {
        focus: 'Pernas',
        image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800',
        exercises: [
            { id: crypto.randomUUID(), name: 'Agachamento Livre', sets: 4, reps: '10', weight: '100', completed: false },
            { id: crypto.randomUUID(), name: 'Leg Press', sets: 4, reps: '12', weight: '200', completed: false },
            { id: crypto.randomUUID(), name: 'Cadeira Extensora', sets: 3, reps: '15', completed: false },
            { id: crypto.randomUUID(), name: 'Mesa Flexora', sets: 3, reps: '12', completed: false },
            { id: crypto.randomUUID(), name: 'Panturrilha em Pé', sets: 4, reps: '20', completed: false }
        ]
    },
    {
        focus: 'Ombros e Abdômen',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800',
        exercises: [
            { id: crypto.randomUUID(), name: 'Desenvolvimento', sets: 4, reps: '10', weight: '40', completed: false },
            { id: crypto.randomUUID(), name: 'Elevação Lateral', sets: 4, reps: '12', weight: '12', completed: false },
            { id: crypto.randomUUID(), name: 'Elevação Frontal', sets: 3, reps: '12', weight: '10', completed: false },
            { id: crypto.randomUUID(), name: 'Remada Alta', sets: 3, reps: '12', completed: false },
            { id: crypto.randomUUID(), name: 'Abdominal Supra', sets: 3, reps: '20', completed: false }
        ]
    },
    {
        focus: 'Full Body',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        exercises: [
            { id: crypto.randomUUID(), name: 'Burpees', sets: 3, reps: '15', completed: false },
            { id: crypto.randomUUID(), name: 'Flexão', sets: 3, reps: '20', completed: false },
            { id: crypto.randomUUID(), name: 'Agachamento Jump', sets: 3, reps: '15', completed: false },
            { id: crypto.randomUUID(), name: 'Prancha', sets: 3, reps: '60s', completed: false },
            { id: crypto.randomUUID(), name: 'Mountain Climbers', sets: 3, reps: '20', completed: false }
        ]
    }
];

export const DAYS_OF_WEEK = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo'
];
