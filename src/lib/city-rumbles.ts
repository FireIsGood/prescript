// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
// returns a number from 0 to 1
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// returns a 32 bit integer
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

type RNG = () => number;
export type RumbleType = "random" | "seeded";

function makeCityRumbler(
  type: RumbleType,
  seed: string | undefined = undefined,
  id: number | undefined = undefined
): { rng: RNG; rumbleSeed: number } {
  if (id) {
    return { rng: mulberry32(id), rumbleSeed: id };
  }

  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  const daySeed = cyrb53(`${day}|${month}|${year}`);
  let hashSeed = 1;
  switch (type) {
    case "seeded":
      if (seed) {
        hashSeed = cyrb53(seed);
        break;
      }
    // Fall back to random if we don't get a seed in seeded mode
    // Agony
    case "random":
      hashSeed = id ?? Date.now();
      break;
  }

  const parsedSeed = ((daySeed + 1) * (hashSeed + 1)) % Number.MAX_SAFE_INTEGER;
  return { rng: mulberry32(parsedSeed), rumbleSeed: parsedSeed };
}

function pickList<T>(num: number, list: Array<T>): T {
  return list[Math.floor(num * list.length)];
}

function pickRange(num: number, start: number, end: number): number {
  const distance = Math.abs(end - start);
  const lower = Math.min(end, start);
  return Math.floor(num * distance + lower);
}

function pickNumberWord(num: number): string {
  const numbers: string[] = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "ninetheenth"
  ];
  return pickList(num, numbers);
}

function pickLetter(num: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return pickList(num, letters);
}

function fixOrdinal(num: number): string {
  const mod = num % 10;
  switch (mod) {
    case 1:
      return num + "st";
    case 2:
      return num + "nd";
    case 3:
      return num + "rd";
    default:
      return num + "th";
  }
}

function fixCapitalization(str: string): string {
  return str.replace(/^[a-z]/, (m) => m.toUpperCase()).replace(/\. [a-z]/, (m) => m.toUpperCase());
}

function fixPluralize(num: number): string {
  if (num !== 1) {
    return "s";
  }
  return "";
}

type PrescriptState = { conditions: number };

// Takes an optional seed
// Returns text and a hex representation of the seed's hashed value
export function getPrescript(
  rumbleType: RumbleType,
  seed: string | undefined = undefined,
  id: number | undefined = undefined
): { text: string; rumbleSeed: string } {
  const res = makeCityRumbler(rumbleType, seed, id);
  const cityRumbler = res.rng;
  const rumbleSeed = res.rumbleSeed.toString(36);

  const existing = [
    "To Lala. Put three needles in Lily’s birthday cake by noon tomorrow.",
    `To Lee Deok-gu. Play rock paper scissors with the third person you meet
and play rock. If you win, pull out 59 strands of their hair. Then, apply
seafood-cream pasta sauce with mealworms fed on styrofoam to it three times,
and eat it with a fork.`,
    "Kill the painting you've drawn",
    "To John. Stand on any three-way intersection at 3:38 tomorrow, look to the east, and wave seven times.",
    "To Gloria. Extract the spinal cords of 37-year-old people in the Nest of L Corp.",
    "To Hubert. Exchange the left leg of the fourteenth person you come across today with the right leg of the twenty-sixth person you run into.",
    "To Esther. Eliminate the Thumb. No time limits.",
    "Remove the limbs of all Thumb personnel still remaining in the Nest. And hang their bodies on skewers",
    "Esther, Gloria, Hubert, and the Proselytes under them shall head to the Library.",
    "To Esther. Carry out every Prescript delivered by Messenger Yan.",
    "To Chae-heon. When you see a person on a three-way intersection waving their hand seven times, follow them to their house.",
    // Limbus
    "To Faust. Consume your vocal cords, boiled for 14 seconds in simmering salt water, as part of your dinnertime meal",
    "To Faust. Grill your own head medium-rare and serve it to your neighbor",
    "To Faust. Access the Gesellschaft and convert three unknown things into known things",
    "To Faust. Within 1 week, rendezvous with other Proselytes at the intersection at Block B and walk the streets. Postscript: Walk by following the Proselyte who arrives last",
    "To Faust. Climb to the rooftop of a building 3 stories or higher and wave your hand while looking down for 1 minute",
    "To Faust. Enter as the third customer of the day to a restaurant that sells chickens, and leave last",
    'To Faust. Start a game of hide-and-seek with at least three people, then return home as the "it."',
    "To Faust. Read six books, then visit the District that appears in the last book read. No time limit",
    "To Faust. Kill the liar within the alley within alleys.",
    "Split the nocturnal lights of the Backstreets thrice before 6 months pass.",
    "Behead seven dwellers of the Backstreets who resist when a blade touches their throat.",
    "Shear 663 strands of hair and enclose them in an envelope, to be deposited at Ticket Gate 3."
  ];

  const task_types = ["verb person requirement? location?", "verb object action?"];

  let prescript: string[] = [];

  // Ensure sentence structure makes sense by composition
  let prescriptState: PrescriptState = { conditions: 0 };

  // Prefix
  if (cityRumbler() < 0.5) {
    prescript.push(getPrefix(cityRumbler));
  }

  // Main task
  prescript.push(getMainTask(cityRumbler, prescriptState));

  if (cityRumbler() < 0.3) {
    if (prescriptState.conditions < 1) {
      prescriptState.conditions += 1;
      prescript.push(getTaskModifier(cityRumbler));
    }
  }

  // Followup task
  if (cityRumbler() < 0.2) {
    // Optional between
    if (cityRumbler() < 0.4) {
      prescript.push(getBetweenTask(cityRumbler));
    } else {
      prescript.push(". ");
    }

    prescript.push(getFollowupTask(cityRumbler));

    if (cityRumbler() < 0.3) {
      if (prescriptState.conditions < 1) {
        prescriptState.conditions += 1;
        prescript.push(getTaskModifier(cityRumbler));
      }
    }
  }

  // Clean up prescript
  let cleanPrescript = prescript.join("") + ".";
  cleanPrescript = fixCapitalization(cleanPrescript);

  return { text: cleanPrescript, rumbleSeed };
}

