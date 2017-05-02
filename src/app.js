import 'normalize.css/normalize.css';
import './css/demo.css';
import './css/component.css';
import * as m from 'mercury';
import $ from 'jquery';

let url = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch='
let pageUrl = 'https://en.wikipedia.org/?curid=';

function WikiApp(initialState) {
  return m.state({
    articles: m.array(initialState.articles),
    searchValue: m.value(''),
    isOpen: m.value(false),
    channels: {
      search: searchWiki,
      change: change,
      open: open,
      close: close
    }
  });
}

function open(state) {
  state.isOpen.set(true);
}

function close(state) {
  state.isOpen.set(false);
  reset(state);
}

function reset(state) {
  state.searchValue.set('');
  state.articles.set([]);
}

function change(state, data) {
  state.searchValue.set(data.search);
}


function searchWiki(state) {
  $.getJSON(url + encodeURI(state.searchValue().trim()), function (response) {
    let results = response.query.pages;
    if (state.articles.length > 0) {
      state.articles.set([]);
    }

    Object.keys(results).forEach(function (article) {
      state.articles.push(
        {
          title: results[article].title,
          body: results[article].extract,
          pageId: results[article].pageid
        })
    });
  })
}

function renderArticle(item) {
  return m.h('a.dummy-media-object', {href: `${pageUrl}${item.pageId}`, target: '_blank'}, [
    m.h('h3', item.title),
    m.h('div.body', item.body)
  ])
}

WikiApp.render = function (state) {
  let allArticles = state.articles
    .map(function (article) {
      return renderArticle(article);
    });

  return m.h('div.container', [
    m.h('div', {id: 'morphsearch', className: state.isOpen ? 'morphsearch open' : 'morphsearch'}, [
      m.h('form.morphsearch-form', [
        m.h('input.morphsearch-input', {
          type: 'search', placeholder: 'Search...',
          'ev-focus': m.send(state.channels.open),
          value: String(state.searchValue),
          name: 'search',
          'ev-event': m.sendChange(state.channels.change)
        }),
        m.h('button.morphsearch-submit',
          {type: 'submit', 'ev-event': m.sendSubmit(state.channels.search)}, 'Search')
      ]),
      m.h('div.morphsearch-content', allArticles),
      m.h('span.morphsearch-close', {'ev-click': m.send(state.channels.close)})
    ]),
    m.h('header.codrops-header', [
      m.h('h1', 'Wiki Search.')
    ]),
    m.h('div.random', [
      m.h('a.btn', {href: 'https://en.wikipedia.org/wiki/Special:Random', target: '_blank'}, [
        m.h('i.fa .fa-refresh', ' Lucky day')
      ])
    ]),
    m.h('div.overlay')
  ]);
};


let wikiState = WikiApp({articles: []});
m.app(document.body, wikiState, WikiApp.render);
