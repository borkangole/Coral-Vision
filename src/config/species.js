// =========================================================================
// SPECIES CONFIG — PLACEHOLDER DATA, FULL PROFILE SCHEMA
// =========================================================================
// This list stands in for the final 5–10 species that will come out of the
// Capiz PENRO-limited dataset (panel requirement #1). Replace / trim this
// list once the actual species set is confirmed with PENRO, then:
//   1. Retrain the EfficientNet-B0 model on exactly these classes
//      (see /training/train_efficientnet_b0.py)
//   2. Keep the `id` values here in the SAME ORDER as the model's output
//      classes (index 0 = first entry, etc.) — inference.js maps model
//      output indices back to this array.
//
// Field set follows the adviser's required dashboard fields:
//   scientificName, commonName, familyName, genus, speciesEpithet,
//   characters, colors, similarSpecies, habitat, abundance,
//   taxonomicReference, identificationGuides, healthCondition,
//   distribution, conservationStatus, threats
//
// SOURCING: taxonomy/identification fields are drafted from general
// literature and Corals of the World (Veron et al., coralsoftheworld.org),
// as the adviser specified — verify each entry against it (and Capiz
// PENRO's own records) before this ships in the final defense, especially
// `healthCondition`, which should ideally reflect field-survey observations
// rather than generic text. `conservationStatus` follows IUCN Red List
// categories. Coral Atlas (allencoralatlas.org) is a satellite habitat-
// mapping tool, not a species reference — it's more useful for citing
// general reef-extent/condition context in `habitat` than for per-species
// facts; it does not provide the taxonomic fields below.
// =========================================================================