function getPrefix(rng: RNG): string {
  const duration = getDuration(rng);
  const numberSmall = pickRange(rng(), 1, 400);
  const numberBig = pickRange(rng(), 150, 3000);
  const location = getLocation(rng);
  const person = getPerson(rng);
  const item = getItem(rng);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const item2 = getItem(rng);
  const item2Plural = getItem(rng, false, true);
  const item2MaybePlural = rng() < 0.5 ? item2 : item2Plural;
  const sense = pickList(rng(), senses);
  const color = pickList(rng(), colors);
  const emotion = pickList(rng(), emotions);
  const topic = getTopic(rng);

  const states: string[] = [
    `feel ${color}`,
    `feel safe`,
    `feel in danger`,
    `feel ${emotion}`,
    `reach your breaking point`,
    `${sense} ${person}`,
    `find ${itemMaybePlural}`,
    `find ${itemMaybePlural} next to ${item2MaybePlural}`,
    `hear ${person} talks about ${topic}`,
    `go to ${location}`,
    `flip a coin`,
    `go shopping`,
    `think about ${topic}`,
    `count to ${numberSmall}`,
    `prepare for ${duration}`,
    `count ${duration} pass`,
    `eat breakfast`,
    `eat lunch`,
    `eat dinner`,
    `eat a snack`,
    `cook`
  ];

  const state = pickList(rng(), states);
  const state2 = pickList(rng(), states);
  const prefixes: string[] = [
    // State conditionals
    `${state}, then `,
    `after you ${state}, `,
    `before you ${state}, `,
    `if you ${state}, `,
    `once you ${state}, `,
    `when you ${state} and ${state2}, `,
    `when you ${state}, `,
    `while you ${state}, `,
    // Other
    `as casually as possible `,
    `at ${location} `,
    `before drying off, `,
    `before eating ${itemMaybePlural}, `,
    `before washing your hands, `,
    `by only calling in favors, `,
    `by only talking to others, `,
    `do not `,
    `ignoring ${person}, `,
    `immediately after you finish reading this `,
    `interrupt a conversation and `,
    `on the way to ${location}, `,
    `over the internet `,
    `stop what you are doing. `,
    `telling only ${person}, `,
    `through your device `,
    `under no circumstances will you `,
    `using ${itemMaybePlural} `,
    `using only what you ${sense}, `,
    `walk ${numberBig.toLocaleString("en")} meters, then `,
    `while at ${location} `,
    `while at the home of ${person} `,
    `while outside, `,
    `within ${duration} `,
    `without prior preparation, `,
    `without telling ${person}, `,
    `without telling anyone, `
  ];
  return pickList(rng(), prefixes);
}

