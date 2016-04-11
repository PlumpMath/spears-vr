import aframe from 'aframe';
import 'babel-polyfill';
import { Entity, Scene} from 'aframe-react';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Three from 'three';

import 'aframe-physics-components';

import Camera from './components/Camera';
import Clickable from './components/Clickable';
import Cursor from './components/Cursor';
import Sky from './components/Sky';

function degToRad(degrees) { return (degrees / 180) * Math.PI }
function scaleVector(v, scale) { return {x: v.x * scale, y: v.y * scale, z: v.z * scale } }
function addVector(v1, v2) { return {x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z} }
function subtractVector(v1, v2) { return {x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z} }
function vectorLength(v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) }


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

aframe.registerComponent('physics-drag-to', {
  dependencies: ['physics-body'],

  schema: { type: 'vec3', default: null },

  tick: function() {
    const position = this.el.getAttribute('position')
    const dragTo = this.data;
    const physicsWorld = this.el.components['physics-body'];

    if (!position || !dragTo || !dragTo.x || !physicsWorld) { return };

    const difference = subtractVector(dragTo, position);

    if (vectorLength(difference) < 0.001) { return }

    const force = scaleVector(difference, 10);

    physicsWorld.body.velocity.x = force.x;
    physicsWorld.body.velocity.y = force.y;
    physicsWorld.body.velocity.z = force.z;

    //physicsWorld.body.applyImpulse(force);
  },
});

class BoilerplateScene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'red',
      boxes: [{x: 0, y: 0, z: -1}],
      physicsWorld: null
    };

    this.loaded = this.loaded.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.playerRotate = this.playerRotate.bind(this);
    this.playerMove = this.playerMove.bind(this);
    this.flyingBoxGrab = this.flyingBoxGrab.bind(this);
    this.flyingBoxRelease = this.flyingBoxRelease.bind(this);
  }

  loaded(e) {
    const el = e.target;

    el.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseUp(e) {
    this.flyingBoxRelease();
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
    window.addEventListener('mouseup', () => { console.log('global'); this.flyingBoxRelease(); })
  }

  playerRotate(rotation) {
    this.setState({
      cameraDirection: {
        x: -1 * Math.sin(degToRad(rotation.y % 360)),
        y: Math.tan(degToRad(rotation.x)),
        z: -1 * Math.cos(degToRad(rotation.y % 360)),
      }
    });
  }

  playerMove(position) {
    this.setState({
      cameraPosition: {
        x: position.x,
        y: position.y,
        z: position.z,
      }
    });
  }

  flyingBoxGrab() {
    this.setState({flyingBoxGrabbed: true})
    console.log('dragging')
  }

  flyingBoxRelease() {
    this.setState({flyingBoxGrabbed: false})
    console.log('stopped draging')
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

    const { cameraDirection, cameraPosition, flyingBoxGrabbed } = this.state;

    let pointerBox, flyingBox;
    if (cameraDirection && cameraPosition) {
      const position = addVector(cameraPosition, scaleVector(cameraDirection, 4));

      /*
      pointerBox = (
        <Entity
          physics-body="boundingBox: 1 1 1; mass: 100; velocity: 0 5 0"
          geometry="primitive: box"
          position={[position.x, position.y, position.z]}
          material={{color: 'red'}}>
        </Entity>
      );
      */

      flyingBox = {
        key: "flyingBox",
        geometry: "primitive: box; depth: 1; height: 1; width: 1;",
        position: [-2, 0, -2],
        material: "color: red",
        onMouseDown: this.flyingBoxGrab,
        "physics-body": {boundingBox: "1 1 1", mass: 100},
        "physics-drag-to": flyingBoxGrabbed ? [position.x, position.y, position.z] : "",
      }

      flyingBox = (<Clickable {...flyingBox}></Clickable>)
    }

    return (
      <Scene physics-world="gravity: 0 -9.8 0" onLoaded={this.loaded}>
        <a-assets>
        </a-assets>
        <Camera onRotate={this.playerRotate} onMove={this.playerMove} >
          <Cursor/>
        </Camera>

        <Sky/>

        <Entity light={{type: 'ambient', color: '#888'}}/>
        <Entity light={{type: 'directional', intensity: 0.5}} position={[-1, 1, 0]}/>
        <Entity light={{type: 'directional', intensity: 1}} position={[1, 1, 0]}/>

        {flyingBox}
        {droppedBoxes}
        {pointerBox}

        <Entity
          id="ground"
          physics-body="boundingBox: 100 0.1 100; mass: 0"
          geometry="primitive: box; depth: 100; height: 0.1; width: 100"
          material={{color: '#333333'}}
          position="0 -3 0">
        </Entity>

      </Scene>
    );
  }
}

ReactDOM.render(<BoilerplateScene/>, document.querySelector('.scene-container'));
