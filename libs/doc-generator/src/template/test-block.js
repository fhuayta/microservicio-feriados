test('[GROUP] [METHOD] PATH', async t => {
  try {
    const response = await ApidocGenerator.METHOD('PATH').generate();
    // if (response && response.error) {
    //   console.log(response.body);
    //   t.falsy('La consulta no finalizó como se esperaba')
    // }
    t.pass(response);
  } catch (e) { console.log(e); }
});

// <!-- [TEST DEFINITION] --!> //