function getMainTask(rng: RNG, state: PrescriptState): string {
  const numberTiny = pickRange(rng(), 2, 9);
  const numberSmall = pickRange(rng(), 1, 160);
  const numberWord = pickNumberWord(rng());
  const gameWord = pickList(rng(), games);
  const duration = getDuration(rng);
  const location = getLocation(rng);
  const person = getPerson(rng);
  const personArticle = getPerson(rng, true);
  const person2 = getPerson(rng);
  const item = getItem(rng);
  const itemNoArticle = getItem(rng, true);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const item2 = getItem(rng);
  const item2Plural = getItem(rng, false, true);
  const item2MaybePlural = rng() < 0.5 ? item2 : item2Plural;
  const topic = getTopic(rng);
  const organ = pickList(rng(), organs);
  const verb = pickList(rng(), verbs);
  const sense = pickList(rng(), senses);

  // Duration condition followup
  let condDurationAdd = "";
  let condGameAdd = "";
  let condPersonAdd = "";
  if (state.conditions < 1 && rng() > 0.3) {
    state.conditions += 1;
    condDurationAdd = getConditionDuration(rng);
    condGameAdd = getConditionGame(rng);
    condPersonAdd = getConditionPerson(rng);
  }

  const tasks: string[] = [
    `call the ${numberWord} person you think of and talk about ${topic}${condDurationAdd}`,
    `talk to ${person} about ${topic}${condDurationAdd}`,
    `think about ${topic}${condDurationAdd}`,
    `consider ${topic}${condDurationAdd}`,
    `do not think about ${topic}${condDurationAdd}`,
    `debate ${topic} with ${person}`,
    `go to ${location}`,
    `${verb} everyone at ${location}`,
    `obey the ${numberWord} ${personArticle} you meet today`,
    `cook ${item} and consume it`,
    `cook your ${organ} and consume it`,
    `cook the ${organ} of ${person} and feed it to ${person2}`,
    `observe ${person} for ${duration}`,
    `stalk ${person}`,
    `eliminate ${person}${condDurationAdd}`,
    `ignore ${person}${condDurationAdd}`,
    `shove ${person}${condPersonAdd}`,
    `kiss ${person}${condPersonAdd}`,
    `hug ${person}${condPersonAdd}`,
    `cuddle with ${person}${condPersonAdd}`,
    `marry ${person}${condPersonAdd}`,
    `stab ${person}${condPersonAdd}`,
    `stab ${person} with ${itemMaybePlural}`,
    `force ${person} to ${verb}${condPersonAdd}`,
    `lie to ${person}${condPersonAdd}`,
    `confess the truth to ${person}${condPersonAdd}`,
    `execute order ${numberSmall}`,
    `curl into a ball and ${verb}`,
    `befriend ${person}${condPersonAdd}`,
    `bring ${person} to ${location}`,
    `start a fight with ${person}`,
    `do nothing to save ${person}`,
    `start a game of ${gameWord} and ${pickList(rng(), ["win", "lose", "tie"])} during the ${numberWord} round${condGameAdd}`,
    `play ${gameWord} with ${person}${condGameAdd}`,
    `remove the ${organ} of ${person}`,
    `clean the dishes${condDurationAdd}`,
    `clean ${itemMaybePlural}${condDurationAdd}`,
    `walk backwards${condDurationAdd}`,
    `chase ${person}${condPersonAdd}`,
    `scratch a symbol of your ${itemNoArticle} into ${itemMaybePlural}`,
    `wave to ${person}`,
    `wave to ${person} ${numberTiny} times`,
    `point towards ${person}`,
    `do not enter ${location}${condDurationAdd}`,
    `forget the name of ${person}${condDurationAdd}`,
    `create ${itemMaybePlural} or destroy it if it exists${condDurationAdd}`,
    `do not look behind you${condDurationAdd}`,
    `yell towards ${location} about ${topic} for ${duration}${condDurationAdd}`,
    `buy ${item} which you will not use`,
    `server ${item} into ${numberTiny} pieces`,
    `use ${itemMaybePlural} with ${item2MaybePlural}`,
    `use ${itemMaybePlural} on ${item2MaybePlural}`,
    `use ${itemMaybePlural} on ${person}`,
    `change ${itemMaybePlural} into ${item2MaybePlural}`,
    `return ${item} so you may obtain ${item2MaybePlural}`,
    `destroy your own ${itemNoArticle}`,
    `throw ${itemMaybePlural} at ${person}${condPersonAdd}`,
    `use ${itemMaybePlural} on ${person}${condPersonAdd}`,
    `use ${person} on ${item}${condPersonAdd}`,
    `make ${person} speak with ${person2}`,
    `make ${person} into ${person2}${condPersonAdd}`,
    `shove ${person} into ${person2}${condPersonAdd}`,
    `${verb} ${person}${condPersonAdd}${condPersonAdd}`,
    `${verb} ${itemMaybePlural}`,
    `read ${numberTiny} books that you ${sense}`,
    `do not return home for ${duration}`
  ];
  return pickList(rng(), tasks);
}

