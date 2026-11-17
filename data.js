/* ============================================================
   SilentLink prototype — mock content
   Kindergarten ASL vocabulary, learners, consultant workflow
   ============================================================ */

const CATEGORIES = {
  Greetings: { fill: "#6366F1", soft: "#EEF2FF", deep: "#3730A3" },
  Manners: { fill: "#14B8A6", soft: "#CCFBF1", deep: "#0F766E" },
  Responses: { fill: "#F59E0B", soft: "#FEF3C7", deep: "#92400E" },
  Family: { fill: "#FB7185", soft: "#FFE4E6", deep: "#9F1239" },
  Needs: { fill: "#22C55E", soft: "#DCFCE7", deep: "#15803D" },
  Feelings: { fill: "#8B5CF6", soft: "#EDE9FE", deep: "#5B21B6" },
};

const LEARNERS = [];

/* Hand glyph parameters: 4 finger lengths + thumb angle + tilt */
const SIGNS = [
  {
    id: "hello", gloss: "Hello", category: "Greetings", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "14 Aug 2026", added: "2 Jul 2026",
    handshape: "Open flat hand, palm facing out, fingers together.",
    movement: "Move the hand outward from the side of the forehead, like a small wave.",
    variants: ["Metro Manila: one small wave from the temple.", "Cebu: forearm held higher, two quick waves.", "Mindanao: flat hand moves forward rather than sideways."],
    variantNote: "Regional hand height varies; handshape and outward movement are consistent.",
    glyph: { f: [58, 66, 62, 50], thumb: -46, tilt: -16 }, pinned: true,
  },
  {
    id: "thank-you", gloss: "Thank you", category: "Manners", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "14 Aug 2026", added: "2 Jul 2026",
    handshape: "Flat hand, fingertips touching the chin, palm facing in.",
    movement: "Move the hand forward and down, away from the chin, with a small nod.",
    variants: ["Some Deaf teachers in Davao use a lighter touch at the lips.", "Older learners often add a nod; the nod is not scored."],
    variantNote: "Lips may be touched lightly; facial expression is not scored.",
    glyph: { f: [52, 60, 56, 46], thumb: -28, tilt: 6 },
  },
  {
    id: "please", gloss: "Please", category: "Manners", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "14 Aug 2026", added: "4 Jul 2026",
    handshape: "Flat open hand, palm on the chest, fingers pointing up.",
    movement: "Move the palm in a small circle on the chest.",
    variants: ["Manila: small clockwise circle.", "Visayas: rubs downward instead of circling; accepted as a regional variant."],
    variantNote: "Circular and downward rubbing variants are both accepted.",
    glyph: { f: [54, 62, 58, 48], thumb: -20, tilt: 4 },
  },
  {
    id: "yes", gloss: "Yes", category: "Responses", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "21 Aug 2026", added: "4 Jul 2026",
    handshape: "Closed fist, thumb resting against the index finger.",
    movement: "Knock the wrist forward twice, like a nodding fist.",
    variants: ["Some classrooms use a single firm nod of the fist.", "Head nod often accompanies this sign and is not scored."],
    variantNote: "Two knocks preferred for this vocabulary set; one is accepted at generous leniency.",
    glyph: { f: [30, 34, 32, 26], thumb: -6, tilt: 2 },
  },
  {
    id: "no", gloss: "No", category: "Responses", grade: "Kinder", status: "Under Review",
    consultant: "Unassigned", validated: "—", added: "18 Sep 2026",
    handshape: "Index and middle fingers tap the thumb.",
    movement: "Close the two fingers onto the thumb once or twice.",
    variants: ["Regional variant notes are being collected from partner schools in Iloilo."],
    variantNote: "Reviewer asked for a second reference clip before validation.",
    glyph: { f: [44, 40, 28, 22], thumb: -34, tilt: -4 },
  },
  {
    id: "mom", gloss: "Mom", category: "Family", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "21 Aug 2026", added: "5 Jul 2026",
    handshape: "Open hand, fingers slightly spread, thumb near the chin.",
    movement: "Tap the thumb or fingertips against the chin.",
    variants: ["Some families use a gentle double tap on the cheek.", "Tap location varies by household; chin is the classroom reference."],
    variantNote: "Chin tap is the reference pose; cheek tap is a documented variant.",
    glyph: { f: [50, 58, 54, 44], thumb: -52, tilt: -10 },
  },
  {
    id: "dad", gloss: "Dad", category: "Family", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "21 Aug 2026", added: "5 Jul 2026",
    handshape: "Open hand, fingers slightly spread, thumb near the forehead.",
    movement: "Tap the thumb or fingertips against the forehead.",
    variants: ["A two-tap rhythm is common in Bulacan classrooms.", "Forehead tap mirrors 'mom' at the chin."],
    variantNote: "Paired with Mom in lessons; contrast the forehead and chin placement.",
    glyph: { f: [50, 58, 54, 44], thumb: -52, tilt: 12 },
  },
  {
    id: "eat", gloss: "Eat", category: "Needs", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "28 Aug 2026", added: "8 Jul 2026",
    handshape: "Flattened O hand, fingertips together, palm facing the mouth.",
    movement: "Bring the fingertips to the mouth twice, like placing food.",
    variants: ["Some learners use one motion; two motions are the classroom standard.", "Spoon variants are not part of this vocabulary set."],
    variantNote: "Handshape is the strongest cue for the recognizer.",
    glyph: { f: [52, 50, 46, 38], thumb: -24, tilt: -6 },
  },
  {
    id: "drink", gloss: "Drink", category: "Needs", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "28 Aug 2026", added: "8 Jul 2026",
    handshape: "C hand, thumb and fingers forming a cup shape.",
    movement: "Tilt the C hand toward the mouth, as if tipping a cup.",
    variants: ["Bottle-drinking variant seen in some homes is accepted but not taught.", "C hand stays stable; wrist tilts."],
    variantNote: "Two-handed cup signs are outside the fixed vocabulary.",
    glyph: { f: [36, 38, 36, 30], thumb: -40, tilt: 8 },
  },
  {
    id: "happy", gloss: "Happy", category: "Feelings", grade: "Kinder", status: "Validated",
    consultant: "Grace Villamor", validated: "2 Sep 2026", added: "11 Jul 2026",
    handshape: "Flat open hands, palms facing the chest.",
    movement: "Brush both palms upward on the chest in two small circles.",
    variants: ["One-handed version used by some learners; accepted only at generous leniency.", "Facial expression is not scored."],
    variantNote: "Two-handed reference pose; the recognizer also accepts the one-handed classroom variant.",
    glyph: { f: [56, 64, 60, 48], thumb: -18, tilt: -4 },
  },
  {
    id: "sad", gloss: "Sad", category: "Feelings", grade: "Kinder", status: "Under Review",
    consultant: "Unassigned", validated: "—", added: "22 Sep 2026",
    handshape: "Open hands in front of the face, fingertips near the cheeks.",
    movement: "Draw both hands down the face slowly.",
    variants: ["Reviewer is checking a one-handed variant submitted by a partner school."],
    variantNote: "Awaiting confirmation of the downward path from two Deaf reviewers.",
    glyph: { f: [38, 42, 40, 32], thumb: -22, tilt: 14 },
  },
  {
    id: "more", gloss: "More", category: "Needs", grade: "Kinder", status: "Draft",
    consultant: "Unassigned", validated: "—", added: "29 Sep 2026",
    handshape: "Both hands flat, fingertips touching, palms facing each other.",
    movement: "Tap the fingertips together twice.",
    variants: ["Draft clip only; second reference angle still needed."],
    variantNote: "Not yet reviewed. Cannot be added to lessons.",
    glyph: { f: [40, 44, 42, 34], thumb: -30, tilt: -2 },
  },
  {
    id: "sorry", gloss: "Sorry", category: "Manners", grade: "Kinder", status: "Archived",
    consultant: "Grace Villamor", validated: "30 Jun 2026", added: "12 Jun 2026",
    handshape: "A hand with thumb extended, palm facing the chest.",
    movement: "Move the fist in a small circle over the heart.",
    variants: ["Archived after vocabulary review; replaced by 'please' in the Term 2 set."],
    variantNote: "Reference kept for consultant records; hidden from teacher search.",
    glyph: { f: [32, 36, 34, 28], thumb: -18, tilt: 0 },
  },
];

const SIGN_BY_ID = Object.fromEntries(SIGNS.map((s) => [s.id, s]));

const STICKERS = [
  { id: "wave", name: "Waving Hand", icon: "hand", unlocked: true },
  { id: "star", name: "Shining Star", icon: "star", unlocked: true },
  { id: "sun", name: "Sunny Day", icon: "sun", unlocked: true },
  { id: "flower", name: "Kind Flower", icon: "flower-2", unlocked: true },
  { id: "rainbow", name: "Rainbow Bridge", icon: "rainbow", unlocked: true },
  { id: "heart", name: "Kind Heart", icon: "heart", unlocked: true },
  { id: "balloon", name: "Balloon Buddy", icon: "party-popper", unlocked: false },
  { id: "cloud", name: "Cloud Friend", icon: "cloud", unlocked: false },
  { id: "apple", name: "Snack Time", icon: "apple", unlocked: false },
  { id: "music", name: "Happy Song", icon: "music", unlocked: false },
];
