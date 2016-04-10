import aframe from 'aframe';
import {Entity} from 'aframe-react';
import React from 'react';

aframe.registerComponent('lookDirection', {
  init() {
    this.lastRotation = null
  },
  tick() {
    const rotation = this.el.getAttribute('rotation');

    if (rotation != this.lastRotation) {
      this.el.emit('rotate', rotation);
    }

    this.lastRotation = rotation;
  }
});

aframe.registerComponent('movePosition', {
  init() {
    this.lastPosition = null;
  },
  tick() {
    const position = this.el.getAttribute('position');

    if (position != this.lastPosition) {
      this.el.emit('move', position);
    }

    this.lastPosition = position;
  }
});

const Camera = React.createClass({
  onLoaded(e) {
    this.attachEvents(e.target);
  },
  attachEvents(el) {
    el.addEventListener('rotate', (e) => {
      this.props.onRotate(e.detail);
    });
    el.addEventListener('move', (e) => {
      this.props.onMove(e.detail);
    });
  },

  render() {
    return (
      <Entity onLoaded={this.onLoaded} lookDirection movePosition camera="" look-controls="" wasd-controls="" {...this.props}/>
    );
  }
});

export default Camera;
