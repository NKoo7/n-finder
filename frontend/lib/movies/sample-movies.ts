import type { MoodProfile } from "@/lib/mood-dimensions";
import type { Genre, Movie } from "./types";

/**
 * N-finder SAMPLE CATALOGUE (demo data).
 *
 * - Titles, years and directors are general-knowledge facts and have NOT been verified
 *   against an external database.
 * - Synopses, genres and themes are this project's own short wording.
 * - Mood ratings and pacing are SUBJECTIVE CURATED DEMO CLASSIFICATIONS, not objective facts.
 *   They exist so the mood engine has something consistent to work with.
 * - No poster images are bundled (no reliable licensed source), so the UI draws fallback art.
 *
 * Mood scale for every film (0..100): see lib/mood-dimensions.ts.
 * Argument order for `mood()` below: tone, intensity, realism, focus, predictability
 *   tone 0=dark..100=hopeful | intensity 0=relaxing..100=intense | realism 0=realistic..100=surreal
 *   focus 0=character-driven..100=plot-driven | predictability 0=predictable..100=unpredictable
 */
export const SAMPLE_DATASET_LABEL =
  "Sample catalogue: films, years and directors are from general knowledge and not verified against an external source. Mood ratings are subjective, curated demo classifications, not facts.";

const mood = (
  tone: number,
  intensity: number,
  realism: number,
  focus: number,
  predictability: number,
): MoodProfile => ({ tone, intensity, realism, focus, predictability });

interface Entry {
  id: string;
  title: string;
  year: number;
  directors: string[];
  genres: Genre[];
  synopsis: string;
  mood: MoodProfile;
  pacing: number;
  themes: string[];
}

