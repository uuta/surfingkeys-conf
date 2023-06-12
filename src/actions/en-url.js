export class EnURL {
  constructor(v) {
    this.v = v;
  }

  speech() {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(
      this.v,
    )}&tl=en&total=1&idx=0`;
  }

  meaning() {
    return `https://www.google.com/search?q=${encodeURIComponent(
      this.v,
    )}+meaning&oq=${encodeURIComponent(this.v)}+meaning`;
  }

  example() {
    return `https://www.google.com/search?q=${encodeURIComponent(
      this.v,
    )}+example+sentence&oq=${encodeURIComponent(this.v)}+example+sentence}`;
  }

  playPhrase() {
    return `https://www.playphrase.me/#/search?q=${this.v}`;
  }
}
