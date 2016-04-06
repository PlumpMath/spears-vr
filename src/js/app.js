import aframe from 'aframe';
import 'babel-polyfill';
import { Entity, Scene} from 'aframe-react';
import React from 'react';
import ReactDOM from 'react-dom';

import 'aframe-physics-components';

import Camera from './components/Camera';
import Cursor from './components/Cursor';
import Sky from './components/Sky';


aframe.registerSystem('state-system', {
  init: function() {
    console.log('system init');
  }
});

class BoilerplateScene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'red'
    };
  }

  changeColor() {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
    this.setState({
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  render () {
    return (
      <Scene physics-world="gravity: 0 -9.8 0">
        <Camera><Cursor/></Camera>

        <Sky/>

        <Entity light={{type: 'ambient', color: '#888'}}/>
        <Entity light={{type: 'directional', intensity: 0.5}} position={[-1, 1, 0]}/>
        <Entity light={{type: 'directional', intensity: 1}} position={[1, 1, 0]}/>

        <Entity
          physics-body="boundingBox: 1 1 1; mass: 5; velocity: 0.0 0 0"
          geometry="primitive: box"
          material={{color: this.state.color}}
          position="0 0 -2"
          material={{color: 'blue'}}>
        </Entity>

        <Entity
          id="ground"
          physics-body="boundingBox: 10 0.1 10; mass: 0"
          geometry="primitive: box; depth: 10; height: 0.1; width: 10"
          material={{color: '#333333'}}
          position="0 -3 0">
        </Entity>

      </Scene>
    );
  }
}

ReactDOM.render(<BoilerplateScene/>, document.querySelector('.scene-container'));