const SPECIES = [
  {
    id: 'bean_coral',
    commonName: 'Bean Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Cynarina lacrymalis',
    familyName: 'Lobophylliidae',
    genus: 'Cynarina',
    speciesEpithet: 'lacrymalis',
    characters:
      'Large solitary (free-living), fleshy polyp with a single mouth; corallite wall is thin and mostly hidden by inflated tissue. Tentacles are short and retract during the day.',
    colors: 'Green, brown, red, or pink base color, often with a paler oral disc and contrasting mouth.',
    similarSpecies: ['Bubble Coral (Plerogyra sinuosa)', 'Trachyphyllia geoffroyi'],
    habitat: 'Sheltered reef slopes and lagoons with soft substrate, typically 5–25m depth.',
    abundance: 'Uncommon — typically found as scattered solitary individuals rather than in dense stands.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 2.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Indo-Pacific, including the Philippines.',
    conservationStatus: 'Near Threatened',
    threats: 'Ocean acidification, coral bleaching, destructive fishing, collection for the aquarium trade.',
  },
  {
    id: 'brain_coral',
    commonName: 'Brain Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Platygyra sp.',
    familyName: 'Merulinidae',
    genus: 'Platygyra',
    speciesEpithet: 'sp.',
    characters:
      'Massive, boulder-shaped colony with meandering (maze-like) valleys instead of individual round corallites, resembling a brain surface.',
    colors: 'Grey-green, brown, or yellow-green, often with contrasting ridge and valley coloration.',
    similarSpecies: ['Favia coral (Favia sp.)', 'Goniastrea sp.'],
    habitat: 'Reef flats and slopes, tolerant of moderately turbid and variable-flow environments.',
    abundance: 'Common — one of the more frequently encountered massive coral genera on Indo-Pacific reefs.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 2.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Widespread Indo-Pacific, including the Philippines.',
    conservationStatus: 'Near Threatened',
    threats: 'Rising sea temperatures, sedimentation, physical damage from anchors and divers.',
  },
  {
    id: 'bubble_coral',
    commonName: 'Bubble Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Plerogyra sinuosa',
    familyName: 'Euphylliidae',
    genus: 'Plerogyra',
    speciesEpithet: 'sinuosa',
    characters:
      'Colony of grape-like, translucent bubble vesicles that inflate during the day (photosynthesis/protection) and retract at night to expose sweeper tentacles for feeding.',
    colors: 'Pale white, green, or grey-green bubbles; tentacle tips sometimes yellow or brown.',
    similarSpecies: ['Bean Coral (Cynarina lacrymalis)', 'Physogyra lichtensteini'],
    habitat: 'Sheltered reef slopes and walls with reduced water motion, 3–25m depth.',
    abundance: 'Uncommon to occasional; forms small clusters rather than large stands.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 3.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Indo-Pacific, including the Philippines.',
    conservationStatus: 'Near Threatened',
    threats: 'Coral bleaching, aquarium trade collection, habitat degradation.',
  },
  {
    id: 'cauliflower_coral',
    commonName: 'Cauliflower Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Pocillopora sp.',
    familyName: 'Pocilloporidae',
    genus: 'Pocillopora',
    speciesEpithet: 'sp.',
    characters:
      'Branching colony with verrucae (wart-like bumps) covering the branch surface, giving a knobby, cauliflower-like texture. Fast-growing and structurally complex.',
    colors: 'Pink, cream, pale brown, or green depending on light exposure and symbiont type.',
    similarSpecies: ['Stylophora pistillata', 'Seriatopora sp.'],
    habitat: 'Shallow, wave-exposed reef flats and upper slopes, usually less than 10m depth.',
    abundance: 'Common — often one of the dominant branching corals on shallow Indo-Pacific reef flats.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 1.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Widespread Indo-Pacific, including the Philippines.',
    conservationStatus: 'Vulnerable',
    threats: 'Highly sensitive to thermal stress and among the first genera to bleach during marine heatwaves.',
  },
  {
    id: 'favia_coral',
    commonName: 'Favia Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Favia sp.',
    familyName: 'Merulinidae',
    genus: 'Favia',
    speciesEpithet: 'sp.',
    characters:
      'Massive, boulder- or dome-shaped colony with distinct, closely-packed circular to oval corallites (each polyp has its own wall, unlike Platygyra\'s shared valleys).',
    colors: 'Brown, green, grey, or reddish, frequently with contrasting corallite centers.',
    similarSpecies: ['Brain Coral (Platygyra sp.)', 'Favites sp.'],
    habitat: 'Reef flats, slopes, and lagoons across a wide depth and turbidity range.',
    abundance: 'Common — a widespread and frequently recorded massive coral genus.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 2.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Indo-Pacific, including the Philippines.',
    conservationStatus: 'Near Threatened',
    threats: 'Bleaching events, sedimentation, and coastal development.',
  },
  {
    id: 'lettuce_coral',
    commonName: 'Lettuce Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Pectinia sp.',
    familyName: 'Merulinidae',
    genus: 'Pectinia',
    speciesEpithet: 'sp.',
    characters:
      'Thin, wavy, contorted plates or fronds radiating from a central base, resembling lettuce leaves; fragile skeletal structure.',
    colors: 'Green, brown, cream, or two-tone with paler plate edges.',
    similarSpecies: ['Mycedium sp.', 'Echinophyllia sp.'],
    habitat: 'Calm, sheltered lagoons and reef slopes with low wave energy.',
    abundance: 'Occasional — patchily distributed where conditions are calm enough for its fragile form.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 3.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Indo-Pacific, including the Philippines.',
    conservationStatus: 'Near Threatened',
    threats: 'Fragile structure makes it vulnerable to physical damage, sedimentation, and bleaching.',
  },
  {
    id: 'mushroom_coral',
    commonName: 'Mushroom Coral',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Fungia sp.',
    familyName: 'Fungiidae',
    genus: 'Fungia',
    speciesEpithet: 'sp.',
    characters:
      'Free-living (unattached as an adult), solitary, disc-shaped coral with radiating septa from a central mouth slit, resembling a mushroom cap. Can right itself if overturned.',
    colors: 'Brown, tan, cream, or mottled with paler tentacle tips at night.',
    similarSpecies: ['Ctenactis sp.', 'Heliofungia actiniformis'],
    habitat: 'Sandy or rubble substrate on reef flats and slopes, able to move slightly across the seafloor.',
    abundance: 'Common — frequently the most numerous free-living coral on many Indo-Pacific reef flats.',
    taxonomicReference: 'Corals of the World (Veron et al., coralsoftheworld.org)',
    identificationGuides: 'Corals of the World species factsheet; Veron (2000) "Corals of the World" Vol. 3.',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data.',
    distribution: 'Widespread Indo-Pacific, including the Philippines.',
    conservationStatus: 'Least Concern',
    threats: 'Collection for the aquarium trade, sedimentation.',
  },
  {
    id: 'crown_of_thorns_starfish',
    commonName: 'Crown of Thorns Starfish',
    localName: 'TBD (confirm local/Hiligaynon name with PENRO)',
    scientificName: 'Acanthaster planci',
    familyName: 'Acanthasteridae',
    genus: 'Acanthaster',
    speciesEpithet: 'planci',
    characters:
      'Large multi-armed (12–20 arms) sea star covered in long venomous spines. Everts its stomach to digest coral polyps externally, leaving white feeding scars.',
    colors: 'Grey-green, reddish, or purple body with contrasting orange-red or purple spine tips.',
    similarSpecies: ['Culcita sp. (cushion star, no spines)'],
    habitat: 'Reef slopes and flats, often near hard coral cover it preys on.',
    abundance:
      'Variable — normally low density, but prone to sudden population outbreaks that can rapidly reduce coral cover.',
    taxonomicReference: 'Corals of the World (Veron et al.) for host-coral context; general echinoderm literature for the species itself.',
    identificationGuides: 'Standard reef-monitoring identification guides (e.g. AIMS Crown-of-Thorns monitoring protocols).',
    healthCondition: 'Not yet assessed for Capiz reefs — pending field survey data on outbreak status.',
    distribution: 'Indo-Pacific, including the Philippines.',
    conservationStatus: 'Not Evaluated (Reef Threat Species)',
    threats: 'The species itself is a major threat to coral reefs during outbreaks, often linked to nutrient runoff.',
  },
];

export default SPECIES;

export function getSpeciesById(id) {
  return SPECIES.find((s) => s.id === id) || null;
}

export function getSpeciesByIndex(index) {
  return SPECIES[index] || null;
}
