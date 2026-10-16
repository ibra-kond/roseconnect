export type ObstacleId = 'fear' | 'shame' | 'money' | 'time' | 'distance' | 'where' | 'consent';

export type ObstacleActionType = 'facilities' | 'chat' | 'sponsor' | 'prepare';

export interface Obstacle {
  id: ObstacleId;
  /** Libellé de la puce. */
  label: string;
  /** Phrase d'accueil bienveillante. */
  intro: string;
  /** 2 à 3 solutions concrètes. */
  solutions: string[];
  action: { type: ObstacleActionType; label: string };
}

export const OBSTACLES: Obstacle[] = [
  {
    id: 'fear',
    label: 'Peur du résultat',
    intro: 'Avoir peur est normal. Savoir tôt, c’est se donner plus de chances.',
    solutions: [
      'Venez accompagnée d’une amie, d’une sœur ou d’une personne de confiance.',
      'Demandez au soignant de vous expliquer chaque étape avant de commencer.',
      'Un examen précoce augmente fortement les chances de bien se soigner.',
    ],
    action: { type: 'chat', label: 'Parler au chatbot' },
  },
  {
    id: 'shame',
    label: 'Honte ou gêne',
    intro: 'C’est un geste de santé comme un autre. Les soignants le font tous les jours.',
    solutions: [
      'Vous pouvez demander à être examinée par une soignante.',
      'Vous pouvez demander qu’une personne de confiance reste avec vous.',
      'Préparez à l’avance quelques mots simples pour expliquer votre venue.',
    ],
    action: { type: 'prepare', label: 'Préparer ce que je vais dire au médecin' },
  },
  {
    id: 'money',
    label: 'Manque d’argent',
    intro: 'Le coût ne doit pas vous empêcher de prendre soin de vous.',
    solutions: [
      'En octobre, de nombreuses campagnes proposent un dépistage gratuit.',
      'Certaines structures appliquent un tarif social : demandez-le à l’accueil.',
      'Des associations peuvent parrainer votre examen.',
    ],
    action: { type: 'sponsor', label: 'Demander un parrainage' },
  },
  {
    id: 'time',
    label: 'Manque de temps',
    intro: 'Un examen clinique ne prend souvent que quelques minutes.',
    solutions: [
      'Plusieurs structures sont ouvertes le samedi matin.',
      'Rien à réserver : si un contrôle est utile, l’assistante vous recommande un centre où vous rendre quand cela vous arrange.',
      'L’auto-palpation à la maison ne prend que 5 minutes par mois.',
    ],
    action: { type: 'chat', label: 'Faire le point avec l’assistante' },
  },
  {
    id: 'distance',
    label: 'Centre trop loin',
    intro: 'Il existe souvent une structure plus proche qu’on ne le pense.',
    solutions: [
      'Le CSPS de votre quartier peut faire un premier examen clinique.',
      'Pendant Octobre Rose, des équipes mobiles se déplacent dans les quartiers.',
      'Organisez le trajet à plusieurs avec des voisines ou des amies.',
    ],
    action: { type: 'facilities', label: 'Voir les structures' },
  },
  {
    id: 'where',
    label: 'Je ne sais pas où aller',
    intro: 'Pas d’inquiétude, on vous aide à trouver la bonne porte.',
    solutions: [
      'Pour commencer, un centre de santé ou un médecin généraliste suffit.',
      'Le soignant vous orientera ensuite si un autre examen est utile.',
      'Après un court échange, l’assistante vous recommande un centre si un suivi est utile.',
    ],
    action: { type: 'chat', label: 'Faire le point avec l’assistante' },
  },
  {
    id: 'consent',
    label: 'Besoin de l’accord du conjoint ou de la famille',
    intro: 'Votre santé compte, pour vous et pour vos proches.',
    solutions: [
      'Partagez cette application avec votre conjoint ou votre famille.',
      'Expliquez que l’examen est rapide, simple et sans danger.',
      'Proposez à un proche de vous accompagner au centre de santé.',
    ],
    action: { type: 'chat', label: 'Parler au chatbot' },
  },
];

export function getObstacle(id: ObstacleId): Obstacle {
  return OBSTACLES.find((o) => o.id === id)!;
}

/** Phrases pour « Préparer ce que je vais dire au médecin ». */
export const DOCTOR_PHRASES: string[] = [
  'Bonjour, je viens pour un examen des seins, dans le cadre du dépistage.',
  'Je préférerais être examinée par une femme, si c’est possible.',
  'J’ai remarqué un changement depuis quelques semaines et je voudrais le faire vérifier.',
  'Pouvez-vous m’expliquer ce que vous allez faire avant de commencer ?',
  'Combien coûte l’examen ? Existe-t-il un tarif social ?',
];
