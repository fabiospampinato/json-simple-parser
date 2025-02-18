
/* IMPORT */

import benchmark from 'benchloop';
import fs from 'node:fs';
import parse from '../dist/index.js';

/* HELPERS */

const JSON_SAMPLE = fs.readFileSync ( './tasks/sample.json', 'utf8' );

/* MAIN */

benchmark.config ({
  iterations: 1_000
});

benchmark ({
  name: 'json-simple-parser',
  fn: () => {
    parse ( JSON_SAMPLE );
  }
});

benchmark ({
  name: 'json.parse',
  fn: () => {
    JSON.parse ( JSON_SAMPLE );
  }
});