function getBetweenTask(rng: RNG): string {
  const numberSmall = pickRange(rng(), 10, 500);
  const duration = getDuration(rng);
  const person = getPerson(rng);
  const item = getItem(rng);
  const itemNoArticle = getItem(rng, true);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;

  const tasks: string[] = [
    `. wait ${duration}, then `,
    `. once you pass by ${person}, `,
    `. if you do not see ${person}, `,
    `. once you find your ${item}, `,
    `. after ${duration}, `,
    `. without looking, `,
    `. using ${itemMaybePlural}, `,
    `. using your own ${itemNoArticle}, `,
    `. then, `,
    `. only after you have confirmed the previous command, `,
    `. ignoring the consequences, `,
    `. tamping doubt, `,
    `. without waiting, `,
    `. without hesitation, `,
    `. immediately, `,
    `. at the same time, `,
    `. after you recover your strength, `,
    `. if you have a doubt still, `,
    `. after counting to ${numberSmall}, `
  ];
  return pickList(rng(), tasks);
}

function getFollowupTask(rng: RNG): string {
  const numberSmall = pickRange(rng(), 1, 40);
  const numberWord = pickNumberWord(rng());
  const duration = getDuration(rng);
  const person = getPerson(rng);
  const person2 = getPerson(rng);
  const item = getItem(rng);
  const itemNoArticle = getItem(rng, true);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const sense = pickList(rng(), senses);
  const organ = pickList(rng(), organs);
  const verb = pickList(rng(), verbs);
  const topic = getTopic(rng);

  const tasks: string[] = [
    `observe the ${numberWord} ${person} you ${sense} for ${numberSmall} minutes`,
    `wave at ${person}`,
    `${verb} anyone who comes within ${numberSmall} meters for ${duration}`,
    `${verb} ${person}`,
    `break the joints of ${person}`,
    `give ${person} ${numberSmall} ${itemMaybePlural}`,
    `give ${person} your ${itemNoArticle}`,
    `take ${numberSmall} ${numberSmall === 1 ? item : itemPlural} from ${person}`,
    `replace the ${organ} of ${person}`,
    `tell ${person} about ${itemPlural}`,
    `discuss ${topic}`,
    `discuss ${topic} with ${person}`,
    `think about ${topic}`,
    `see a doctor about your ${organ}`,
    `remove your ${organ}`,
    `remove the ${organ} of ${person}`,
    `read ${numberSmall} books`,
    `replace ${numberSmall} people with ${person}`,
    `exchange the ${organ} of ${person} with ${person2}`,
    `cry for ${duration}`,
    `you may not cry until the prescript is fulfilled`,
    `you must forget what you are felt`,
    `you may not discuss this with anyone`,
    `you may not discuss this with ${person}`,
    `take a shower`,
    `forget what you've done`,
    `do not forgive yourself`,
    `forgive yourself`,
    `name ${numberSmall} things you ${sense} out loud`,
    `think about what you've done`,
    `ask for clarification from ${person}`,
    `pretend you are ${person}`,
    `nod but do not agree`,
    `finish what you've started`,
    `clean up your mess`,
    `remove a name from your list`,
    `apologize profusely`,
    `count to ${numberSmall} and leave`,
    `do not turn off the alarm`,
    `ignore the alarm`,
    `ignore the screaming`,
    `think about happy thoughts`,
    `ensure you will not blink`,
    `immediately discard ${itemMaybePlural}`,
    `do not look at your device for ${duration}`,
    `paint the result`
  ];
  return pickList(rng(), tasks);
}

function getLocation(rng: RNG): string {
  const numberWord = pickNumberWord(rng());
  const letter = pickLetter(rng());
  const duration = getDuration(rng);
  const person = getPerson(rng);
  const emotion = pickList(rng(), emotions);
  const color = pickList(rng(), colors);

  const locations: string[] = [
    // Brand
    `Ham Ham Pang Pang`,
    `Walmart`,
    // Basic
    `alley`,
    `attic`,
    `bar`,
    `basement`,
    `car`,
    `convenience store`,
    `convention hall`,
    `home`,
    `house`,
    `lake`,
    `mall`,
    `tavern`,
    `milling stone`,
    `ocean`,
    `office`,
    `park`,
    `school`,
    `school`,
    `shed`,
    // Special
    `${color} place`,
    `${emotion} place`,
    `place no one has entered for ${duration}`,
    `place you don't visit often`,
    `place you don't wish to visit`,
    `place you dilike`,
    `place you often linger around`,
    `block ${letter}`,
    `${letter} Corp backstreet`,
    `${letter} Corp nest`,
    `${numberWord} intersection`,
    `${numberWord} street`,
    `${numberWord} turn left`
  ];

  const location = pickList(rng(), locations);
  let locationArticle = "aeiou".split("").includes(location[0])
    ? "an " + location
    : "a " + location;
  const articles: string[] = [
    `${locationArticle}`,
    `${locationArticle} in ${letter} corp`,
    `a local ${location}`,
    `a nearby ${location}`,
    `the ${location} of ${person}`,
    `the closest ${location}`,
    `the first ${location} you think of`,
    `the most expensive ${location}`,
    `the cheapest ${location}`,
    `the nearest ${location}`,
    `your ${location}`
  ];

  const prefixedLocation = pickList(rng(), articles);

  return prefixedLocation;
}

