/**
 * STRUCTURES DE SANTÉ — DONNÉES DE DÉMONSTRATION
 * Tous les noms, horaires et numéros ci-dessous sont FICTIFS.
 */

export const CITIES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Fada N’Gourma',
  'Banfora',
] as const;

export type City = (typeof CITIES)[number];

export const FACILITY_TYPES = {
  'centre-sante': 'Centre de santé (CSPS/CMA)',
  generaliste: 'Médecin généraliste',
  gynecologue: 'Gynécologue',
  depistage: 'Centre de dépistage',
} as const;

export type FacilityType = keyof typeof FACILITY_TYPES;

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  city: City;
  district: string;
  hours: string;
  openSaturday: boolean;
  /** Numéro fictif. */
  phone: string;
  freeScreeningOctober: boolean;
  socialRate: boolean;
  femaleStaff: boolean;
}

const f = (x: Facility) => x;

export const FACILITIES: Facility[] = [
  f({ id: 'ouaga-manguiers', name: 'CSPS Les Manguiers', type: 'centre-sante', city: 'Ouagadougou', district: 'Pissy', hours: 'Lun–Ven 7h–17h · Sam 8h–12h', openSaturday: true, phone: '+226 70 00 01 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'ouaga-rose-espoir', name: 'Centre de dépistage Rose Espoir', type: 'depistage', city: 'Ouagadougou', district: 'Gounghin', hours: 'Lun–Sam 8h–16h', openSaturday: true, phone: '+226 70 00 01 02', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'ouaga-baobab', name: 'Cabinet médical Le Baobab', type: 'generaliste', city: 'Ouagadougou', district: 'Dassasgho', hours: 'Lun–Ven 8h–18h', openSaturday: false, phone: '+226 70 00 01 03', freeScreeningOctober: false, socialRate: true, femaleStaff: false }),
  f({ id: 'ouaga-flamboyants', name: 'Cabinet de gynécologie Les Flamboyants', type: 'gynecologue', city: 'Ouagadougou', district: 'Ouaga 2000', hours: 'Lun–Ven 9h–17h · Sam 9h–13h', openSaturday: true, phone: '+226 70 00 01 04', freeScreeningOctober: false, socialRate: false, femaleStaff: true }),
  f({ id: 'ouaga-kossodo', name: 'CMA Kossodo Santé Plus', type: 'centre-sante', city: 'Ouagadougou', district: 'Kossodo', hours: 'Tous les jours, 24h/24', openSaturday: true, phone: '+226 70 00 01 05', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'bobo-karites', name: 'CSPS Les Karités', type: 'centre-sante', city: 'Bobo-Dioulasso', district: 'Sarfalao', hours: 'Lun–Ven 7h–17h · Sam 8h–12h', openSaturday: true, phone: '+226 70 00 02 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'bobo-keneya', name: 'Espace dépistage Kènèya', type: 'depistage', city: 'Bobo-Dioulasso', district: 'Accart-Ville', hours: 'Lun–Ven 8h–16h', openSaturday: false, phone: '+226 70 00 02 02', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'bobo-fromager', name: 'Clinique gynécologique Le Fromager', type: 'gynecologue', city: 'Bobo-Dioulasso', district: 'Dogona', hours: 'Lun–Sam 8h–18h', openSaturday: true, phone: '+226 70 00 02 03', freeScreeningOctober: false, socialRate: true, femaleStaff: true }),
  f({ id: 'koudougou-lumiere', name: 'CMA Lumière', type: 'centre-sante', city: 'Koudougou', district: 'Palogo', hours: 'Tous les jours, 24h/24', openSaturday: true, phone: '+226 70 00 03 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'koudougou-bon-accueil', name: 'Cabinet médical Bon Accueil', type: 'generaliste', city: 'Koudougou', district: 'Issouka', hours: 'Lun–Ven 8h–17h · Sam 8h–12h', openSaturday: true, phone: '+226 70 00 03 02', freeScreeningOctober: false, socialRate: true, femaleStaff: false }),
  f({ id: 'ouahigouya-roniers', name: 'CSPS Les Rôniers', type: 'centre-sante', city: 'Ouahigouya', district: 'Secteur 4', hours: 'Lun–Ven 7h–17h', openSaturday: false, phone: '+226 70 00 04 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'ouahigouya-source', name: 'Cabinet de gynécologie La Source', type: 'gynecologue', city: 'Ouahigouya', district: 'Secteur 1', hours: 'Lun–Ven 8h–16h · Sam 8h–12h', openSaturday: true, phone: '+226 70 00 04 02', freeScreeningOctober: false, socialRate: false, femaleStaff: true }),
  f({ id: 'fada-tamariniers', name: 'CMA Les Tamariniers', type: 'centre-sante', city: 'Fada N’Gourma', district: 'Secteur 2', hours: 'Tous les jours, 24h/24', openSaturday: true, phone: '+226 70 00 05 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'fada-espoir-est', name: 'Centre de dépistage Espoir de l’Est', type: 'depistage', city: 'Fada N’Gourma', district: 'Secteur 5', hours: 'Lun–Ven 8h–15h', openSaturday: false, phone: '+226 70 00 05 02', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'banfora-rizieres', name: 'CSPS Les Rizières', type: 'centre-sante', city: 'Banfora', district: 'Secteur 3', hours: 'Lun–Ven 7h–17h · Sam 8h–12h', openSaturday: true, phone: '+226 70 00 06 01', freeScreeningOctober: true, socialRate: true, femaleStaff: true }),
  f({ id: 'banfora-kapokier', name: 'Cabinet médical Le Kapokier', type: 'generaliste', city: 'Banfora', district: 'Secteur 1', hours: 'Lun–Ven 8h–18h', openSaturday: false, phone: '+226 70 00 06 02', freeScreeningOctober: false, socialRate: true, femaleStaff: false }),
];

export function isCity(value: string): value is City {
  return (CITIES as readonly string[]).includes(value);
}

/** Retire les accents et met en minuscules, pour la recherche. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase();
}

/** Trouve une ville citée dans un texte libre (« j'habite à bobo » → Bobo-Dioulasso). */
export function detectCity(text: string): City | null {
  const t = normalize(text);
  const aliases: Array<[string, City]> = [
    ['ouaga', 'Ouagadougou'],
    ['bobo', 'Bobo-Dioulasso'],
    ['koudougou', 'Koudougou'],
    ['ouahigouya', 'Ouahigouya'],
    ['fada', 'Fada N’Gourma'],
    ['banfora', 'Banfora'],
  ];
  return aliases.find(([alias]) => t.includes(alias))?.[1] ?? null;
}

export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/\s/g, '');
}
