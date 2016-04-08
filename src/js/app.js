import aframe from 'aframe';
import 'babel-polyfill';
import { Entity, Scene} from 'aframe-react';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Three from 'three';

import 'aframe-physics-components';

import Camera from './components/Camera';
import Cursor from './components/Cursor';
import Sky from './components/Sky';

function degToRad(degrees) { return (degrees / 180) * Math.PI }
function scaleVector(v, scale) { return {x: v.x * scale, y: v.y * scale, z: v.z * scale }; }


aframe.registerSystem('state-system', {
  init: function() {
    console.log('system init');
  }
});

aframe.registerComponent('clickListener', {
  init: function () {
    var el = this.el;
    window.addEventListener('click', function () {
      el.emit('click', null, false);
    });
  }
});

aframe.registerComponent('spawner', {
  schema: {
    on: {default: 'click'},
    mixin: {default: ''}
  },
  update: function() {
    const el = this.el;
    const matrixWorld = el.object3D.matrixWorld;
    const entity = document.createElement('a-entity');
    const position = new Three.Vector3();

    position.setFromMatrixPosition(matrixWorld);
    entity.setAttribute('position', position);
    el.sceneEl.appendChild(entity);
  }
});

class BoilerplateScene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'red',
      boxes: [{x: 0, y: 0, z: -1}],
      physicsWorld: null
    };
  }

  spawnBox(position) {
    // -1 to 1
    this.setState({
      boxes: this.state.boxes.concat(position)
    });
  };

  componentDidMount() {
    // window.addEventListener('click', () => {
    //   this.spawnBox();
    // });
  }

  render () {
    const droppedBoxes = _.map(this.state.boxes, (descrip, idx) => {
      return (
        <Entity
          key={idx}
          physics-body="boundingBox: 1 1 1; mass: 100; velocity: 0 5 0"
          geometry="primitive: box"
          position={[descrip.x, descrip.y, descrip.z].join(' ')}
          material={{color: 'green'}}>
        </Entity>
      );
    });

    const { cameraDirection } = this.state;

    let pointerBox;
    if (cameraDirection) {
      const position = scaleVector(cameraDirection, 4);

      pointerBox = (
        <Entity
          physics-body="boundingBox: 1 1 1; mass: 100; velocity: 0 5 0"
          geometry="primitive: box"
          position={[position.x, position.y, position.z]}
          material={{color: 'red'}}>
        </Entity>
      );
    }

    return (
      <Scene physics-world="gravity: 0 -9.8 0">
        <a-assets>
        </a-assets>
        <Camera onRotate={(rotation) => {
            this.setState({
              cameraDirection: {
                x: -1 * Math.sin(degToRad(rotation.y % 360)),
                y: Math.tan(degToRad(rotation.x)),
                z: -1 * Math.cos(degToRad(rotation.y % 360)),
              }
            });

            this.spawnBox(scaleVector(this.state.cameraDirection, 4));
          }}>
          <Cursor/>
        </Camera>

        <Sky/>

        <Entity light={{type: 'ambient', color: '#888'}}/>
        <Entity light={{type: 'directional', intensity: 0.5}} position={[-1, 1, 0]}/>
        <Entity light={{type: 'directional', intensity: 1}} position={[1, 1, 0]}/>

        {droppedBoxes}
        {pointerBox}

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
