
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var xhr = require('xhr');
var mustache = require('mustache');

// syntax highlighting
require('./public/vendor/prism.css');
var prism = require('./public/vendor/prism.js');

var templates = {
  feature: fs.readFileSync(__dirname + '/templates/feature.html', 'utf8'),
  error: fs.readFileSync(__dirname + '/templates/error.html', 'utf8'),
  nolint: fs.readFileSync(__dirname + '/templates/nolint.html', 'utf8')
}

// shorthand
var $ = document.querySelector.bind(document);

// elements
var button = $('button');
var loading = $('.loading');
var resultsView = $('.results-view');
var results = $('#results');

var input = {
  url: $('[name="url"]'),
  browsers: $('[name="browsers"]'),
  css: $('[name="css"]')
}

// onload
document.addEventListener('DOMContentLoaded', function() {
  $('.fouc').classList.remove('fouc');

  // watch for changes in the input fields.
  [
    input.url,
    input.css,
    input.browsers
  ].forEach(function(el) {
    el.addEventListener('keyup', validate);
    el.addEventListener('blur', validate);
  })

  // handle click & enter key field
  button.addEventListener('click', function(e) { fetch(); });
  [
    input.url,
    input.browsers
  ].forEach(function(el) {
    el.addEventListener('keyup', function(e) {
      if (e.keyCode === 13) fetch();
    })
  });
  
  var args = qs.parse(url.parse(window.location.href).query);
  if(args.url || args.css) {
    button.removeAttribute('disabled');
    fetch(args);
  }

  function validate() {
    var urlvalue = input.url.value.trim(),
      cssvalue = input.css.value.trim();
    if (urlvalue.length ? !cssvalue.length : cssvalue.length) // xor
      button.removeAttribute('disabled');
    else
      button.setAttribute('disabled', true);
  }

  function fetch(args) {
    if (button.getAttribute('disabled')) return;

    resultsView.classList.remove('show');
    loading.classList.add('show');
    var errorEl = $('.error');
    errorEl.parentNode.removeChild(errorEl);
    
    if(!args) {
      args = {};
      for(k in input) args[k] = input[k].value;
    }
    
    xhr({
      body: JSON.stringify(args),
      method: 'POST',
      uri: '/',
      headers: { 'Content-Type': 'application/json' }
    },
    function(err, resp, body) {
      try {
        if (!(resp.statusCode >= 200 && resp.statusCode < 400))
          throw new Error('The server responded with a bad status: '+resp.statusCode);
        body = JSON.parse(body);
      }
      catch(e) { err = e; }
      update(err, body || resp);
    });
  }
    

  function update(err, response, skipHistory) {
    loading.classList.remove('show');
    
    if (err) {
      var errorMarkup = mustache.render(templates.error, {message: err.toString(), error: err })
      resultsView.insertAdjacentHTML('afterend', errorMarkup)
    }
    else if(response.usages && response.usages.length > 0) {
      
      results.innerHTML = response.usages
        .map(function(usage) {
          usage.count = response.counts[usage.feature];
          return mustache.render(templates.feature ,usage);
        })
        .join('');
        
      resultsView.classList.add('show');
      prism.highlightAll();
    }
    else if(response.usages && response.usages.length === 0) {
      var nolint = mustache.render(templates.nolint, {});
      $('header').insertAdjacentHTML('beforeend', nolint);
    }
    
    if(response) {
      // populate input fields with the args that were used for this query.
      for(k in response.args)
        if(input[k]) input[k].value = response.args[k];
        
      var query = qs.stringify(response.args);
      if (!skipHistory && query.length > 0 && query.length < 1e6) {
        window.history.pushState(response, '', '/?' + query);
        $('#json-link').setAttribute('href', '/api?' + query);
      }
    }
  }

  window.addEventListener('popstate', function(event) {
    update(null, event.state);
  });

}); // DOMContentLoaded
