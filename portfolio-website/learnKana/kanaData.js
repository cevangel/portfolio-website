const KANA_ROWS = {
  hiragana: [
    {
      id: "a",
      label: "A-row",
      chars: [
        { kana: "あ", romaji: "a", mnemonic: "Looks like an apple: a." },
        { kana: "い", romaji: "i", mnemonic: "Two eels standing up: i." },
        { kana: "う", romaji: "u", mnemonic: "A tiny U-turn swirl." },
        { kana: "え", romaji: "e", mnemonic: "An exotic bird with wings: e." },
        { kana: "お", romaji: "o", mnemonic: "An old person with a cane: o." }
      ]
    },
    {
      id: "k",
      label: "K-row",
      chars: [
        { kana: "か", romaji: "ka", mnemonic: "A kite with a hook: ka." },
        { kana: "き", romaji: "ki", mnemonic: "A key with two teeth: ki." },
        { kana: "く", romaji: "ku", mnemonic: "A cuckoo beak shape: ku." },
        { kana: "け", romaji: "ke", mnemonic: "Looks like a keg on stilts." },
        { kana: "こ", romaji: "ko", mnemonic: "Two lines like a coin edge." }
      ]
    },
    {
      id: "s",
      label: "S-row",
      chars: [
        { kana: "さ", romaji: "sa", mnemonic: "A sardine with a fin: sa." },
        { kana: "し", romaji: "shi", mnemonic: "A smiling face profile: shi." },
        { kana: "す", romaji: "su", mnemonic: "A superhero cape loop: su." },
        { kana: "せ", romaji: "se", mnemonic: "A sewing needle and thread." },
        { kana: "そ", romaji: "so", mnemonic: "A so-so curve with a tick." }
      ]
    },
    {
      id: "t",
      label: "T-row",
      chars: [
        { kana: "た", romaji: "ta", mnemonic: "A table leg crossing: ta." },
        { kana: "ち", romaji: "chi", mnemonic: "A cheerleader leaning: chi." },
        { kana: "つ", romaji: "tsu", mnemonic: "A tsunami wave crest: tsu." },
        { kana: "て", romaji: "te", mnemonic: "A telephone pole shape: te." },
        { kana: "と", romaji: "to", mnemonic: "A toe with a dot mark." }
      ]
    },
    {
      id: "n",
      label: "N-row",
      chars: [
        { kana: "な", romaji: "na", mnemonic: "A knot with a loop: na." },
        { kana: "に", romaji: "ni", mnemonic: "Two knees side by side." },
        { kana: "ぬ", romaji: "nu", mnemonic: "A noodle knot: nu." },
        { kana: "ね", romaji: "ne", mnemonic: "A net tied with string." },
        { kana: "の", romaji: "no", mnemonic: "A no-sign swirl circle." }
      ]
    },
    {
      id: "h",
      label: "H-row",
      chars: [
        { kana: "は", romaji: "ha", mnemonic: "A hat with a side ribbon." },
        { kana: "ひ", romaji: "hi", mnemonic: "A heel and a hitch: hi." },
        { kana: "ふ", romaji: "fu", mnemonic: "Looks like a wind puff: fu." },
        { kana: "へ", romaji: "he", mnemonic: "A mountain peak says heh." },
        { kana: "ほ", romaji: "ho", mnemonic: "A post with two flags: ho." }
      ]
    },
    {
      id: "m",
      label: "M-row",
      chars: [
        { kana: "ま", romaji: "ma", mnemonic: "A mama with two arms." },
        { kana: "み", romaji: "mi", mnemonic: "Looks like musical notes." },
        { kana: "む", romaji: "mu", mnemonic: "A mooing cow face: mu." },
        { kana: "め", romaji: "me", mnemonic: "An eye with lashes: me." },
        { kana: "も", romaji: "mo", mnemonic: "More lines crossing: mo." }
      ]
    },
    {
      id: "y",
      label: "Y-row",
      chars: [
        { kana: "や", romaji: "ya", mnemonic: "A yak with a tail: ya." },
        { kana: "ゆ", romaji: "yu", mnemonic: "A UFO hook: yu." },
        { kana: "よ", romaji: "yo", mnemonic: "A yo-yo with a stick." }
      ]
    },
    {
      id: "r",
      label: "R-row",
      chars: [
        { kana: "ら", romaji: "ra", mnemonic: "A rabbit ear and body." },
        { kana: "り", romaji: "ri", mnemonic: "Two reeds in a river." },
        { kana: "る", romaji: "ru", mnemonic: "A looped route sign." },
        { kana: "れ", romaji: "re", mnemonic: "A resting hook: re." },
        { kana: "ろ", romaji: "ro", mnemonic: "A road turning loop." }
      ]
    },
    {
      id: "w",
      label: "W-row + N",
      chars: [
        { kana: "わ", romaji: "wa", mnemonic: "A wave hook says wa." },
        { kana: "を", romaji: "wo", mnemonic: "A whirlpool with a stick." },
        { kana: "ん", romaji: "n", mnemonic: "Looks like an n bend." }
      ]
    }
  ],
  katakana: [
    {
      id: "a",
      label: "A-row",
      chars: [
        { kana: "ア", romaji: "a", mnemonic: "A sharp angled A stroke." },
        { kana: "イ", romaji: "i", mnemonic: "Two needles for i." },
        { kana: "ウ", romaji: "u", mnemonic: "A cup edge shape: u." },
        { kana: "エ", romaji: "e", mnemonic: "A blocky E form." },
        { kana: "オ", romaji: "o", mnemonic: "A pole and a hook: o." }
      ]
    },
    {
      id: "k",
      label: "K-row",
      chars: [
        { kana: "カ", romaji: "ka", mnemonic: "A katana slash: ka." },
        { kana: "キ", romaji: "ki", mnemonic: "Key-like crossed lines." },
        { kana: "ク", romaji: "ku", mnemonic: "A beak corner: ku." },
        { kana: "ケ", romaji: "ke", mnemonic: "A kettle handle shape." },
        { kana: "コ", romaji: "ko", mnemonic: "Two corners like a box." }
      ]
    },
    {
      id: "s",
      label: "S-row",
      chars: [
        { kana: "サ", romaji: "sa", mnemonic: "A saw with two teeth." },
        { kana: "シ", romaji: "shi", mnemonic: "Three drops leaning: shi." },
        { kana: "ス", romaji: "su", mnemonic: "A swept hook: su." },
        { kana: "セ", romaji: "se", mnemonic: "A centered crossbar: se." },
        { kana: "ソ", romaji: "so", mnemonic: "A single drop and slash." }
      ]
    },
    {
      id: "t",
      label: "T-row",
      chars: [
        { kana: "タ", romaji: "ta", mnemonic: "A tiny tent corner." },
        { kana: "チ", romaji: "chi", mnemonic: "A check mark and line." },
        { kana: "ツ", romaji: "tsu", mnemonic: "Three drops upright: tsu." },
        { kana: "テ", romaji: "te", mnemonic: "A table top with leg." },
        { kana: "ト", romaji: "to", mnemonic: "A straight stick and dot." }
      ]
    },
    {
      id: "n",
      label: "N-row",
      chars: [
        { kana: "ナ", romaji: "na", mnemonic: "A knife-like cross: na." },
        { kana: "ニ", romaji: "ni", mnemonic: "Two neat lines: ni." },
        { kana: "ヌ", romaji: "nu", mnemonic: "A knot with slash: nu." },
        { kana: "ネ", romaji: "ne", mnemonic: "A net with a hook." },
        { kana: "ノ", romaji: "no", mnemonic: "A single no stroke." }
      ]
    },
    {
      id: "h",
      label: "H-row",
      chars: [
        { kana: "ハ", romaji: "ha", mnemonic: "Two wings open: ha." },
        { kana: "ヒ", romaji: "hi", mnemonic: "A hooked heel: hi." },
        { kana: "フ", romaji: "fu", mnemonic: "A funnel shape: fu." },
        { kana: "ヘ", romaji: "he", mnemonic: "A simple chevron peak." },
        { kana: "ホ", romaji: "ho", mnemonic: "A post with side bars." }
      ]
    },
    {
      id: "m",
      label: "M-row",
      chars: [
        { kana: "マ", romaji: "ma", mnemonic: "A mat edge with bend." },
        { kana: "ミ", romaji: "mi", mnemonic: "Three mini lines: mi." },
        { kana: "ム", romaji: "mu", mnemonic: "A mountain angle: mu." },
        { kana: "メ", romaji: "me", mnemonic: "A crossing mark: me." },
        { kana: "モ", romaji: "mo", mnemonic: "More lines, one long." }
      ]
    },
    {
      id: "y",
      label: "Y-row",
      chars: [
        { kana: "ヤ", romaji: "ya", mnemonic: "A yard tool shape." },
        { kana: "ユ", romaji: "yu", mnemonic: "A U-like box turn." },
        { kana: "ヨ", romaji: "yo", mnemonic: "Three shelves: yo." }
      ]
    },
    {
      id: "r",
      label: "R-row",
      chars: [
        { kana: "ラ", romaji: "ra", mnemonic: "A rake-like bend." },
        { kana: "リ", romaji: "ri", mnemonic: "Two short strokes: ri." },
        { kana: "ル", romaji: "ru", mnemonic: "A route corner shape." },
        { kana: "レ", romaji: "re", mnemonic: "A single rail stroke." },
        { kana: "ロ", romaji: "ro", mnemonic: "A square road sign." }
      ]
    },
    {
      id: "w",
      label: "W-row + N",
      chars: [
        { kana: "ワ", romaji: "wa", mnemonic: "A wide angle: wa." },
        { kana: "ヲ", romaji: "wo", mnemonic: "A box with a slash." },
        { kana: "ン", romaji: "n", mnemonic: "A leaned n slash." }
      ]
    }
  ]
};

const LOOKALIKE_PAIRS = {
  hiragana: [["ぬ", "め"], ["ね", "れ", "わ"], ["さ", "ち"], ["は", "ほ", "ま"], ["る", "ろ"]],
  katakana: [["シ", "ツ"], ["ソ", "ン"], ["ク", "ケ"], ["ワ", "ウ"], ["マ", "ム"], ["ア", "マ"], ["フ", "ワ", "ウ"]]
};
