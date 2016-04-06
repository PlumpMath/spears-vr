import aframe from 'aframe';
import {Entity} from 'aframe-react';
import React from 'react';

aframe.registerComponent('lookDirection', {
  init() {
    this.lastRotate = new Date();
  },
  tick() {
    const rotation = this.el.getAttribute('rotation');
    if ((new Date() - this.lastRotate) >= 1000) {
      this.el.emit('rotate', rotation);
      this.lastRotate = new Date();
    }
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
  },

  render() {
    return (
      <Entity>
        <Entity onLoaded={this.onLoaded} lookDirection camera="" look-controls="" wasd-controls="" {...this.props}/>
      </Entity>
    );
  }
});

export default Camera;
