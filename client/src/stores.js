import { writable, derived } from "svelte/store";
import { UMAP } from "umap-js";
import { dsv } from "d3-fetch";

const stopwords = new Set([
  "a",
  "a's",
  "able",
  "about",
  "above",
  "according",
  "accordingly",
  "across",
  "actually",
  "after",
  "afterwards",
  "again",
  "against",
  "ain't",
  "all",
  "allow",
  "allows",
  "almost",
  "alone",
  "along",
  "already",
  "also",
  "although",
  "always",
  "am",
  "among",
  "amongst",
  "an",
  "and",
  "another",
  "any",
  "anybody",
  "anyhow",
  "anyone",
  "anything",
  "anyway",
  "anyways",
  "anywhere",
  "apart",
  "appear",
  "appreciate",
  "appropriate",
  "are",
  "aren't",
  "around",
  "as",
  "aside",
  "ask",
  "asking",
  "associated",
  "at",
  "available",
  "away",
  "awfully",
  "b",
  "be",
  "became",
  "because",
  "become",
  "becomes",
  "becoming",
  "been",
  "before",
  "beforehand",
  "behind",
  "being",
  "believe",
  "below",
  "beside",
  "besides",
  "best",
  "better",
  "between",
  "beyond",
  "both",
  "brief",
  "but",
  "by",
  "c",
  "c'mon",
  "c's",
  "came",
  "can",
  "can't",
  "cannot",
  "cant",
  "cause",
  "causes",
  "certain",
  "certainly",
  "changes",
  "clearly",
  "co",
  "com",
  "come",
  "comes",
  "concerning",
  "consequently",
  "consider",
  "considering",
  "contain",
  "containing",
  "contains",
  "corresponding",
  "could",
  "couldn't",
  "course",
  "currently",
  "d",
  "definitely",
  "described",
  "despite",
  "did",
  "didn't",
  "different",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "done",
  "down",
  "downwards",
  "during",
  "e",
  "each",
  "edu",
  "eg",
  "eight",
  "either",
  "else",
  "elsewhere",
  "enough",
  "entirely",
  "especially",
  "et",
  "etc",
  "even",
  "ever",
  "every",
  "everybody",
  "everyone",
  "everything",
  "everywhere",
  "ex",
  "exactly",
  "example",
  "except",
  "f",
  "far",
  "few",
  "fifth",
  "first",
  "five",
  "followed",
  "following",
  "follows",
  "for",
  "former",
  "formerly",
  "forth",
  "four",
  "from",
  "further",
  "furthermore",
  "g",
  "get",
  "gets",
  "getting",
  "given",
  "gives",
  "go",
  "goes",
  "going",
  "gone",
  "got",
  "gotten",
  "greetings",
  "h",
  "had",
  "hadn't",
  "happens",
  "hardly",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he's",
  "hello",
  "help",
  "hence",
  "her",
  "here",
  "here's",
  "hereafter",
  "hereby",
  "herein",
  "hereupon",
  "hers",
  "herself",
  "hi",
  "him",
  "himself",
  "his",
  "hither",
  "hopefully",
  "how",
  "howbeit",
  "however",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "ie",
  "if",
  "ignored",
  "immediate",
  "in",
  "inasmuch",
  "inc",
  "indeed",
  "indicate",
  "indicated",
  "indicates",
  "inner",
  "insofar",
  "instead",
  "into",
  "inward",
  "is",
  "isn't",
  "it",
  "it'd",
  "it'll",
  "it's",
  "its",
  "itself",
  "j",
  "just",
  "k",
  "keep",
  "keeps",
  "kept",
  "know",
  "known",
  "knows",
  "l",
  "last",
  "lately",
  "later",
  "latter",
  "latterly",
  "least",
  "less",
  "lest",
  "let",
  "let's",
  "like",
  "liked",
  "likely",
  "little",
  "look",
  "looking",
  "looks",
  "ltd",
  "m",
  "mainly",
  "many",
  "may",
  "maybe",
  "me",
  "mean",
  "meanwhile",
  "merely",
  "might",
  "more",
  "moreover",
  "most",
  "mostly",
  "much",
  "must",
  "my",
  "myself",
  "n",
  "name",
  "namely",
  "nd",
  "near",
  "nearly",
  "necessary",
  "need",
  "needs",
  "neither",
  "never",
  "nevertheless",
  "new",
  "next",
  "nine",
  "no",
  "nobody",
  "non",
  "none",
  "noone",
  "nor",
  "normally",
  "not",
  "nothing",
  "novel",
  "now",
  "nowhere",
  "o",
  "obviously",
  "of",
  "off",
  "often",
  "oh",
  "ok",
  "okay",
  "old",
  "on",
  "once",
  "one",
  "ones",
  "only",
  "onto",
  "or",
  "other",
  "others",
  "otherwise",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "outside",
  "over",
  "overall",
  "own",
  "p",
  "particular",
  "particularly",
  "per",
  "perhaps",
  "placed",
  "please",
  "plus",
  "possible",
  "presumably",
  "probably",
  "provides",
  "q",
  "que",
  "quite",
  "qv",
  "r",
  "rather",
  "rd",
  "re",
  "really",
  "reasonably",
  "regarding",
  "regardless",
  "regards",
  "relatively",
  "respectively",
  "right",
  "s",
  "said",
  "same",
  "saw",
  "say",
  "saying",
  "says",
  "second",
  "secondly",
  "see",
  "seeing",
  "seem",
  "seemed",
  "seeming",
  "seems",
  "seen",
  "self",
  "selves",
  "sensible",
  "sent",
  "serious",
  "seriously",
  "seven",
  "several",
  "shall",
  "she",
  "should",
  "shouldn't",
  "since",
  "six",
  "so",
  "some",
  "somebody",
  "somehow",
  "someone",
  "something",
  "sometime",
  "sometimes",
  "somewhat",
  "somewhere",
  "soon",
  "sorry",
  "specified",
  "specify",
  "specifying",
  "still",
  "sub",
  "such",
  "sup",
  "sure",
  "t",
  "t's",
  "take",
  "taken",
  "tell",
  "tends",
  "th",
  "than",
  "thank",
  "thanks",
  "thanx",
  "that",
  "that's",
  "thats",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "thence",
  "there",
  "there's",
  "thereafter",
  "thereby",
  "therefore",
  "therein",
  "theres",
  "thereupon",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "think",
  "third",
  "this",
  "thorough",
  "thoroughly",
  "those",
  "though",
  "three",
  "through",
  "throughout",
  "thru",
  "thus",
  "to",
  "together",
  "too",
  "took",
  "toward",
  "towards",
  "tried",
  "tries",
  "truly",
  "try",
  "trying",
  "twice",
  "two",
  "u",
  "un",
  "under",
  "unfortunately",
  "unless",
  "unlikely",
  "until",
  "unto",
  "up",
  "upon",
  "us",
  "use",
  "used",
  "useful",
  "uses",
  "using",
  "usually",
  "uucp",
  "v",
  "value",
  "various",
  "very",
  "via",
  "viz",
  "vs",
  "w",
  "want",
  "wants",
  "was",
  "wasn't",
  "way",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "welcome",
  "well",
  "went",
  "were",
  "weren't",
  "what",
  "what's",
  "whatever",
  "when",
  "whence",
  "whenever",
  "where",
  "where's",
  "whereafter",
  "whereas",
  "whereby",
  "wherein",
  "whereupon",
  "wherever",
  "whether",
  "which",
  "while",
  "whither",
  "who",
  "who's",
  "whoever",
  "whole",
  "whom",
  "whose",
  "why",
  "will",
  "willing",
  "wish",
  "with",
  "within",
  "without",
  "won't",
  "wonder",
  "would",
  "wouldn't",
  "x",
  "y",
  "yes",
  "yet",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "z",
  "zero"
]);