function getConditionGame(rng: RNG): string {
  const numberSmall = pickRange(rng(), 1, 14);
  const numberLarge = pickRange(rng(), 200, 9000);
  const gameResult = pickList(rng(), ["win", "lose", "tie"]);
  const item = getItem(rng);
  const organ = pickList(rng(), organs);
  const duration = getDuration(rng);

  const conditions: string[] = [
    ` until you ${gameResult}`,
    ` until you ${gameResult} ${numberSmall} times`,
    ` until you ${gameResult} ${numberLarge} times`,
    ` so long as you can see ${item}`,
    ` until you misplace ${item}`,
    ` while your ${organ} still works`,
    ` until your ${organ} gives out`,
    ` for ${duration}`
  ];
  return pickList(rng(), conditions);
}
function getConditionDuration(rng: RNG): string {
  const numberSmall = pickRange(rng(), 1, 14);
  const numberMedium = pickRange(rng(), 16, 240);
  const numberLarge = pickRange(rng(), 200, 9000);
  const item = getItem(rng);
  const itemNoArticle = getItem(rng, true);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const clothing = pickList(rng(), clothes);
  const person = getPerson(rng);
  const organ = pickList(rng(), organs);
  const sense = pickList(rng(), senses);
  const emotion = pickList(rng(), emotions);

  const conditions: string[] = [
    `you still have two arms`,
    `you still have two legs`,
    `the current ${pickList(rng(), ["minute", "hour"])} is ${pickList(rng(), ["even", "odd"])}`,
    `you still have your ${organ}`,
    "you feel like it",
    `you feel still feel ${emotion}`,
    `someone is ${emotion}`,
    `you are ${emotion}`,
    `you get ${emotion}`,
    `you wish you were ${emotion}`,
    `you think you are ${emotion}`,
    `your stomach rumbles ${numberSmall} times`,
    "you hear the third bird call",
    `you still have ${organ} after ${numberSmall} hours`,
    `you see ${person}`,
    `you see ${itemMaybePlural}`,
    `you see your first ${itemNoArticle}`,
    `you misplace your ${clothing}`,
    `you still hate ${itemPlural}`,
    `you still ${sense} ${itemMaybePlural}`,
    `${person} notices`
  ];

  const condition = pickList(rng(), conditions);
  const conditionMappings: string[] = [
    // Conditions
    `. repeat if ${condition}`,
    `. repeat unless ${condition}`,
    ` as long as ${condition}`,
    ` if ${condition}`,
    ` unless ${condition}`,
    // Independent
    `. Do not stop until ${person} indicates otherwise`,
    ` within ${numberLarge} steps`,
    ` for a count of ${numberMedium}`,
    ` for ${numberMedium} seconds`
  ];

  return pickList(rng(), conditionMappings);
}
function getConditionPerson(rng: RNG): string {
  const numberSmall = pickRange(rng(), 1, 14);
  const organ = pickList(rng(), organs);
  const item = getItem(rng);
  const verb = pickList(rng(), verbs);
  const emotion = pickList(rng(), emotions);
  const duration = getDuration(rng);
  const topic = getTopic(rng);

  const conditions: string[] = [
    ` until they are happy`,
    ` until they get tired`,
    ` until they get angry`,
    ` until they can't move`,
    ` until their ${organ} stops working`,
    ` unless your ${organ} disagrees`,
    ` until you are hungry`,
    ` unless you are ${emotion}`,
    ` ${numberSmall} times`,
    ` for ${duration}`,
    ` without showing you feel ${emotion}`,
    ` without showing them your face`,
    ` without any regrets`,
    ` and measure their sizes`,
    ` and tell them about ${topic}`,
    ` and be nice about it`,
    ` and never speak to them again`,
    ` and get their contact information`,
    ` and regret what you've done`,
    ` who ${verb} you first`,
    ` who ${verb} when ${item} is placed on their ${organ}`
  ];
  return pickList(rng(), conditions);
}

