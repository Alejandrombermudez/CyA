/** Cómo se mide cada serie de un ejercicio. */
export type Medida = 'peso' | 'corporal' | 'tiempo'

export type Variante = {
  id: string
  nombre: string
  medida: Medida
  /** Cuánto subir cuando toque progresar, en kg. 0 = no aplica. */
  incremento: number
  nota?: string
}

export type Ejercicio = {
  id: string
  /** El patrón que cubre. Es lo que hace que las variantes sean intercambiables. */
  patron: string
  series: number
  /** Rango objetivo, por ejemplo "6-8". En los de tiempo, segundos. */
  reps: string
  /** Repeticiones en recámara: cuántas te sobran al terminar la serie. */
  rir: string
  descanso: string
  /** La primera es la preferida; el resto sirven si está ocupada. */
  variantes: Variante[]
}

export type DiaRutina = {
  id: string
  nombre: string
  foco: string
  ejercicios: Ejercicio[]
}

const v = (
  id: string,
  nombre: string,
  incremento: number,
  medida: Medida = 'peso',
  nota?: string,
): Variante => ({ id, nombre, medida, incremento, ...(nota ? { nota } : {}) })

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

// Grupos que se repiten entre días: se definen una vez y se reutilizan.

const RDL: Variante[] = [
  v('rdl-barra', 'Peso muerto rumano con barra', 5, 'peso', 'Barra pegada a la pierna y espalda recta; estirá el isquio sin redondear.'),
  v('rdl-mancuernas', 'Peso muerto rumano con mancuernas', 2),
  v('rdl-multipower', 'Peso muerto rumano en multipower', 5),
  v('buenos-dias', 'Buenos días con barra', 2.5),
]

const EXTENSION: Variante[] = [
  v('extension-cuadriceps', 'Extensión de cuádriceps', 5),
  v('extension-una-pierna', 'Extensión a una pierna', 2.5),
  v('sissy', 'Sentadilla sissy', 0, 'corporal'),
]

const CURL_FEMORAL: Variante[] = [
  v('curl-femoral-tumbado', 'Curl femoral tumbado', 5),
  v('curl-femoral-sentado', 'Curl femoral sentado', 5),
  v('curl-femoral-pie', 'Curl femoral de pie a una pierna', 2.5),
  v('nordico', 'Curl nórdico', 0, 'corporal'),
]

const GEMELO: Variante[] = [
  v('gemelo-pie', 'Gemelo de pie en máquina', 5, 'peso', 'Pausá un segundo arriba y estirá completo abajo.'),
  v('gemelo-sentado', 'Gemelo sentado', 5),
  v('gemelo-prensa', 'Gemelo en prensa', 10),
  v('gemelo-mancuerna', 'Gemelo a una pierna con mancuerna', 2),
]

const LATERALES: Variante[] = [
  v('laterales-mancuernas', 'Elevaciones laterales con mancuernas', 2),
  v('laterales-polea', 'Elevaciones laterales en polea', 2.5),
  v('laterales-maquina', 'Elevaciones laterales en máquina', 5),
]

const PRESS_MILITAR: Variante[] = [
  v('press-militar-mancuernas', 'Press militar con mancuernas', 2),
  v('press-militar-barra', 'Press militar con barra', 2.5),
  v('press-hombro-maquina', 'Press de hombro en máquina', 5),
  v('arnold', 'Press Arnold', 2),
]

const REMO_HORIZONTAL: Variante[] = [
  v('remo-barra', 'Remo con barra', 2.5),
  v('remo-mancuerna', 'Remo con mancuerna a una mano', 2),
  v('remo-t', 'Remo en T o máquina', 5),
  v('remo-polea-baja', 'Remo en polea baja', 5),
]

