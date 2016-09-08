import _ from 'lodash';
import { diff } from 'deep-diff';

export default function recorder(reducer) {
  return ({dispatch, getState}) => {
    return next => action => {
      const body = (global.window && global.window.document.body.innerHTML) || '';
      // console.log(`Action => ${JSON.stringify(action)}`,
      //             `State => ${JSON.stringify(getState())}`,
      //             `Html => ${body}`);
      //console.log(global.socket);
      if (global.socket && global.reduxPlaySave) {
        console.log('------ SAVING .......');
        global.socket.emit('reduxPlayRecord', {action, state: reducer(getState(), action), body});
      }

      if (action.reduxPlayAction) {
        //console.log(action.reduxPlayAction.state);
        //console.log(`Playing: ${action.type} pass: ${_.isEqual(action.reduxPlayAction.state, getState())}`);
        const first = _.omit(action.reduxPlayAction.state, ['routing', 'auth', 'info']);
        const second = _.omit(reducer(getState(), action), ['routing', 'auth', 'info']);

        console.log(
          [first, second],
          diff(first, second) === undefined
        );
        console.log(diff(first, second));
        //console.log(reducer(getState(), action));
      }

      return next(action);
    };
  };
}
