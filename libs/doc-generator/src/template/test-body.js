const test = require('ava');

const { ApidocGenerator, ApidocRequest } = require('doc-generator');

test.before(async t => {
  try {
    ApidocRequest.init();

    ApidocGenerator.globalProperties({ group: 'GROUP' });
  } catch (e) { console.log(e); }
});

// <!-- [TEST DEFINITION] --!> //