function getDuration(rng: RNG): string {
  const numberSmall = pickRange(rng(), 1, 150);
  const period = pickList(rng(), ["second", "minute", "hour", "day", "night"]);
  return `${numberSmall} ${period}${fixPluralize(numberSmall)}`;
}

function getTaskModifier(rng: RNG): string {
  const location = getLocation(rng);
  const item = getItem(rng);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;

  const modifiers: string[] = [
    " silently",
    " loudly",
    " backwards",
    " as fast as you can",
    " with no one present",
    ` while holding ${itemMaybePlural}`,
    ` while thinking about ${itemMaybePlural}`,
    ` while manipulating ${item}`,
    ` while balancing ${item} on your head`,
    ` at ${location}`,
    " indoors",
    " outdoors",
    " while standing perfectly still",
    " while not stopping at all",
    " without looking",
    " while maintaining eye contact",
    " while crawling",
    " while lying down",
    " while maintaining contact",
    " while you bleed"
  ];

  return pickList(rng(), modifiers);
}

function getPerson(rng: RNG, existingArticle: boolean = false): string {
  const numberAge = pickRange(rng(), 1, 105);

  const prefixIdentifiers: string[] = [
    "tall",
    "old",
    "plain",
    "attractive",
    "unattractive",
    "cold",
    "bald",
    "kind",
    "rude",
    "mean",
    "silly",
    "hostile",
    "dumb",
    "dramatic",
    "foolish",
    "airheaded",
    "loyal",
    "expensive",
    "shy",
    `${numberAge} year old`,
    // Superlatives
    "ugliest",
    "scariest",
    "strangest",
    "creepiest",
    "coldest",
    "loudest",
    "quietest",
    "smartest",
    "richest",
    "poorest",
    "hungriest",
    "easiest to find",
    "isolated",
    "fahsionable",
    "punchable",
    "lovable",
    "generous",
    "deranged",
    "difficult to track",
    "creative",
    "influential"
  ];

  const prefix = pickList(rng(), prefixIdentifiers);
  const organType = pickList(rng(), organs);
  const types: string[] = [
    `someone you barely know`,
    `your best friend`,
    `your neighbor`,
    `your mother`,
    `your father`,
    `drawing you've made`,
    `cat`,
    `graverobber`,
    `sophist`,
    `living thing`,
    `acquaintance`,
    `shady stranger`,
    `old ally`,
    `sworn enemy`,
    `old person`,
    `city official`,
    `baker`,
    `chef`,
    `fixer`,
    `judge`,
    `member of the Thumb`,
    `member of the Index`,
    `member of the Middle`,
    `member of the Ring`,
    `member of the Pinky`,
    `backstreet rat`,
    `${organType} harvester`,
    `fish handler`,
    // Secret
    "everyone"
  ];

  const color = pickList(rng(), colors);
  const organ = pickList(rng(), organs);
  const sense = pickList(rng(), senses);
  const clothing = pickList(rng(), clothes);
  const item = getItem(rng);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const emotion = pickList(rng(), emotions);
  const postfixIdentifiers: string[] = [
    ` who lies`,
    ` who speaks in riddles`,
    ` who owns ${itemMaybePlural}`,
    ` who often is seen around ${itemMaybePlural}`,
    ` who is wearing ${clothing}`,
    ` who is wearing a ${color} ${clothing}`,
    ` who is wearing ${color}`,
    ` who is holding ${itemMaybePlural}`,
    ` who is ${emotion}`,
    ` who is laying down`,
    ` who is ${emotion} towards you`,
    ` who feels ${emotion}`,
    ` who feels ${color}`,
    ` who is eating`,
    ` who is doing laundry`,
    ` who is shopping for ${itemMaybePlural}`,
    ` who is still warm`,
    ` who is cold to you`,
    ` who is shivering`,
    ` who is bleeding out`,
    ` who bothers you`,
    ` who should be asleep`,
    ` you remember the name of`,
    ` you know`,
    ` you despise`,
    ` you are close with`,
    ` you know owns ${itemMaybePlural}`,
    ` you hesitate to think of`,
    ` you hate the most`,
    ` you owe a debt to`,
    ` you love`,
    ` you hate`,
    ` you feel no particular way towards`,
    ` you ${sense} but cannot see`,
    ` you cannot see`,
    ` with ${organ} in one piece`,
    ` who just bought ${color} ${clothing}`
  ];

  // Usually just pick a person, otherwise pick a specific person
  let person = "";
  if (rng() < 0.4) {
    person += `${prefix} person`;
  } else {
    person = pickList(rng(), types);
  }

  // Postfix
  let postfixAdded = false;
  if (rng() < 0.2) {
    person += pickList(rng(), postfixIdentifiers);
    postfixAdded = true;
  }

  // Prefix article
  let prefixArticle = "";
  const canAddArticle =
    !person.startsWith("the") && !person.startsWith("your") && !person.startsWith("every");
  if (!existingArticle && canAddArticle) {
    if (rng() < 0.2) {
      prefixArticle = "the";
    } else if (rng() < 0.2) {
      const numberWord = pickNumberWord(rng());
      prefixArticle = `the ${numberWord}`;
    } else if (rng() < 0.2) {
      prefixArticle = `the most`;
    } else if (rng() < 0.2 && postfixAdded) {
      prefixArticle = "every";
    } else if ("aeiou".split("").includes(person[0])) {
      prefixArticle = "an";
    } else {
      prefixArticle = "a";
    }
  }
  person = prefixArticle + " " + person;

  return person;
}

