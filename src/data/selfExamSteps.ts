export interface SelfExamStep {
  id: number;
  title: string;
  text: string;
  /** Texte alternatif décrivant l'illustration. */
  alt: string;
  /** Illustration réelle (dossier public/). Sans image, le schéma SVG est affiché. */
  image?: string;
}

const IMG = '/media/auto-palpation';

export const SELF_EXAM_STEPS: SelfExamStep[] = [
  {
    id: 1,
    title: 'Observer devant le miroir',
    text: 'Bras le long du corps, regardez la forme, la taille et la peau de vos seins.',
    alt: 'Dessin d’une femme debout, bras le long du corps, qui observe la forme et la peau de ses seins.',
    image: `${IMG}/etape-1.webp`,
  },
  {
    id: 2,
    title: 'Lever les bras',
    text: 'Levez les bras au-dessus de la tête et observez à nouveau, de face et de profil.',
    alt: 'Dessin d’une femme les mains derrière la tête, bras levés, qui observe sa poitrine.',
    image: `${IMG}/etape-2.webp`,
  },
  {
    id: 3,
    title: 'Palper en petits cercles',
    text: 'Avec le plat des trois doigts du milieu, faites de petits cercles en appuyant doucement.',
    alt: 'Schéma d’une main dont trois doigts dessinent de petits cercles sur la poitrine stylisée.',
  },
  {
    id: 4,
    title: 'Toute la zone, jusqu’à l’aisselle',
    text: 'Parcourez tout le sein, de la clavicule au bas du sein, jusque sous l’aisselle.',
    alt: 'Dessin d’une femme, un bras levé, qui palpe son sein du plat des doigts en direction de l’aisselle.',
    image: `${IMG}/etape-4.webp`,
  },
  {
    id: 5,
    title: 'Recommencer allongée',
    text: 'Allongée, un coussin sous l’épaule, répétez les cercles de chaque côté.',
    alt: 'Dessin d’une femme allongée sur le dos, un bras derrière la tête, qui palpe son sein avec l’autre main.',
    image: `${IMG}/etape-5.webp`,
  },
  {
    id: 6,
    title: 'Vérifier le mamelon',
    text: 'Pressez doucement le mamelon. Notez tout écoulement ou changement et parlez-en à un professionnel.',
    alt: 'Dessin d’une femme qui presse doucement son mamelon entre le pouce et l’index pour vérifier l’absence d’écoulement.',
    image: `${IMG}/etape-6.webp`,
  },
];
