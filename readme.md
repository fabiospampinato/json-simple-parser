# JSON Simple Parser

The fastest pure-JS implementation for JSON I could come up with.

There's no point in actually using this function, it mainly exists as a benchmark, to see what the ceiling is for a pure-JS manually written and painfully written JSON parser. This implementation doesn't call `JSON.parse` internally, it may use use some regexes if they perform better though.

This is about ~2.5x slower than `JSON.parse` in Node v22.

## Install

```sh
npm install json-simple-parser
```

## Usage

```ts
import parse from 'json-simple-parser';

// Let's parse some JSON

const json = `{
  "foo": "bar",
  "bar": 42,
  "baz": true,
  "qux": null,
  "corge": [1, 2, 3],
  "grault": {
    "garply": "waldo"
  }
}`;

const result = {
  foo: 'bar',
  bar: 42,
  baz: true,
  qux: null,
  corge: [1, 2, 3],
  grault: {
    garply: 'waldo'
  }
};

parse ( json ); // => result
```

## License

MIT © Fabio Spampinato