export function start() {
  dsv("|", "./data.csv").then(d => {
    data.set(d);
    setPreds(d);
    let key = getKeywords(d);
    let sen = getSentences(d);
    runUmap(key, sen);
  });
}

function setPreds(d) {
  let predMap = new Map();
  d.forEach(ent => {
    predMap.set(ent["image"] + ".jpg", ent["pred"]);
  });
  preds.set(predMap);
}

function getKeywords(data) {
  let tags = new Map();

  // Get keywords
  data.forEach(d => {
    JSON.parse(d["keywords"].replace(/'/g, '"')).forEach((k, i) => {
      if (!stopwords.has(k)) {
        tags.set(k, {
          count: 1,
          vec: JSON.parse(d["vecs"])[i],
          imgs: [],
          descs: []
        });
      }
      return tags;
    });
  });

  // Get usage of keywords
  let arr = [];
  tags.forEach((v, k) => {
    let count = 0;
    let imgs = [];
    let descs = [];

    data.forEach(sen => {
      if (sen["description"].includes(k)) {
        count++;
        imgs.push(sen["image"]);
        descs.push(sen["description"]);
      }
    });

    if (count > 1) {
      arr.push({
        tag: k,
        count: count,
        vec: v.vec,
        imgs: imgs,
        descs: descs
      });
    }
  });
  keywords.set(arr);
  return arr;
}