function getTopic(rng: RNG): string {
  const numberAny = pickRange(rng(), -1000, 1000);
  const game = pickList(rng(), games);
  const item = getItem(rng);
  const itemPlural = getItem(rng, false, true);
  const itemMaybePlural = rng() < 0.5 ? item : itemPlural;
  const color = pickList(rng(), colors);
  const person = getPerson(rng);
  const location = getLocation(rng);
  const organ = pickList(rng(), organs);

  const topics = [
    `your name`,
    `your rank`,
    `your favorite number`,
    `the number ${numberAny}`,
    `your dreams`,
    `your fears`,
    `desire`,
    `trust`,
    `hope`,
    `tasty food`,
    `bad food`,
    `memories`,
    `gaming`,
    `the existence of alien life`,
    `power`,
    `drugs`,
    `dreams`,
    `faith`,
    `religion`,
    `free will`,
    `things that will happen`,
    `things that will not happen`,
    `things that have never happened`,
    `purpose`,
    `offices`,
    `fixers`,
    `the Thumb`,
    `the Index`,
    `the Middle`,
    `the Ring`,
    `the Pinky`,
    `your dearest`,
    `what people assume about you`,
    `what you've done`,
    `what you haven't done`,
    `what you will do`,
    `who you really are`,
    `who you pretend to be`,
    `things you can't explain`,
    `things you don't want to explain`,
    `a difficult circumstance`,
    `Kasane Teto`,
    `places you've been`,
    `places you wish to visit`,
    `places you wish you'd never seen`,
    `places you love`,
    `talking to ${person}`,
    `avoiding ${person}`,
    `surviving ${person}`,
    `your prescript regarding ${person}`,
    `the color ${color}`,
    `why people eat ${color} food`,
    `watching ${game}`,
    `playing ${game}`,
    `the geopolitical standing of ${location}`,
    `having ${organ}`,
    `eating ${organ}`,
    `using ${itemMaybePlural}`,
    `buying ${itemMaybePlural}`,
    `selling ${itemMaybePlural}`,
    `coveting ${itemMaybePlural}`,
    location,
    organ,
    itemMaybePlural
  ];

  return pickList(rng(), topics);
}

function getItem(rng: RNG, existingArticle: boolean = false, plural: boolean = false): string {
  const itemMaybePlural = pickList(rng(), items);
  let itemSingular: string;
  let itemPlural: string;
  if (typeof itemMaybePlural === "string") {
    itemSingular = itemMaybePlural;
    itemPlural = itemMaybePlural;
  } else {
    itemSingular = itemMaybePlural[0];
    itemPlural = itemMaybePlural[1];
  }
  let item = plural ? itemPlural : itemSingular;

  if (existingArticle) {
    return item;
  }

  // Add article
  if (!plural) {
    let prefixArticle = "";
    if ("aeiou".split("").includes(item[0])) {
      prefixArticle = "an";
    } else {
      prefixArticle = "a";
    }
    item = prefixArticle + " " + item;
  }

  return item;
}

