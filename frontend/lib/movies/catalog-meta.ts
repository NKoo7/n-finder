import type { Movie } from "./types";

/**
 * Extra catalogue metadata for search and ratings.
 *
 * SAMPLE DATA: no licensed metadata API is configured in this build. Cast lists are
 * general-knowledge facts; IMDb and Rotten Tomatoes values are approximate snapshots
 * from general knowledge, NOT live scores. The UI labels them as sample ratings.
 * To go live, connect a licensed provider (e.g. TMDB/OMDb) server-side and replace
 * this map — never put API keys in client code.
 */
export interface CatalogMeta {
  cast: readonly string[];
  /** Approximate IMDb rating out of 10, or null when unknown. */
  imdb: number | null;
  /** Approximate Rotten Tomatoes critics score %, or null when unknown. */
  rt: number | null;
}

export const RATINGS_LABEL =
  "Sample ratings: approximate IMDb / Rotten Tomatoes snapshots from general knowledge, not live scores. Connect a licensed metadata API for verified values.";

const META: Record<string, CatalogMeta> = {
  "parasite-2019": { cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"], imdb: 8.5, rt: 99 },
  "spirited-away-2001": { cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"], imdb: 8.6, rt: 97 },
  "blade-runner-2049-2017": { cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"], imdb: 8.0, rt: 88 },
  "grand-budapest-hotel-2014": { cast: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"], imdb: 8.1, rt: 92 },
  "mad-max-fury-road-2015": { cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"], imdb: 8.1, rt: 97 },
  "eternal-sunshine-2004": { cast: ["Jim Carrey", "Kate Winslet", "Kirsten Dunst"], imdb: 8.3, rt: 92 },
  "moonlight-2016": { cast: ["Trevante Rhodes", "Mahershala Ali", "Naomie Harris"], imdb: 7.4, rt: 98 },
  "inception-2010": { cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"], imdb: 8.8, rt: 87 },
  "shawshank-redemption-1994": { cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"], imdb: 9.3, rt: 91 },
  "pans-labyrinth-2006": { cast: ["Ivana Baquero", "Sergi López", "Maribel Verdú"], imdb: 8.2, rt: 95 },
  "lost-in-translation-2003": { cast: ["Bill Murray", "Scarlett Johansson", "Anna Faris"], imdb: 7.7, rt: 95 },
  "mulholland-drive-2001": { cast: ["Naomi Watts", "Laura Harring", "Justin Theroux"], imdb: 7.9, rt: 84 },
  "whiplash-2014": { cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser"], imdb: 8.5, rt: 94 },
  "arrival-2016": { cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"], imdb: 7.9, rt: 94 },
  "amelie-2001": { cast: ["Audrey Tautou", "Mathieu Kassovitz", "Rufus"], imdb: 8.3, rt: 89 },
  "seven-samurai-1954": { cast: ["Toshirō Mifune", "Takashi Shimura", "Keiko Tsushima"], imdb: 8.6, rt: 100 },
  "get-out-2017": { cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"], imdb: 7.8, rt: 98 },
  "princess-mononoke-1997": { cast: ["Yōji Matsuda", "Yuriko Ishida", "Yūko Tanaka"], imdb: 8.3, rt: 93 },
  "before-sunrise-1995": { cast: ["Ethan Hawke", "Julie Delpy"], imdb: 8.1, rt: 100 },
  "oldboy-2003": { cast: ["Choi Min-sik", "Yoo Ji-tae", "Kang Hye-jung"], imdb: 8.4, rt: 83 },
  "paddington-2-2017": { cast: ["Ben Whishaw", "Hugh Grant", "Sally Hawkins"], imdb: 7.8, rt: 99 },
  "2001-space-odyssey-1968": { cast: ["Keir Dullea", "Gary Lockwood", "Douglas Rain"], imdb: 8.3, rt: 92 },
  "the-godfather-1972": { cast: ["Marlon Brando", "Al Pacino", "James Caan"], imdb: 9.2, rt: 97 },
  "little-miss-sunshine-2006": { cast: ["Abigail Breslin", "Greg Kinnear", "Toni Collette"], imdb: 7.8, rt: 91 },
  "everything-everywhere-2022": { cast: ["Michelle Yeoh", "Ke Huy Quan", "Jamie Lee Curtis"], imdb: 7.8, rt: 94 },
  "her-2013": { cast: ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"], imdb: 8.0, rt: 94 },
  "no-country-for-old-men-2007": { cast: ["Josh Brolin", "Javier Bardem", "Tommy Lee Jones"], imdb: 8.2, rt: 93 },
  "my-neighbor-totoro-1988": { cast: ["Noriko Hidaka", "Chika Sakamoto", "Hitoshi Takagi"], imdb: 8.1, rt: 94 },
  "seventh-seal-1957": { cast: ["Max von Sydow", "Gunnar Björnstrand", "Bibi Andersson"], imdb: 8.1, rt: 93 },
  "portrait-lady-on-fire-2019": { cast: ["Noémie Merlant", "Adèle Haenel", "Luàna Bajrami"], imdb: 8.1, rt: 97 },
  "the-lighthouse-2019": { cast: ["Robert Pattinson", "Willem Dafoe"], imdb: 7.4, rt: 90 },
  "spider-verse-2018": { cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld"], imdb: 8.4, rt: 97 },
  "stalker-1979": { cast: ["Alisa Freyndlikh", "Aleksandr Kaydanovskiy", "Anatoliy Solonitsyn"], imdb: 8.1, rt: 100 },
  "the-social-network-2010": { cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake"], imdb: 7.8, rt: 96 },
  "paterson-2016": { cast: ["Adam Driver", "Golshifteh Farahani"], imdb: 7.3, rt: 96 },
  "memento-2000": { cast: ["Guy Pearce", "Carrie-Anne Moss", "Joe Pantoliano"], imdb: 8.4, rt: 94 },
  "chungking-express-1994": { cast: ["Tony Leung", "Faye Wong", "Takeshi Kaneshiro"], imdb: 8.0, rt: 88 },
  "coco-2017": { cast: ["Anthony Gonzalez", "Gael García Bernal", "Benjamin Bratt"], imdb: 8.4, rt: 97 },
  "rear-window-1954": { cast: ["James Stewart", "Grace Kelly", "Thelma Ritter"], imdb: 8.5, rt: 98 },
  "perfect-blue-1997": { cast: ["Junko Iwao", "Rica Matsumoto", "Shinpachi Tsuji"], imdb: 8.0, rt: 84 },
  "the-truman-show-1998": { cast: ["Jim Carrey", "Ed Harris", "Laura Linney"], imdb: 8.2, rt: 94 },
  "hereditary-2018": { cast: ["Toni Collette", "Alex Wolff", "Milly Shapiro"], imdb: 7.3, rt: 90 },
  "roma-2018": { cast: ["Yalitza Aparicio", "Marina de Tavira"], imdb: 7.7, rt: 96 },
  "wall-e-2008": { cast: ["Ben Burtt", "Elissa Knight", "Jeff Garlin"], imdb: 8.4, rt: 95 },
};

export function catalogMeta(id: string): CatalogMeta {
  return META[id] ?? { cast: [], imdb: null, rt: null };
}

/** Search across title, director and cast (case-insensitive substring). */
export function searchCatalog(movies: readonly Movie[], query: string): readonly Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return movies;
  return movies.filter((m) => {
    const meta = catalogMeta(m.id);
    return (
      m.title.toLowerCase().includes(q) ||
      m.directors.some((d) => d.toLowerCase().includes(q)) ||
      meta.cast.some((c) => c.toLowerCase().includes(q))
    );
  });
}