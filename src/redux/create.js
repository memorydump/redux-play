import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import createMiddleware from './middleware/clientMiddleware';
import recorderMiddleware from './middleware/recorderMiddleware';
import { routerMiddleware } from 'react-router-redux';
import reduxRecord from 'redux-test-recorder';

let record = {};

export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const reducer = require('./modules/reducer');
  record = reduxRecord({reducer});

  const middleware = [createMiddleware(client), reduxRouterMiddleware, recorderMiddleware(reducer), record.middleware];

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../containers/DevTools/DevTools');
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const store = finalCreateStore(reducer, data);


  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return { store, recordProps: record.props, reducer };
}
