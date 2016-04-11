import aframe from 'aframe';
import {Entity} from 'aframe-react';
import React from 'react';

const Clickable = React.createClass({
  /*
  propTypes: {
    onMouseUp: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
  },
  */

  getDefaultProps() {
    return {
      onMouseDown: () => {},
      onMouseUp: () => {},
    };
  },

  onLoaded(e) {
    const el = e.target;

    el.addEventListener('mousedown', (e) => {
      this.props.onMouseDown(event)
    });

    el.addEventListener('mouseup', (e) => {
      this.props.onMouseUp(event)
    });
  },

  render() {
    return (
      <Entity onLoaded={this.onLoaded} {...this.props}/>
    );
  }
});

export default Clickable;
