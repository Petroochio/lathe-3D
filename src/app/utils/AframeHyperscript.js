// @flow
import { h } from '@cycle/dom';
import { type, tail } from 'ramda';

function createTagHelper(tagname) {
  function createTag(...args) {
    const hasSelector = (type(args[0]) === 'String');
    const tag = hasSelector ? `${tagname}${args[0]}` : tagname;
    const hArgs = hasSelector ? tail(args) : args;

    return h(tag, ...hArgs);
  }

  return createTag;
}

export const aCamera = createTagHelper('a-camera');
export const aEntity = createTagHelper('a-entity');
export const aScene = createTagHelper('a-scene');
export const aSky = createTagHelper('a-sky');
export const aSphere = createTagHelper('a-sphere');