export const RUTINA: Record<string, DiaRutina> = {
  'pierna-a': {
    id: 'pierna-a',
    nombre: 'Pierna A',
    foco: 'Cuádriceps dominante',
    ejercicios: [
      {
        id: 'sentadilla',
        patron: 'Sentadilla',
        series: 4,
        reps: '6-8',
        rir: '2',
        descanso: '3 min',
        variantes: [
          v('sentadilla-barra', 'Sentadilla con barra libre', 5, 'peso', 'Baja hasta pasar la paralela, sin rebotar abajo.'),
          v('sentadilla-hack', 'Sentadilla hack en máquina', 10),
          v('sentadilla-multipower', 'Sentadilla en multipower', 5),
          v('goblet', 'Sentadilla goblet con mancuerna', 2),
        ],
      },
      {
        id: 'prensa',
        patron: 'Empuje de pierna',
        series: 3,
        reps: '10-12',
        rir: '1-2',
        descanso: '2 min',
        variantes: [
          v('prensa-45', 'Prensa 45°', 10),
          v('prensa-horizontal', 'Prensa horizontal', 5),
          v('sentadilla-hack', 'Sentadilla hack en máquina', 10),
          v('zancada-caminando', 'Zancada caminando con mancuernas', 2),
        ],
      },
      { id: 'rdl', patron: 'Bisagra de cadera', series: 3, reps: '8-10', rir: '2', descanso: '2 min', variantes: RDL },
      { id: 'extension', patron: 'Extensión de rodilla', series: 3, reps: '12-15', rir: '1', descanso: '90 s', variantes: EXTENSION },
      { id: 'curl-femoral', patron: 'Flexión de rodilla', series: 3, reps: '10-12', rir: '1', descanso: '90 s', variantes: CURL_FEMORAL },
      { id: 'gemelo', patron: 'Gemelo', series: 4, reps: '10-15', rir: '0-1', descanso: '60 s', variantes: GEMELO },
      {
        id: 'core-isometrico',
        patron: 'Core isométrico',
        series: 3,
        reps: '30-45 s',
        rir: '—',
        descanso: '60 s',
        variantes: [
          v('plancha', 'Plancha abdominal', 0, 'tiempo'),
          v('plancha-lateral', 'Plancha lateral', 0, 'tiempo'),
          v('hollow', 'Hollow hold', 0, 'tiempo'),
        ],
      },
    ],
  },

  'torso-a': {
    id: 'torso-a',
    nombre: 'Torso A',
    foco: 'Énfasis en empuje',
    ejercicios: [
      {
        id: 'press-horizontal',
        patron: 'Press horizontal',
        series: 4,
        reps: '6-8',
        rir: '2',
        descanso: '3 min',
        variantes: [
          v('press-banca-barra', 'Press de banca con barra', 2.5),
          v('press-banca-mancuernas', 'Press de banca con mancuernas', 2),
          v('press-pecho-maquina', 'Press de pecho en máquina', 5),
          v('press-banca-multipower', 'Press de banca en multipower', 2.5),
        ],
      },
      { id: 'remo', patron: 'Remo horizontal', series: 4, reps: '8-10', rir: '2', descanso: '2 min', variantes: REMO_HORIZONTAL },
      { id: 'press-vertical', patron: 'Press vertical', series: 3, reps: '8-10', rir: '1-2', descanso: '2 min', variantes: PRESS_MILITAR },
      {
        id: 'jalon',
        patron: 'Jalón vertical',
        series: 3,
        reps: '10-12',
        rir: '1-2',
        descanso: '90 s',
        variantes: [
          v('jalon-pecho', 'Jalón al pecho', 5),
          v('jalon-neutro', 'Jalón con agarre neutro', 5),
          v('jalon-supino', 'Jalón supino', 5),
          v('pullover-polea', 'Pullover en polea', 5),
        ],
      },
      {
        id: 'apertura',
        patron: 'Apertura de pecho',
        series: 3,
        reps: '12-15',
        rir: '1',
        descanso: '75 s',
        variantes: [
          v('pec-deck', 'Pec deck', 5),
          v('aperturas-polea', 'Aperturas en polea', 2.5),
          v('aperturas-mancuernas', 'Aperturas con mancuernas', 2),
        ],
      },
      { id: 'laterales', patron: 'Deltoide lateral', series: 4, reps: '12-15', rir: '0-1', descanso: '60 s', variantes: LATERALES },
      {
        id: 'triceps',
        patron: 'Extensión de codo',
        series: 3,
        reps: '10-12',
        rir: '1',
        descanso: '75 s',
        variantes: [
          v('triceps-polea', 'Extensión de tríceps en polea', 2.5),
          v('press-frances', 'Press francés con barra Z', 2.5),
          v('triceps-sobre-cabeza', 'Extensión sobre la cabeza en polea', 2.5),
          v('fondos', 'Fondos en paralelas', 2.5, 'corporal'),
        ],
      },
      {
        id: 'biceps',
        patron: 'Flexión de codo',
        series: 3,
        reps: '10-12',
        rir: '1',
        descanso: '75 s',
        variantes: [
          v('curl-barra-z', 'Curl de bíceps con barra Z', 2.5),
          v('curl-mancuernas', 'Curl con mancuernas', 2),
          v('curl-polea', 'Curl en polea', 2.5),
          v('curl-predicador', 'Curl predicador en máquina', 5),
        ],
      },
    ],
  },

  'pierna-b': {
    id: 'pierna-b',
    nombre: 'Pierna B',
    foco: 'Cadena posterior y glúteo',
    ejercicios: [
      { id: 'rdl', patron: 'Bisagra de cadera', series: 4, reps: '6-8', rir: '2', descanso: '3 min', variantes: RDL },
      {
        id: 'hip-thrust',
        patron: 'Extensión de cadera',
        series: 4,
        reps: '8-10',
        rir: '1-2',
        descanso: '2 min',
        variantes: [
          v('hip-thrust-barra', 'Hip thrust con barra', 5, 'peso', 'Apretá el glúteo arriba un segundo, costillas hacia abajo.'),
          v('hip-thrust-maquina', 'Hip thrust en máquina', 10),
          v('puente-gluteo', 'Puente de glúteo con barra', 5),
          v('patada-polea', 'Patada de glúteo en polea', 2.5),
        ],
      },
      {
        id: 'unilateral',
        patron: 'Pierna unilateral',
        series: 3,
        reps: '10-12',
        rir: '2',
        descanso: '90 s',
        variantes: [
          v('bulgara', 'Zancada búlgara (por pierna)', 2),
          v('zancada-caminando', 'Zancada caminando con mancuernas', 2),
          v('sentadilla-dividida', 'Sentadilla dividida', 2),
          v('zancada-multipower', 'Zancada en multipower', 2.5),
        ],
      },
      { id: 'curl-femoral', patron: 'Flexión de rodilla', series: 3, reps: '12-15', rir: '1', descanso: '90 s', variantes: CURL_FEMORAL },
      { id: 'extension', patron: 'Extensión de rodilla', series: 3, reps: '12-15', rir: '1', descanso: '90 s', variantes: EXTENSION },
      { id: 'gemelo', patron: 'Gemelo', series: 4, reps: '12-15', rir: '0-1', descanso: '60 s', variantes: GEMELO },
      {
        id: 'core',
        patron: 'Flexión de tronco',
        series: 3,
        reps: '10-15',
        rir: '1',
        descanso: '60 s',
        variantes: [
          v('crunch-polea', 'Crunch en polea', 5),
          v('rueda-abdominal', 'Rueda abdominal', 0, 'corporal'),
          v('elevacion-piernas', 'Elevación de piernas colgado', 0, 'corporal'),
          v('crunch-maquina', 'Crunch en máquina', 5),
        ],
      },
    ],
  },

  'torso-b': {
    id: 'torso-b',
    nombre: 'Torso B',
    foco: 'Énfasis en jalón',
    ejercicios: [
      {
        id: 'dominada',
        patron: 'Jalón vertical pesado',
        series: 4,
        reps: '6-10',
        rir: '2',
        descanso: '2.5 min',
        variantes: [
          v('dominadas', 'Dominadas', 2.5, 'corporal', 'Cuando te salgan 10 limpias en todas las series, empezá a colgarte lastre.'),
          v('jalon-supino', 'Jalón supino', 5),
          v('jalon-neutro', 'Jalón con agarre neutro', 5),
          v('remo-invertido', 'Remo invertido', 0, 'corporal'),
        ],
      },
      {
        id: 'press-inclinado',
        patron: 'Press inclinado',
        series: 4,
        reps: '8-10',
        rir: '2',
        descanso: '2.5 min',
        variantes: [
          v('press-inclinado-mancuernas', 'Press inclinado con mancuernas', 2),
          v('press-inclinado-barra', 'Press inclinado con barra', 2.5),
          v('press-inclinado-maquina', 'Press inclinado en máquina', 5),
        ],
      },
      { id: 'remo', patron: 'Remo horizontal', series: 3, reps: '10-12', rir: '1-2', descanso: '90 s', variantes: REMO_HORIZONTAL },
      { id: 'press-vertical', patron: 'Press vertical', series: 3, reps: '8-10', rir: '1-2', descanso: '2 min', variantes: PRESS_MILITAR },
      { id: 'laterales', patron: 'Deltoide lateral', series: 3, reps: '15-20', rir: '0-1', descanso: '60 s', variantes: LATERALES },
      {
        id: 'deltoide-posterior',
        patron: 'Deltoide posterior',
        series: 3,
        reps: '15-20',
        rir: '1',
        descanso: '60 s',
        variantes: [
          v('face-pull', 'Face pull en polea', 2.5),
          v('pajaros', 'Pájaros con mancuernas', 2),
          v('posterior-maquina', 'Deltoide posterior en máquina', 5),
        ],
      },
      {
        id: 'biceps-martillo',
        patron: 'Flexión de codo neutra',
        series: 3,
        reps: '10-12',
        rir: '1',
        descanso: '75 s',
        variantes: [
          v('curl-martillo', 'Curl martillo con mancuernas', 2),
          v('curl-martillo-polea', 'Curl martillo en polea con cuerda', 2.5),
          v('curl-inverso', 'Curl inverso con barra', 2.5),
        ],
      },
      {
        id: 'triceps-largo',
        patron: 'Extensión de codo sobre la cabeza',
        series: 3,
        reps: '12-15',
        rir: '1',
        descanso: '75 s',
        variantes: [
          v('triceps-sobre-cabeza', 'Extensión sobre la cabeza en polea', 2.5),
          v('press-frances-mancuernas', 'Press francés con mancuernas', 2),
          v('triceps-polea', 'Extensión de tríceps en polea', 2.5),
        ],
      },
    ],
  },
}

