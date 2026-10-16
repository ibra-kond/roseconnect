export interface FaqEntry {
  id: string;
  /** L'affirmation telle qu'on l'entend souvent. */
  statement: string;
  verdict: 'myth' | 'reality';
  /** Réponse courte (2 à 3 phrases). */
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    id: 'age',
    statement: 'Seules les femmes âgées sont touchées',
    verdict: 'myth',
    answer:
      'Le risque augmente avec l’âge, mais des femmes jeunes peuvent aussi être concernées. C’est pourquoi l’auto-palpation est utile à tout âge. Au moindre changement, parlez-en à un professionnel de santé.',
  },
  {
    id: 'lump',
    statement: 'Une boule veut toujours dire cancer',
    verdict: 'myth',
    answer:
      'Une boule dans le sein peut avoir bien d’autres causes. Mais seul un professionnel de santé peut le dire. Toute boule nouvelle mérite donc d’être vérifiée, sans attendre et sans paniquer.',
  },
  {
    id: 'mammo-pain',
    statement: 'La mammographie fait très mal',
    verdict: 'myth',
    answer:
      'L’examen peut être inconfortable quelques secondes, quand le sein est pressé. Il est rapide et sans danger. Le faire en dehors de la semaine avant les règles le rend souvent plus confortable.',
  },
  {
    id: 'men',
    statement: 'Les hommes ne peuvent pas être concernés',
    verdict: 'myth',
    answer:
      'C’est rare, mais les hommes peuvent aussi avoir un cancer du sein. Une boule ou un changement sous le mamelon chez un homme doit aussi être montré à un médecin.',
  },
  {
    id: 'family',
    statement: 'Si personne dans ma famille n’a eu de cancer, je ne risque rien',
    verdict: 'myth',
    answer:
      'La plupart des femmes touchées n’ont aucun cas dans leur famille. Avoir une parente concernée augmente le risque, mais l’absence d’antécédent ne protège pas. Les repères de dépistage valent pour toutes.',
  },
  {
    id: 'bra',
    statement: 'Le soutien-gorge provoque le cancer',
    verdict: 'myth',
    answer:
      'Aucune étude sérieuse ne montre de lien entre le soutien-gorge et le cancer du sein. Vous pouvez porter ce qui vous est confortable, de jour comme de nuit.',
  },
  {
    id: 'contagious',
    statement: 'Le cancer du sein est contagieux',
    verdict: 'myth',
    answer:
      'Le cancer ne s’attrape pas. On peut embrasser, soigner et manger avec une personne malade sans aucun risque. Votre présence l’aide beaucoup.',
  },
  {
    id: 'early',
    statement: 'Détecté tôt, le cancer du sein se soigne beaucoup mieux',
    verdict: 'reality',
    answer:
      'Plus il est découvert tôt, plus les traitements sont simples et efficaces. C’est tout l’intérêt de l’auto-palpation et du dépistage régulier.',
  },
  {
    id: 'self-exam-not-enough',
    statement: 'L’auto-palpation ne remplace pas un examen par un professionnel',
    verdict: 'reality',
    answer:
      'L’auto-palpation aide à connaître son corps et à repérer un changement. Un examen clinique ou une mammographie peut détecter ce que les doigts ne sentent pas. Les deux se complètent.',
  },
];
