const SIMPLE_WORDS = {
  hiragana: [
    { kana: "すし", answer: "sushi" },
    { kana: "ねこ", answer: "neko" },
    { kana: "いぬ", answer: "inu" },
    { kana: "ここ", answer: "koko" },
    { kana: "なに", answer: "nani" },
    { kana: "すき", answer: "suki" },
    { kana: "はな", answer: "hana" },
    { kana: "もの", answer: "mono" }
  ],
  katakana: [
    { kana: "アニメ", answer: "anime" },
    { kana: "マンガ", answer: "manga" },
    { kana: "ラーメン", answer: "ramen" },
    { kana: "ゲーム", answer: "geemu" },
    { kana: "コーヒー", answer: "koohii" },
    { kana: "コンビニ", answer: "konbini" },
    { kana: "タクシー", answer: "takushii" },
    { kana: "カメラ", answer: "kamera" }
  ]
};

const MECHANICS_QUESTIONS = [
  {
    prompt: "Dakuten adds voicing. か with dakuten becomes:",
    choices: ["ga", "ka", "pa", "sa"],
    answer: "ga"
  },
  {
    prompt: "Handakuten on は makes:",
    choices: ["ba", "ha", "pa", "da"],
    answer: "pa"
  },
  {
    prompt: "Small っ usually means:",
    choices: [
      "Double next consonant",
      "Lengthen previous vowel",
      "Skip a sound",
      "Add dakuten"
    ],
    answer: "Double next consonant"
  },
  {
    prompt: "Katakana ー usually means:",
    choices: [
      "Extend vowel sound",
      "Double consonant",
      "Make it polite",
      "Make it plural"
    ],
    answer: "Extend vowel sound"
  }
];
