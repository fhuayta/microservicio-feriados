define([
  'jquery',
  'lodash'
], function($, _) {

  var initDynamic = function() {
      // Button send
      $(".sample-request-send").off("click");
      $(".sample-request-send").on("click", function(e) {
          e.preventDefault();
          var $root = $(this).parents("article");
          var group = $root.data("group");
          var name = $root.data("name");
          var version = $root.data("version");
          sendSampleRequest(group, name, version, $(this).data("sample-request-type"));
      });

      // Button clear
      $(".sample-request-clear").off("click");
      $(".sample-request-clear").on("click", function(e) {
          e.preventDefault();
          var $root = $(this).parents("article");
          var group = $root.data("group");
          var name = $root.data("name");
          var version = $root.data("version");
          clearSampleRequest(group, name, version);
      });

      // Oculta los campos de tipo objeto del formulario de ejemplo.
      const inputs = $("input.sample-request-param")
      Object.keys(inputs).forEach(key => {
        const input = inputs[key]
        try {
          const val = input.getAttribute('data-sample-request-param-name')
          if (val.includes('.')) {
            $(input.parentElement.parentElement).hide()
          }
        } catch (e) {}
      })
  }; // initDynamic

  function sendSampleRequest(group, name, version, type)
  {
      var $root = $('article[data-group="' + group + '"][data-name="' + name + '"][data-version="' + version + '"]');

      // Optional header
      var header = {};
      $root.find(".sample-request-header").each(function(i, element) {
          var group = $(element).data("sample-request-header-group-id");
          $root.find("[data-sample-request-header-group=\"" + group + "\"]").each(function(i, element) {
            var key = $(element).data("sample-request-header-name");
            var value = element.value;
            if ( ! element.optional && element.defaultValue !== '') {
                value = element.defaultValue;
            }
            header[key] = value;
          });
      });

      // create JSON dictionary of parameters
      var param = {};
      var paramType = {};
      $root.find(".sample-request-param").each(function(i, element) {
          var group = $(element).data("sample-request-param-group-id");
          $root.find("[data-sample-request-param-group=\"" + group + "\"]").not(function() {
            return $(this).val() == "" && $(this).is("[data-sample-request-param-optional='true']");
          }).each(function(i, element) {
            var key = $(element).data("sample-request-param-name");
            var value = element.value;
            if ( ! element.optional && element.defaultValue !== '') {
                value = element.defaultValue;
            }
            param[key] = value;
            paramType[key] = $(element).next().text();
          });
      });

      // grab user-inputted URL
      var url = $root.find(".sample-request-url").val();

      $root.find(".sample-request-response").fadeTo(250, 1);
      $root.find(".sample-request-response-json").html("Cargando ...");
      refreshScrollSpy();

      _.each( param, function( val, key ) {
          var t = paramType[ key ].toLowerCase();
          try {
              param[key] = parseValue(t, val)
          } catch (e) {}
      })

      // Reemplaza los parámetros de la URL con sus valores correspondientes.
      for (let prop in param) {
        if (url.includes(`:${prop}`) && param[prop] !== '') {
          url = url.replace(`:${prop}`, param[prop])
          delete param[prop]
        }
      }

      // Elimina los campos vacios
      eliminaCamposVacios(param)
      eliminaCamposVacios(header)

      param = type === 'get' ? param : JSON.stringify(param)

      // send AJAX request, catch success or error callback
      var ajaxRequest = {
          url        : url,
          headers    : header,
          data       : param,
          contentType: "application/json",
          dataType   : "json",
          type       : type.toUpperCase(),
          success    : displaySuccess,
          error      : displayError
      };

      $.ajax(ajaxRequest);

      function displaySuccess(data, status, jqXHR) {
          var message = "Success " + jqXHR.status + ": " + jqXHR.statusText;
          var jsonResponse;
          try {
              jsonResponse = JSON.parse(jqXHR.responseText);
              jsonResponse = JSON.stringify(jsonResponse, null, 4);
          } catch (e) {
              jsonResponse = data;
          }
          if (!jsonResponse) { jsonResponse = '' }
          $root.find(".sample-request-response-json").html(`${message}\n${jsonResponse}`);
          refreshScrollSpy();
      };

      function displayError(jqXHR, textStatus, error) {
          var message = "Error " + jqXHR.status + ": " + error;
          var jsonResponse;
          try {
              jsonResponse = JSON.parse(jqXHR.responseText);
              jsonResponse = JSON.stringify(jsonResponse, null, 4);
          } catch (e) {
              jsonResponse = escape(jqXHR.responseText);
          }

          if (jsonResponse)
              message += "<br>" + jsonResponse;

          // flicker on previous error to make clear that there is a new response
          if($root.find(".sample-request-response").is(":visible"))
              $root.find(".sample-request-response").fadeTo(1, 0.1);

          $root.find(".sample-request-response").fadeTo(250, 1);
          $root.find(".sample-request-response-json").html(message);
          refreshScrollSpy();
      };
  }

  function parseValue (type, value) {
    type = type.toUpperCase()
    if (['JSON', 'JSONB', 'OBJECT'].includes(type)) {
      return JSON.parse(value + '')
    }
    if (type.endsWith('[]')) {
      return JSON.parse(value + '')
    }
    return value
  }

  function parseValue2 (type, value) {
    type = type.toUpperCase()
    if (type === 'STRING')   { return (value + '') }
    if (type === 'TEXT')     { return (value + '') }
    if (type === 'ENUM')     { return (value + '') }
    if (type === 'INTEGER')  { return (value + '') }
    if (type === 'FLOAT')    { return (value + '') }
    if (type === 'BOOLEAN')  { return (value === '1' || value === 'true') + '' }
    if (type === 'DATE')     { return (value + '') }
    if (type === 'DATEONLY') { return (value + '') }
    if (type === 'TIME')     { return (value + '') }
    if (type === 'JSON')     { return JSON.parse(value + '') }
    if (type === 'JSONB')    { return JSON.parse(value + '') }
    if (type === 'OBJECT')   { return JSON.parse(value + '') }
    if (type === 'UUID')     { return (value + '') }
    if (type.endsWith('[]')) {
      type = type.substr(0, type.length - 2)
      value = JSON.parse(value)
      const values = []
      if (type === 'STRING')   for (let i in value) { values.push(value[i] + '') }
      if (type === 'TEXT')     for (let i in value) { values.push(value[i] + '') }
      if (type === 'ENUM')     for (let i in value) { values.push(value[i] + '') }
      if (type === 'INTEGER')  for (let i in value) { values.push(value[i] + '') }
      if (type === 'FLOAT')    for (let i in value) { values.push(value[i] + '') }
      if (type === 'BOOLEAN')  for (let i in value) { values.push((value[i] === '1' || value[i] === 'true') + '') }
      if (type === 'DATE')     for (let i in value) { values.push(value[i] + '') }
      if (type === 'DATEONLY') for (let i in value) { values.push(value[i] + '') }
      if (type === 'TIME')     for (let i in value) { values.push(value[i] + '') }
      if (type === 'JSON')     for (let i in value) { values.push(value[i]) }
      if (type === 'JSONB')    for (let i in value) { values.push(value[i]) }
      if (type === 'OBJECT')   for (let i in value) { values.push(value[i]) }
      if (type === 'UUID')     for (let i in value) { values.push(value[i] + '') }
      return values
    }
    return value
  }

  function eliminaCamposVacios(obj) {
    if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string' && obj[key] === '') {
          delete obj[key]
        }
      })
    }
  }

  function clearSampleRequest(group, name, version)
  {
      var $root = $('article[data-group="' + group + '"][data-name="' + name + '"][data-version="' + version + '"]');

      // hide sample response
      $root.find(".sample-request-response-json").html("");
      $root.find(".sample-request-response").hide();

      // reset value of parameters
      $root.find(".sample-request-param").each(function(i, element) {
          element.value = "";
      });

      // restore default URL
      var $urlElement = $root.find(".sample-request-url");
      $urlElement.val($urlElement.prop("defaultValue"));

      refreshScrollSpy();
  }

  function refreshScrollSpy()
  {
      $('[data-spy="scroll"]').each(function () {
          $(this).scrollspy("refresh");
      });
  }

  function escapeHtml(str) {
      var div = document.createElement("div");
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
  }

  /**
   * Exports.
   */
  return {
      initDynamic: initDynamic
  };

});
