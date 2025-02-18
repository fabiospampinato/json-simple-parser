
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import parse from '../dist/index.js';

/* HELPERS */

const JSON_SAMPLE = fs.readFileSync ( './tasks/sample.json', 'utf8' );

/* MAIN */

//TODO: Test this with test262-harness instead

describe ( 'JSON Simple Parser', it => {

  it ( 'works', t => {

    const custom = JSON.stringify ( parse ( JSON_SAMPLE ) );
    const native = JSON.stringify ( JSON.parse ( JSON_SAMPLE ) );

    t.is ( custom, native );

  });

});
