export type Ejercicio = {
  nombre: string
  series: number
  /** Rango objetivo, por ejemplo "6-8". */
  reps: string
  /** Repeticiones en recámara: cuántas te sobran al terminar la serie. */
  rir: string
  descanso: string
  nota?: string
}

export type DiaRutina = {
  id: string
  nombre: string
  foco: string
  ejercicios: Ejercicio[]
}

/** Día de la semana (0 = domingo, como getDay) -> id de la rutina. */
export const SEMANA: Record<number, string | null> = {
  1: 'pierna-a',
  2: 'torso-a',
  3: null,
  4: 'pierna-b',
  5: 'torso-b',
  6: null,
  0: null,
}

export const RUTINA: Record<string, DiaRutina> = {
  'pierna-a': {
    id: 'pierna-a',
    nombre: 'Pierna A',
    foco: 'Cuádriceps dominante',
    ejercicios: [
      { nombre: 'Sentadilla con barra', series: 4, reps: '6-8', rir: '2', descanso: '3 min', nota: 'Baja hasta pasar la paralela, sin rebotar abajo.' },
      { nombre: 'Prensa 45°', series: 3, reps: '10-12', rir: '1-2', descanso: '2 min' },
      { nombre: 'Peso muerto rumano', series: 3, reps: '8-10', rir: '2', descanso: '2 min', nota: 'Barra pegada a la pierna y espalda recta; estirá el isquio sin redondear.' },
      { nombre: 'Extensión de cuádriceps', series: 3, reps: '12-15', rir: '1', descanso: '90 s' },
      { nombre: 'Curl femoral tumbado', series: 3, reps: '10-12', rir: '1', descanso: '90 s' },
      { nombre: 'Gemelo de pie', series: 4, reps: '10-15', rir: '0-1', descanso: '60 s', nota: 'Pausá un segundo arriba y estirá completo abajo.' },
      { nombre: 'Plancha abdominal', series: 3, reps: '30-45 s', rir: '—', descanso: '60 s' },
    ],
  },
  'torso-a': {
    id: 'torso-a',
    nombre: 'Torso A',
    foco: 'Énfasis en empuje',
    ejercicios: [
      { nombre: 'Press de banca', series: 4, reps: '6-8', rir: '2', descanso: '3 min' },
      { nombre: 'Remo con barra', series: 4, reps: '8-10', rir: '2', descanso: '2 min' },
      { nombre: 'Press militar con mancuernas', series: 3, reps: '8-10', rir: '1-2', descanso: '2 min' },
      { nombre: 'Jalón al pecho', series: 3, reps: '10-12', rir: '1-2', descanso: '90 s' },
      { nombre: 'Aperturas en polea o pec deck', series: 3, reps: '12-15', rir: '1', descanso: '75 s' },
      { nombre: 'Elevaciones laterales', series: 4, reps: '12-15', rir: '0-1', descanso: '60 s' },
      { nombre: 'Extensión de tríceps en polea', series: 3, reps: '10-12', rir: '1', descanso: '75 s' },
      { nombre: 'Curl de bíceps con barra Z', series: 3, reps: '10-12', rir: '1', descanso: '75 s' },
    ],
  },
  'pierna-b': {
    id: 'pierna-b',
    nombre: 'Pierna B',
    foco: 'Cadena posterior y glúteo',
    ejercicios: [
      { nombre: 'Peso muerto rumano', series: 4, reps: '6-8', rir: '2', descanso: '3 min' },
      { nombre: 'Hip thrust', series: 4, reps: '8-10', rir: '1-2', descanso: '2 min', nota: 'Apretá el glúteo arriba un segundo, costillas hacia abajo.' },
      { nombre: 'Zancada búlgara (por pierna)', series: 3, reps: '10-12', rir: '2', descanso: '90 s' },
      { nombre: 'Curl femoral sentado', series: 3, reps: '12-15', rir: '1', descanso: '90 s' },
      { nombre: 'Extensión de cuádriceps', series: 3, reps: '12-15', rir: '1', descanso: '90 s' },
      { nombre: 'Gemelo sentado', series: 4, reps: '12-15', rir: '0-1', descanso: '60 s' },
      { nombre: 'Rueda abdominal o crunch en polea', series: 3, reps: '10-15', rir: '1', descanso: '60 s' },
    ],
  },
  'torso-b': {
    id: 'torso-b',
    nombre: 'Torso B',
    foco: 'Énfasis en jalón',
    ejercicios: [
      { nombre: 'Dominadas (o jalón supino)', series: 4, reps: '6-10', rir: '2', descanso: '2.5 min', nota: 'Si te salen menos de 6, usá la máquina asistida o una banda.' },
      { nombre: 'Press inclinado con mancuernas', series: 4, reps: '8-10', rir: '2', descanso: '2.5 min' },
      { nombre: 'Remo en polea baja', series: 3, reps: '10-12', rir: '1-2', descanso: '90 s' },
      { nombre: 'Press militar en barra o máquina', series: 3, reps: '8-10', rir: '1-2', descanso: '2 min' },
      { nombre: 'Elevaciones laterales', series: 3, reps: '15-20', rir: '0-1', descanso: '60 s' },
      { nombre: 'Face pull', series: 3, reps: '15-20', rir: '1', descanso: '60 s' },
      { nombre: 'Curl martillo', series: 3, reps: '10-12', rir: '1', descanso: '75 s' },
      { nombre: 'Extensión de tríceps sobre la cabeza', series: 3, reps: '12-15', rir: '1', descanso: '75 s' },
    ],
  },
}

export const rutinaDe = (fecha: Date): DiaRutina | null => {
  const id = SEMANA[fecha.getDay()]
  return id ? RUTINA[id] : null
}

/** Serie registrada: lo que realmente levantaste. */
export type SerieHecha = { peso: number; reps: number }

/** Por fecha ISO, por nombre de ejercicio, una entrada por serie (null = pendiente). */
export type Entrenos = Record<string, Record<string, (SerieHecha | null)[]>>
