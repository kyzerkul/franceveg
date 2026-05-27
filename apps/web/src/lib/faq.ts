export type FaqEntry = {
  question: string
  answer: (restaurantName: string) => string
}

export const TAG_FAQ_MAP: Record<string, FaqEntry> = {
  vegan: {
    question: 'Ce restaurant est-il vegan ?',
    answer: (n) => `Oui, ${n} est un restaurant 100 % végane. Aucun produit d'origine animale n'est utilisé dans sa cuisine.`,
  },
  végétalien: {
    question: 'Ce restaurant est-il végétalien ?',
    answer: (n) => `Oui, ${n} propose une cuisine végétalienne, sans viande, poisson, produits laitiers ni œufs.`,
  },
  végétarien: {
    question: 'Ce restaurant est-il végétarien ?',
    answer: (n) => `Oui, ${n} est un restaurant végétarien. Son menu ne contient pas de viande ni de poisson.`,
  },
  bio: {
    question: 'Les ingrédients de ce restaurant sont-ils biologiques ?',
    answer: (n) => `Oui, ${n} s'approvisionne en ingrédients biologiques certifiés, issus de l'agriculture biologique.`,
  },
  'sans gluten': {
    question: 'Ce restaurant propose-t-il des plats sans gluten ?',
    answer: (n) => `Oui, ${n} dispose d'options sans gluten adaptées aux personnes intolérantes ou sensibles au gluten.`,
  },
  'fait maison': {
    question: 'La cuisine de ce restaurant est-elle faite maison ?',
    answer: (n) => `Oui, chez ${n} tous les plats sont préparés maison à partir de produits frais.`,
  },
  traiteur: {
    question: 'Ce restaurant propose-t-il un service traiteur ?',
    answer: (n) => `Oui, ${n} propose un service traiteur. Contactez-les directement pour en savoir plus sur leurs offres.`,
  },
  épicerie: {
    question: "Ce restaurant dispose-t-il d'une épicerie ?",
    answer: (n) => `Oui, ${n} possède une épicerie où vous pouvez trouver des produits végétaux et bio à emporter.`,
  },
  café: {
    question: 'Ce restaurant propose-t-il aussi un espace café ?',
    answer: (n) => `Oui, ${n} dispose d'un espace café avec des boissons chaudes et des encas.`,
  },
  brunch: {
    question: 'Ce restaurant propose-t-il des brunchs ?',
    answer: (n) => `Oui, ${n} propose des brunchs. Renseignez-vous sur leurs horaires et formules disponibles.`,
  },
  'petits-déjeuners': {
    question: 'Peut-on prendre le petit-déjeuner dans ce restaurant ?',
    answer: (n) => `Oui, ${n} sert des petits-déjeuners. Consultez leurs horaires d'ouverture pour planifier votre visite.`,
  },
  livraison: {
    question: 'Ce restaurant propose-t-il la livraison à domicile ?',
    answer: (n) => `Oui, ${n} propose un service de livraison. Consultez leur site ou une plateforme de livraison pour commander.`,
  },
  'à emporter': {
    question: 'Peut-on commander à emporter dans ce restaurant ?',
    answer: (n) => `Oui, ${n} propose la vente à emporter. Appelez-les ou consultez leur site pour passer commande.`,
  },
  terrasse: {
    question: "Ce restaurant dispose-t-il d'une terrasse ?",
    answer: (n) => `Oui, ${n} dispose d'une terrasse, idéale pour profiter des beaux jours en plein air.`,
  },
  'ouvert le dimanche': {
    question: 'Ce restaurant est-il ouvert le dimanche ?',
    answer: (n) => `Oui, ${n} est ouvert le dimanche. Vérifiez les horaires précis sur leur fiche ou contactez-les.`,
  },
  'ouvert le lundi': {
    question: 'Ce restaurant est-il ouvert le lundi ?',
    answer: (n) => `Oui, ${n} est ouvert le lundi, ce qui est moins courant dans la restauration.`,
  },
  halal: {
    question: 'Ce restaurant sert-il des plats halal ?',
    answer: (n) => `Oui, ${n} propose une cuisine halal, conforme aux règles alimentaires islamiques.`,
  },
  casher: {
    question: 'Ce restaurant est-il casher ?',
    answer: (n) => `Oui, ${n} propose une cuisine casher, préparée selon les règles alimentaires juives.`,
  },
  'zéro déchet': {
    question: 'Ce restaurant a-t-il une démarche zéro déchet ?',
    answer: (n) => `Oui, ${n} adopte une politique zéro déchet en limitant les emballages et le gaspillage alimentaire.`,
  },
  local: {
    question: 'Ce restaurant privilégie-t-il les produits locaux ?',
    answer: (n) => `Oui, ${n} met en avant des produits locaux et des circuits courts pour une cuisine de proximité.`,
  },
}

export function buildFaqItems(
  tags: string[],
  restaurantName: string,
  limit = 5,
): Array<{ question: string; answer: string }> {
  return tags
    .slice(0, limit * 2)
    .map((tag) => TAG_FAQ_MAP[tag.toLowerCase()])
    .filter((entry): entry is FaqEntry => Boolean(entry))
    .slice(0, limit)
    .map(({ question, answer }) => ({ question, answer: answer(restaurantName) }))
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