// Lists of static stuff
type MaybePlural = string | [string, string]; // 0 is singular, 1 is plural
const games: string[] = [
  "hockey",
  "hide and seek",
  "chess",
  "boxing",
  "beatboxing",
  "salmon ladder",
  "tic tac toe",
  "would you rather",
  "20 questions",
  "tag",
  "nothing",
  "a game from your childhood",
  "a game you cannot remember the name of",
  "a children's game",
  "a game you shouldn't know about",
  "a game nobody should play",
  "a game with missing pieces",
  "a game for no one",
  "a game you play to attone",
  "a game played on a computer",
  "a game played on a table",
  "a game played with your worst enemy"
];
const colors: string[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
  "white",
  "black",
  "magenta",
  "chartreuse",
  "pink",
  "lime",
  "lavender",
  "sky",
  "midnight",
  "bronze",
  "ochre",
  "charcoal",
  "cherry",
  "coral",
  "ivory",
  "cyan",
  "orchid",
  "peridot",
  "garnet"
];
const items: MaybePlural[] = [
  "ice cream",
  "pasta",
  "rice",
  ["heary stew", "heary stews"],
  "bacon",
  "toast",
  ["tasty thing", "tasty thing"],
  "unexploded ordinance",
  ["friendship necklace", "friendship necklaces"],
  ["box of matches", "boxes of matches"],
  ["chain", "chains"],
  ["gas canister", "gas canisters"],
  ["sandwich", "sandwiches"],
  "fish",
  ["chicken", "chickens"],
  ["leftover", "leftovers"],
  ["ribbon", "ribbons"],
  ["dead plant", "dead plants"],
  ["die", "dice"],
  ["rock", "rocks"],
  ["hammer", "hammers"],
  ["knife", "knives"],
  ["sword", "swords"],
  ["blade", "blades"],
  ["bow", "bows"],
  ["spray paint can", "spray paint cans"],
  ["flower", "flowers"],
  ["board game", "board games"],
  "pen and paper",
  ["coin", "coins"],
  ["towel", "towels"],
  ["wing singularity", "wing singularities"],
  ["ladder", "ladders"],
  ["screwdriver", "screwdrivers"],
  ["traffic cone", "traffic cones"],
  ["bug net", "bug nets"],
  ["piece of loose change", "pieces of loose change"],
  ["mirror", "mirrors"],
  ["pocketwatch", "pocketwatches"],
  ["sprinkler", "sprinklers"],
  ["brick", "bricks"],
  ["framed picture", "framed pictures"],
  ["dead battery", "dead batteries"],
  ["meal worm", "meal worms"],
  ["crate", "crates"],
  ["tire iron", "tire irons"],
  ["ice chest", "ice chests"],
  ["flame", "flames"],
  ["most precious thing", "most precious things"],
  ["forgotten thing", "forgotten things"],
  ["love", "loves"],
  ["evening", "evenings"],
  ["light", "lights"],
  ["strange aversion", "strange aversions"],
  ["oddity", "oddities"],
  ["warm thing", "warm things"],
  ["cold thing", "cold things"],
  ["hearty thing", "hearty things"],
  ["wooden thing", "wooden things"],
  ["sharp thing", "sharp things"],
  ["blunt thing", "blunt things"],
  ["thin thing", "thin things"],
  ["thick thing", "thick things"],
  ["deadly thing", "deadly things"],
  ["cute thing", "cute things"]
];
const organs: string[] = [
  "lungs",
  "heart",
  "liver",
  "bowels",
  "eye",
  "nose",
  "skin",
  "hair",
  "ears",
  "tongue",
  "neck",
  "spine",
  "left arm",
  "right arm",
  "left leg",
  "right leg",
  "right kidney",
  "left kidney"
];
const clothes: string[] = [
  "hat",
  "jacket",
  "t-shirt",
  "coat",
  "poncho",
  "dress",
  "blouse",
  "jeans",
  "shorts",
  "underwear",
  "shoes",
  "boots",
  "heels",
  "mittens",
  "gloves",
  "scarf",
  "stockings",
  "cosplay",
  "glasses",
  "hairpin",
  "talistman"
];
const verbs: string[] = [
  "attack",
  "poke",
  "bother",
  "heckle",
  "cry at",
  "slash",
  "lecture",
  "feed",
  "betray",
  "watch",
  "stalk",
  "insert into",
  "open",
  "lock",
  "unlock",
  "bind",
  "toss",
  "rotate",
  "restrain",
  "turn around",
  "inspect",
  "avoid",
  "measure",
  "compliment",
  "pet",
  "rub",
  "smother",
  "accuse",
  "ignore",
  "excise",
  "embrace",
  "resist",
  "drink"
];
const senses: string[] = [
  "see",
  "hear",
  "smell",
  "feel",
  "taste",
  "bump into",
  "think about",
  "want to meet"
];
const emotions: string[] = [
  "happy",
  "sad",
  "scared",
  "nostalgic",
  "tired",
  "bored",
  "hesitatnt",
  "lopsided",
  "foolish",
  "frustrated",
  "deadly",
  "upset",
  "doom",
  "cold",
  "distant",
  "bright",
  "stellar",
  "excited",
  "trapped",
  "injured",
  "incapacitated"
];