export const rutinaDe = (fecha: Date): DiaRutina | null => {
  const id = SEMANA[fecha.getDay()]
  return id ? RUTINA[id] : null
}

/** Busca una variante por id en toda la rutina. */
export function varianteDe(id: string): Variante | null {
  for (const dia of Object.values(RUTINA)) {
    for (const ej of dia.ejercicios) {
      const encontrada = ej.variantes.find((x) => x.id === id)
      if (encontrada) return encontrada
    }
  }
  return null
}

/**
 * Una serie registrada. Los dos números se leen según la medida de la variante:
 * - peso: kg levantados y repeticiones.
 * - corporal: lastre añadido (0 si es a peso corporal) y repeticiones.
 * - tiempo: peso siempre 0 y reps son los segundos aguantados.
 */
export type SerieHecha = { peso: number; reps: number }

/** Por fecha ISO, por id de variante, una entrada por serie (null = pendiente). */
export type Entrenos = Record<string, Record<string, (SerieHecha | null)[]>>

/**
 * El historial viejo se guardaba con el nombre del ejercicio como clave. Esta
 * tabla lo pasa a ids de variante para no perder lo ya registrado.
 */
export const NOMBRES_VIEJOS: Record<string, string> = {
  'Sentadilla con barra': 'sentadilla-barra',
  'Prensa 45°': 'prensa-45',
  'Peso muerto rumano': 'rdl-barra',
  'Extensión de cuádriceps': 'extension-cuadriceps',
  'Curl femoral tumbado': 'curl-femoral-tumbado',
  'Curl femoral sentado': 'curl-femoral-sentado',
  'Gemelo de pie': 'gemelo-pie',
  'Gemelo sentado': 'gemelo-sentado',
  'Plancha abdominal': 'plancha',
  'Press de banca': 'press-banca-barra',
  'Remo con barra': 'remo-barra',
  'Press militar con mancuernas': 'press-militar-mancuernas',
  'Jalón al pecho': 'jalon-pecho',
  'Aperturas en polea o pec deck': 'pec-deck',
  'Elevaciones laterales': 'laterales-mancuernas',
  'Extensión de tríceps en polea': 'triceps-polea',
  'Curl de bíceps con barra Z': 'curl-barra-z',
  'Hip thrust': 'hip-thrust-barra',
  'Zancada búlgara (por pierna)': 'bulgara',
  'Rueda abdominal o crunch en polea': 'crunch-polea',
  'Dominadas (o jalón supino)': 'dominadas',
  'Press inclinado con mancuernas': 'press-inclinado-mancuernas',
  'Remo en polea baja': 'remo-polea-baja',
  'Press militar en barra o máquina': 'press-militar-barra',
  'Face pull': 'face-pull',
  'Curl martillo': 'curl-martillo',
  'Extensión de tríceps sobre la cabeza': 'triceps-sobre-cabeza',
}

/**
 * Pasa un historial viejo (con el nombre del ejercicio como clave) a ids de
 * variante, para no perder lo ya registrado ni al abrir la app ni al importar
 * un respaldo hecho antes del cambio.
 */
export function migrarNombres(entrenos: Entrenos): Entrenos {
  const salida: Entrenos = {}
  for (const [fecha, dia] of Object.entries(entrenos)) {
    salida[fecha] = {}
    for (const [clave, series] of Object.entries(dia)) {
      salida[fecha][NOMBRES_VIEJOS[clave] ?? clave] = series
    }
  }
  return salida
}