const ENTRIES: Entry[] = [
  { id: "parasite-2019", title: "Parasite", year: 2019, directors: ["Bong Joon-ho"], genres: ["Thriller", "Drama", "Comedy"], synopsis: "A struggling family schemes its way into the lives of a wealthy household, and the arrangement slowly slips out of their control.", mood: mood(25, 78, 35, 70, 82), pacing: 60, themes: ["class divide", "deception", "survival"] },
  { id: "spirited-away-2001", title: "Spirited Away", year: 2001, directors: ["Hayao Miyazaki"], genres: ["Animation", "Fantasy", "Adventure"], synopsis: "A girl stranded in a world of spirits must work in a strange bathhouse to free herself and her parents.", mood: mood(70, 45, 88, 55, 68), pacing: 50, themes: ["growing up", "identity", "work"] },
  { id: "blade-runner-2049-2017", title: "Blade Runner 2049", year: 2017, directors: ["Denis Villeneuve"], genres: ["Sci-Fi", "Drama", "Mystery"], synopsis: "A replicant officer uncovers a long-buried secret that could upend the fragile order of a bleak future.", mood: mood(35, 45, 62, 50, 55), pacing: 15, themes: ["artificial life", "memory", "purpose"] },
  { id: "grand-budapest-hotel-2014", title: "The Grand Budapest Hotel", year: 2014, directors: ["Wes Anderson"], genres: ["Comedy", "Adventure", "Drama"], synopsis: "A devoted hotel concierge and his young protege are swept into a caper involving a stolen painting and a feuding family.", mood: mood(65, 35, 60, 60, 50), pacing: 65, themes: ["loyalty", "nostalgia", "friendship"] },
  { id: "mad-max-fury-road-2015", title: "Mad Max: Fury Road", year: 2015, directors: ["George Miller"], genres: ["Action", "Adventure", "Sci-Fi"], synopsis: "In a wasteland ruled by a tyrant, a desperate escape across the desert turns into one long, ferocious chase.", mood: mood(45, 95, 55, 80, 35), pacing: 98, themes: ["freedom", "survival", "redemption"] },
  { id: "eternal-sunshine-2004", title: "Eternal Sunshine of the Spotless Mind", year: 2004, directors: ["Michel Gondry"], genres: ["Romance", "Drama", "Sci-Fi"], synopsis: "After a painful breakup, a man undergoes a procedure to erase his memories of the relationship and discovers what he is giving up.", mood: mood(55, 50, 70, 25, 62), pacing: 45, themes: ["memory", "heartbreak", "second chances"] },
  { id: "moonlight-2016", title: "Moonlight", year: 2016, directors: ["Barry Jenkins"], genres: ["Drama"], synopsis: "Three chapters follow one man across his life as he searches for a sense of self and tenderness.", mood: mood(40, 40, 12, 12, 40), pacing: 25, themes: ["identity", "intimacy", "masculinity"] },
  { id: "inception-2010", title: "Inception", year: 2010, directors: ["Christopher Nolan"], genres: ["Sci-Fi", "Thriller", "Action"], synopsis: "A team of specialists enters layered dreams to plant an idea in a target's mind, while the leader's own past threatens the job.", mood: mood(40, 80, 72, 88, 70), pacing: 70, themes: ["dreams", "guilt", "reality"] },
  { id: "shawshank-redemption-1994", title: "The Shawshank Redemption", year: 1994, directors: ["Frank Darabont"], genres: ["Drama"], synopsis: "Over many years inside a harsh prison, two inmates build a quiet friendship and hold on to hope.", mood: mood(82, 45, 15, 55, 38), pacing: 35, themes: ["hope", "friendship", "injustice"] },
  { id: "pans-labyrinth-2006", title: "Pan's Labyrinth", year: 2006, directors: ["Guillermo del Toro"], genres: ["Fantasy", "Drama", "War"], synopsis: "In a brutal military outpost, a young girl is drawn into a dark fairy-tale underworld and a series of dangerous tasks.", mood: mood(20, 72, 78, 55, 60), pacing: 45, themes: ["fascism", "imagination", "sacrifice"] },
  { id: "lost-in-translation-2003", title: "Lost in Translation", year: 2003, directors: ["Sofia Coppola"], genres: ["Drama", "Romance", "Comedy"], synopsis: "Two lonely strangers in Tokyo form an unlikely bond over a few sleepless days.", mood: mood(55, 15, 15, 10, 42), pacing: 15, themes: ["loneliness", "connection", "displacement"] },
  { id: "mulholland-drive-2001", title: "Mulholland Drive", year: 2001, directors: ["David Lynch"], genres: ["Mystery", "Drama", "Thriller"], synopsis: "An aspiring actress and a woman with no memory try to piece together an identity in a dreamlike Hollywood.", mood: mood(22, 62, 92, 45, 96), pacing: 30, themes: ["identity", "ambition", "illusion"] },
  { id: "whiplash-2014", title: "Whiplash", year: 2014, directors: ["Damien Chazelle"], genres: ["Drama", "Music"], synopsis: "A young drummer enrolls in an elite conservatory and clashes with an unrelenting instructor.", mood: mood(35, 90, 12, 55, 60), pacing: 82, themes: ["obsession", "ambition", "mentorship"] },
  { id: "arrival-2016", title: "Arrival", year: 2016, directors: ["Denis Villeneuve"], genres: ["Sci-Fi", "Drama"], synopsis: "When mysterious craft appear around the world, a linguist is recruited to find a way to communicate with the visitors.", mood: mood(62, 45, 55, 50, 68), pacing: 30, themes: ["language", "time", "grief"] },
  { id: "amelie-2001", title: "Amélie", year: 2001, directors: ["Jean-Pierre Jeunet"], genres: ["Romance", "Comedy"], synopsis: "A shy Parisian quietly arranges small kindnesses for others while avoiding her own chance at love.", mood: mood(85, 25, 55, 25, 45), pacing: 55, themes: ["kindness", "shyness", "everyday magic"] },
  { id: "seven-samurai-1954", title: "Seven Samurai", year: 1954, directors: ["Akira Kurosawa"], genres: ["Action", "Drama", "Adventure"], synopsis: "A village under threat hires seven masterless warriors to help defend it before the harvest is taken.", mood: mood(60, 70, 18, 60, 35), pacing: 45, themes: ["duty", "community", "honour"] },
  { id: "get-out-2017", title: "Get Out", year: 2017, directors: ["Jordan Peele"], genres: ["Horror", "Thriller", "Mystery"], synopsis: "A visit to his girlfriend's family estate becomes increasingly unsettling for a young photographer.", mood: mood(25, 82, 45, 70, 75), pacing: 62, themes: ["race", "control", "social unease"] },
  { id: "princess-mononoke-1997", title: "Princess Mononoke", year: 1997, directors: ["Hayao Miyazaki"], genres: ["Animation", "Fantasy", "Adventure"], synopsis: "A cursed warrior is caught between an industrial settlement and the forest gods fighting to protect their home.", mood: mood(50, 70, 72, 60, 50), pacing: 60, themes: ["nature", "conflict", "coexistence"] },
  { id: "before-sunrise-1995", title: "Before Sunrise", year: 1995, directors: ["Richard Linklater"], genres: ["Romance", "Drama"], synopsis: "Two strangers meet on a train and spend one night walking and talking through Vienna.", mood: mood(72, 12, 8, 8, 40), pacing: 20, themes: ["conversation", "romance", "fleeting time"] },
  { id: "oldboy-2003", title: "Oldboy", year: 2003, directors: ["Park Chan-wook"], genres: ["Thriller", "Mystery", "Action"], synopsis: "Released after years of unexplained imprisonment, a man sets out to learn who took his life from him and why.", mood: mood(12, 92, 60, 78, 90), pacing: 65, themes: ["revenge", "captivity", "secrets"] },
  { id: "paddington-2-2017", title: "Paddington 2", year: 2017, directors: ["Paul King"], genres: ["Comedy", "Family", "Adventure"], synopsis: "A polite bear is wrongly jailed and wins over the people around him while his family works to clear his name.", mood: mood(95, 25, 50, 55, 25), pacing: 65, themes: ["kindness", "family", "justice"] },
  { id: "2001-space-odyssey-1968", title: "2001: A Space Odyssey", year: 1968, directors: ["Stanley Kubrick"], genres: ["Sci-Fi", "Mystery"], synopsis: "A slow, enigmatic journey from the dawn of humanity to a mission toward Jupiter and beyond.", mood: mood(40, 30, 90, 40, 62), pacing: 8, themes: ["evolution", "technology", "the unknown"] },
  { id: "the-godfather-1972", title: "The Godfather", year: 1972, directors: ["Francis Ford Coppola"], genres: ["Crime", "Drama"], synopsis: "The aging head of a crime family passes the business to a reluctant son, and the cost of that choice unfolds.", mood: mood(22, 60, 18, 55, 40), pacing: 35, themes: ["family", "power", "loyalty"] },
  { id: "little-miss-sunshine-2006", title: "Little Miss Sunshine", year: 2006, directors: ["Jonathan Dayton", "Valerie Faris"], genres: ["Comedy", "Drama"], synopsis: "A dysfunctional family piles into a battered van to get their youngest member to a children's pageant.", mood: mood(78, 30, 25, 20, 38), pacing: 55, themes: ["family", "failure", "acceptance"] },
  { id: "everything-everywhere-2022", title: "Everything Everywhere All at Once", year: 2022, directors: ["Daniel Kwan", "Daniel Scheinert"], genres: ["Sci-Fi", "Comedy", "Action"], synopsis: "An overwhelmed laundromat owner is pulled into a multiverse-spanning conflict that is also about her family.", mood: mood(80, 90, 95, 55, 92), pacing: 95, themes: ["family", "nihilism", "kindness"] },
  { id: "her-2013", title: "Her", year: 2013, directors: ["Spike Jonze"], genres: ["Romance", "Drama", "Sci-Fi"], synopsis: "A lonely writer develops a relationship with an artificially intelligent operating system.", mood: mood(55, 15, 40, 12, 40), pacing: 20, themes: ["loneliness", "technology", "love"] },
  { id: "no-country-for-old-men-2007", title: "No Country for Old Men", year: 2007, directors: ["Joel Coen", "Ethan Coen"], genres: ["Crime", "Thriller", "Drama"], synopsis: "A hunter finds a case of money in the desert and is pursued by a relentless killer while a weary sheriff trails them both.", mood: mood(8, 85, 22, 70, 72), pacing: 40, themes: ["fate", "violence", "moral decline"] },
  { id: "my-neighbor-totoro-1988", title: "My Neighbor Totoro", year: 1988, directors: ["Hayao Miyazaki"], genres: ["Animation", "Family", "Fantasy"], synopsis: "Two sisters settle into a countryside home and befriend gentle forest spirits while their mother is ill.", mood: mood(92, 8, 70, 15, 15), pacing: 30, themes: ["childhood", "nature", "family"] },
  { id: "seventh-seal-1957", title: "The Seventh Seal", year: 1957, directors: ["Ingmar Bergman"], genres: ["Drama", "Fantasy"], synopsis: "A knight returning from the crusades plays a game of chess with Death while a plague spreads.", mood: mood(25, 40, 70, 40, 50), pacing: 30, themes: ["mortality", "faith", "meaning"] },
  { id: "portrait-lady-on-fire-2019", title: "Portrait of a Lady on Fire", year: 2019, directors: ["Céline Sciamma"], genres: ["Drama", "Romance"], synopsis: "A painter is commissioned to secretly portray a reluctant young woman, and the two grow close on a remote island.", mood: mood(45, 38, 15, 15, 40), pacing: 18, themes: ["desire", "art", "memory"] },
  { id: "the-lighthouse-2019", title: "The Lighthouse", year: 2019, directors: ["Robert Eggers"], genres: ["Horror", "Drama", "Fantasy"], synopsis: "Two keepers on a remote island slide into paranoia and hallucination as a storm isolates them.", mood: mood(8, 82, 88, 25, 78), pacing: 30, themes: ["isolation", "madness", "power"] },
  { id: "spider-verse-2018", title: "Spider-Man: Into the Spider-Verse", year: 2018, directors: ["Bob Persichetti", "Peter Ramsey", "Rodney Rothman"], genres: ["Animation", "Action", "Adventure"], synopsis: "A teenager from Brooklyn meets other Spider-people from alternate dimensions and learns what it takes to wear the mask.", mood: mood(85, 70, 80, 60, 40), pacing: 90, themes: ["identity", "responsibility", "family"] },
  { id: "stalker-1979", title: "Stalker", year: 1979, directors: ["Andrei Tarkovsky"], genres: ["Sci-Fi", "Drama"], synopsis: "A guide leads two men through a forbidden zone said to contain a room that grants desires.", mood: mood(30, 25, 85, 20, 60), pacing: 5, themes: ["faith", "desire", "the unknown"] },
  { id: "the-social-network-2010", title: "The Social Network", year: 2010, directors: ["David Fincher"], genres: ["Drama", "Biography"], synopsis: "The founding of a world-changing website is retold through lawsuits, friendships and rivalries.", mood: mood(38, 65, 8, 55, 38), pacing: 85, themes: ["ambition", "betrayal", "technology"] },
  { id: "paterson-2016", title: "Paterson", year: 2016, directors: ["Jim Jarmusch"], genres: ["Drama", "Comedy"], synopsis: "A bus driver in a small city finds quiet creativity in the rhythms of an ordinary week.", mood: mood(78, 6, 8, 5, 20), pacing: 12, themes: ["routine", "creativity", "contentment"] },
  { id: "memento-2000", title: "Memento", year: 2000, directors: ["Christopher Nolan"], genres: ["Thriller", "Mystery"], synopsis: "A man unable to form new memories hunts for his wife's killer using notes and tattoos, told in a fractured order.", mood: mood(22, 75, 40, 85, 85), pacing: 70, themes: ["memory", "revenge", "self-deception"] },
  { id: "chungking-express-1994", title: "Chungking Express", year: 1994, directors: ["Wong Kar-wai"], genres: ["Romance", "Drama", "Crime"], synopsis: "Two lovelorn Hong Kong police officers cross paths with strangers in two loosely linked stories.", mood: mood(68, 30, 45, 15, 55), pacing: 70, themes: ["longing", "city life", "chance"] },
  { id: "coco-2017", title: "Coco", year: 2017, directors: ["Lee Unkrich"], genres: ["Animation", "Family", "Fantasy"], synopsis: "A boy who dreams of music enters the land of the dead to uncover his family's history.", mood: mood(88, 40, 75, 55, 40), pacing: 60, themes: ["family", "remembrance", "music"] },
  { id: "rear-window-1954", title: "Rear Window", year: 1954, directors: ["Alfred Hitchcock"], genres: ["Thriller", "Mystery"], synopsis: "A photographer confined to his apartment begins to suspect something is wrong across the courtyard.", mood: mood(55, 65, 12, 80, 45), pacing: 45, themes: ["voyeurism", "suspicion", "confinement"] },
  { id: "perfect-blue-1997", title: "Perfect Blue", year: 1997, directors: ["Satoshi Kon"], genres: ["Animation", "Thriller", "Horror"], synopsis: "A pop singer turned actress finds the line between her roles, her fans and her own mind starting to blur.", mood: mood(12, 85, 75, 55, 88), pacing: 65, themes: ["identity", "fame", "paranoia"] },
  { id: "the-truman-show-1998", title: "The Truman Show", year: 1998, directors: ["Peter Weir"], genres: ["Comedy", "Drama", "Sci-Fi"], synopsis: "An ordinary man gradually realizes that his entire life is a constructed performance for an audience.", mood: mood(68, 40, 60, 55, 52), pacing: 55, themes: ["control", "freedom", "media"] },
  { id: "hereditary-2018", title: "Hereditary", year: 2018, directors: ["Ari Aster"], genres: ["Horror", "Drama", "Mystery"], synopsis: "After a death in the family, a household is haunted by grief and by something worse.", mood: mood(5, 95, 45, 45, 75), pacing: 40, themes: ["grief", "inheritance", "dread"] },
  { id: "roma-2018", title: "Roma", year: 2018, directors: ["Alfonso Cuarón"], genres: ["Drama"], synopsis: "A year in the life of a domestic worker in a middle-class household in early 1970s Mexico City.", mood: mood(38, 30, 8, 10, 40), pacing: 20, themes: ["class", "family", "resilience"] },
  { id: "wall-e-2008", title: "WALL-E", year: 2008, directors: ["Andrew Stanton"], genres: ["Animation", "Sci-Fi", "Family"], synopsis: "A lonely waste-collecting robot on an abandoned Earth follows a visiting probe into space.", mood: mood(85, 30, 70, 50, 30), pacing: 45, themes: ["loneliness", "consumerism", "hope"] },
];

export const SAMPLE_MOVIES: readonly Movie[] = ENTRIES;