function getSentences(data) {
  let sens = data.map(d => {
    return {
      img: d.image,
      desc: d.description,
      vec: JSON.parse(d["vec"].replace(/'/g, '"'))
    };
  });
  sentences.set(sens);
  return sens;
}

function runUmap(keys, sens) {
  let model = new UMAP({ nNeighbors: 5, minDist: 0.3 });
  if (keys.length === 0) return model;

  let keyVecs = keys.map(r => r.vec);
  let senVecs = sens.map(r => r.vec);
  let combVecs = keyVecs.concat(senVecs);

  model.fit(combVecs);
  umap.set(model);
  umapSolution.set(model.getEmbedding());
}

export const data = writable([]);
export const keywords = writable([]);
export const sentences = writable([]);
export const preds = writable(new Map());

export const umap = writable(new UMAP({ nNeighbors: 5, minDist: 0.4 }));
export const umapSolution = writable([]);

export const currentHypothesis = writable(0);
export const hypotheses = writable([
  {
    name: "CLICK TO NAME HYPOTHESIS",
    imgs: new Set(),
    descs: new Set()
  }
]);

export const filter = writable("");

export const counters = writable([[]]);
export const samples = writable([[]]);

export const countersRatio = derived(
  [counters, currentHypothesis],
  ([$counters, $currentHypothesis]) =>
    createRates($counters, $currentHypothesis)
);

export const samplesRatio = derived(
  [samples, currentHypothesis],
  ([$samples, $currentHypothesis]) => createRates($samples, $currentHypothesis)
);

function createRates(raws, curr) {
  let len = raws[curr].length;
  if (len) {
    return {
      pos: raws[curr].reduce((a, b) => +a + (+b.corr === 1 ? 1 : 0), 0) / len,
      neg: raws[curr].reduce((a, b) => +a + (+b.corr === 0 ? 1 : 0), 0) / len,
      base: raws[curr].reduce((a, b) => +a + (+b.corr === -1 ? 1 : 0), 0) / len,
      len: len
    };
  } else {
    return {
      pos: 0,
      neg: 0,
      base: 0,
      len: 0
    };
  }
}

export const upload = writable("");

export const selImgs = writable([]);
export const selDescs = writable([]);
export const selTag = writable("");

export const zoomImg = writable("");
export const zoomPred = writable("");
export const hoverSen = writable("");
