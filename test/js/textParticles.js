
var textGeo = new THREE.TextGeometry( "HELLO", {
  size: 1.0,
  height: 0.25,
  curveSegments: 0,
  font: font,
  weight: "bold",
  style: "normal",
});



function init() {
  scene = new THREE.Scene();

  var roomSize = new THREE.Vector3(3, 3, 3);
  var textScale = 0.3;

  var container, canvas, gl;

  var scene, camera, light, renderer;
  var geometry, geometry2, originGeometry, cube, mesh, material;
  var roomMesh;
  var projector = new THREE.Projector();

  var data, texture, points;
  var transformFeedback;
  var originBuffer;
  var font;

  var fboParticles, rtTexturePos, rtTexturePos2, simulationShader;

  var particleCount = getQueryValue('particleCount', 500000);
  var pointSize = getQueryValue('pointSize', 1);
  var skipRemainder = getQueryValue('skipRemainder', 0);

  var INT_MAX = 2147483647;

  var maxFingers = 42;
  var fingers = [];
  var fingertipSize = 0.05;
  var handScale = 0.06;
  var handOffset = new THREE.Vector3(0, roomSize.y/4, -roomSize.z*0.2);

  var pickCoord = new THREE.Vector3(0.0, 0.0, 0.0);
  var pickRay = new THREE.Ray();
  var clickPlane = new THREE.Plane(new THREE.Vector3(0.0, 0.0, 1.0), roomSize.z*0.25);

  var mouseCoordQueue = [];

  var touchPoints = [];

  var colliders = new Float32Array(maxFingers * 4);
  var colliderMeshes = [];
  var showColliders = false;

  var leapController = new Leap.Controller();

  var vrControls;
  var effect;
  var controller1, controller2;

  var isWebGL2 = false;

  function getFullscreenButton ( renderer ) {

    var button = document.createElement( 'button' );
    button.style.position = 'absolute';
    button.style.right = '20px';
    button.style.bottom = '20px';
    button.style.width = '100px';
    button.style.border = '0';
    button.style.padding = '8px';
    button.style.cursor = 'pointer';
    button.style.backgroundColor = '#000';
    button.style.color = '#fff';
    button.style.fontFamily = 'sans-serif';
    button.style.fontSize = '13px';
    button.style.fontStyle = 'normal';
    button.style.textAlign = 'center';
    button.style.zIndex = '999';
    button.textContent = 'FULLSCREEN';
    button.onclick = function() {
      if (renderer.domElement.requestFullscreen) {
        renderer.domElement.requestFullscreen();
      } else if (renderer.domElement.webkitRequestFullscreen) {
        renderer.domElement.webkitRequestFullscreen();
      } else if (renderer.domElement.mozRequestFullScreen) {
        renderer.domElement.mozRequestFullScreen();
      }
    };

    return button;

  }


  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    canvas = document.createElement( 'canvas' );

    // Try creating a WebGL 2 context first
    gl = canvas.getContext( 'webgl2', { antialias: false } );
    if (!gl) {
      gl = canvas.getContext( 'experimental-webgl2', { antialias: false } );
    }

    isWebGL2 = !!gl;

    renderer = new THREE.WebGLRenderer( { canvas: canvas, context: gl } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

    document.body.appendChild( getFullscreenButton( renderer ) );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, roomSize.z * 10 );
    camera.position.y = (roomSize.y/2) + 0.25;
    camera.position.z = roomSize.z*0.2;
    camera.lookAt( new THREE.Vector3(0, roomSize.y/2, -roomSize.z*0.25));
    scene.add( camera );

    effect = new THREE.VREffect( renderer );

    vrCamera = undefined;

    if ( WEBVR.isAvailable() === true ) {
      vrCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, roomSize.z * 10 );
      scene.add( vrCamera );

      vrControls = new THREE.VRControls( vrCamera );
      vrControls.standing = true;

      controller1 = new THREE.ViveController( 0 );
      controller1.standingMatrix = vrControls.getStandingMatrix();
      scene.add( controller1 );

      controller2 = new THREE.ViveController( 1 );
      controller2.standingMatrix = vrControls.getStandingMatrix();
      scene.add( controller2 );

      var loader = new THREE.OBJLoader();
      loader.setPath( 'media/models/vive-controller/' );
      loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {

        var loader = new THREE.TextureLoader();
        loader.setPath( 'media/models/vive-controller/' );

        var controller = object.children[ 0 ];
        controller.material.map = loader.load( 'onepointfive_texture.png' );
        controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

        controller1.add( object.clone() );
        controller2.add( object.clone() );
      } );

      WEBVR.getVRDisplay((display) => {
        document.body.appendChild( WEBVR.getButton(display, canvas) );
      });

    }

    showColliders = getQueryValue('colliders', 0) != 0;
    var fingerMaterial = new THREE.MeshPhongMaterial({ color: 0x00DD22 });
    var fingerGeometry = new THREE.IcosahedronGeometry(1, 2);

    for (var i = 0; i < maxFingers; ++i) {
      var finger = {
        active: false
      };
      colliderMeshes[i] = new THREE.Mesh(fingerGeometry, fingerMaterial);
      scene.add(colliderMeshes[i]);
      fingers.push(finger);
    }

    var textureLoader = new THREE.TextureLoader();
    var backImage = textureLoader.load("media/textures/Back.png");
    var ceilImage = textureLoader.load("media/textures/Ceiling.png");
    var floorImage = textureLoader.load("media/textures/Floor.png");

    var roomMaterialArray = [
      new THREE.MeshBasicMaterial({ map: backImage, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: backImage, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: ceilImage, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: floorImage, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: backImage, side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: backImage, side: THREE.BackSide })
    ];
    var roomMaterial = new THREE.MeshFaceMaterial( roomMaterialArray );
    var roomGeometry = new THREE.BoxGeometry( roomSize.x, roomSize.y, roomSize.z );
    roomMesh = new THREE.Mesh( roomGeometry, roomMaterial );
    roomMesh.doubleSided = true;
    roomMesh.position.y = roomSize.y/2;
    scene.add( roomMesh );

    if (isWebGL2) {
      // Start Creation of DataTexture

      var fontLoader = new THREE.FontLoader();
      fontLoader.load( 'media/fonts/helvetiker_bold.typeface.json', function ( font ) {

        var textGeo = new THREE.TextGeometry( "HELLO", {
          size: 1.0,
          height: 0.25,
          curveSegments: 0,
          font: font,
          weight: "bold",
          style: "normal",
        });

        textGeo.computeBoundingBox();
        var bounds = textGeo.boundingBox;
        textGeo.applyMatrix( new THREE.Matrix4().makeTranslation(
          (bounds.max.x - bounds.min.x) * -0.5,
          (bounds.max.y - bounds.min.y) * -0.5,
          (bounds.max.z - bounds.min.z) * -0.5));

        // THREE.js BUG FIX
        particleCount = Math.floor(particleCount / 3) * 3;

        points = THREE.GeometryUtils.randomPointsInGeometry( textGeo, particleCount );

        data = new Float32Array( particleCount * 4 );
        for ( var i = 0, j = 0, l = data.length; i < l; i += 4, j += 1 ) {
          data[ i ] = points[ j ].x;
          data[ i + 1 ] = points[ j ].y;
          data[ i + 2 ] = points[ j ].z;
          data[ i + 3 ] = 0.0;
        }

        var velData = new Float32Array( particleCount * 4 );
        for ( var i = 0, l = velData.length; i < l; i += 4 ) {
          velData[ i ] = (Math.random() - 0.5) * 0.004;
          velData[ i + 1 ] = (Math.random() - 0.5) * 0.004;
          velData[ i + 2 ] = (Math.random() - 0.5) * 0.004;
          velData[ i + 3 ] = 0.0;
        }

        var randomSeedData = new Uint32Array( particleCount );
        for ( var i = 0; i < randomSeedData.length; ++i ) {
          randomSeedData[ i ] = Math.random() * INT_MAX;
        }

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.BufferAttribute( data, 4 ).setDynamic( true ) );
        geometry.addAttribute( 'velocity', new THREE.BufferAttribute( velData, 4 ).setDynamic( true ) );
        geometry.addAttribute( 'randomSeed', new THREE.BufferAttribute( randomSeedData, 1, false, true ).setDynamic( true ) );
        geometry2 = geometry.clone();

        material = new THREE.ShaderMaterial( {
          uniforms: {
            "pointSize": { type: "f", value: pointSize }
          },
          vertexShader: document.getElementById( 'vs-particles-2' ).textContent,
          fragmentShader: document.getElementById( 'fs-particles-2' ).textContent,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
          transparent: true
        } );

        transformFeedback = gl.createTransformFeedback();

        originBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, originBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        simulationShader = new SimulationShader(renderer, maxFingers);
        simulationShader.setColliders(colliders);

        mesh = new THREE.Points(geometry, material);
        mesh.position.z = -roomSize.z*0.25;
        mesh.position.y = roomSize.y/2;
        // Should probably be linked to the room size somehow.
        mesh.scale.set(textScale, textScale, textScale);
        scene.add(mesh);

      } );

    }

    leapController
      .use('handHold', {})
      .use('handEntry', {})
      .use('riggedHand', {
        parent: scene,
        camera: vrCamera,
        scale: handScale,
        offset: handOffset,
        materialOptions: {
          opacity: showColliders ? 0.5 : 1.0
        }
      })
      .connect();

    function onMouseUpdate(ev) {
      mouseDown = !!ev.buttons;
      if (mouseDown) {
        mouseCoordQueue.push(canvasToColliderVector(ev.clientX, ev.clientY));
      }
    }

    canvas.addEventListener( 'mousedown', onMouseUpdate, false )
    canvas.addEventListener( 'mouseup', onMouseUpdate, false );
    canvas.addEventListener( 'mousemove', onMouseUpdate, false );

    function onTouchUpdate(ev) {
      var touches = event.touches;
      for(var i = 0; i < touches.length; ++i) {
        var touch = touches[i];
        touchPoints.push(canvasToColliderVector(touch.clientX, touch.clientY));
      }
      ev.preventDefault();
    }

    canvas.addEventListener( 'touchstart', onTouchUpdate, false )
    canvas.addEventListener( 'touchend', onTouchUpdate, false );
    canvas.addEventListener( 'touchmove', onTouchUpdate, false );
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize( window.innerWidth, window.innerHeight );
    effect.setSize( window.innerWidth, window.innerHeight );
  }

  window.addEventListener( 'resize', onWindowResize, false );

  function canvasToColliderVector(x, y) {
    pickCoord.x = ((x / canvas.clientWidth) * 2.0) - 1.0;
    pickCoord.y = -((y / canvas.clientHeight) * 2.0) + 1.0;
    pickCoord.z = 0.1;
    pickCoord.unproject(camera);
    pickRay.set(camera.position, pickCoord.sub(camera.position).normalize());
    var point = pickRay.intersectPlane(clickPlane);
    return point;
  }

  function vrCameraToColliderVector() {
    pickCoord.x = 0;
    pickCoord.y = 0;
    pickCoord.z = 0.1;
    pickCoord.unproject(vrCamera);
    //vrCamera.getWorldDirection(pickCoord);
    //pickCoord.unproject(vrCamera);
    pickRay.set(vrCamera.position, pickCoord.sub(vrCamera.position).normalize());
    var point = pickRay.intersectPlane(clickPlane);
    return point;
  }

  function pointToCollider(index, active, vector, size) {
    var o = index * 4;

    if (index >= maxFingers)
      return;

    if (active) {
      colliders[o] =   (vector.x - mesh.position.x) / textScale;
      colliders[o+1] = (vector.y - mesh.position.y) / textScale;
      colliders[o+2] = (vector.z - mesh.position.z) / textScale;
    }
    colliders[o+3] = active ? (size / textScale) : -1;

    colliderMeshes[index].visible = active && showColliders;
    if (active) {
      colliderMeshes[index].position.x = vector.x;
      colliderMeshes[index].position.y = vector.y;
      colliderMeshes[index].position.z = vector.z;
      colliderMeshes[index].scale.set(size, size, size);
    }
  }

  function transformFeedbackPass( gl, shader, source, target ) {
    if (!source || !target)
      return;

    var sourcePosAttrib = source.attributes['position'];
    var sourceVelAttrib = source.attributes['velocity'];
    var sourceRandomSeedAttrib = source.attributes['randomSeed'];
    var targetPosAttrib = target.attributes['position'];
    var targetVelAttrib = target.attributes['velocity'];
    var targetRandomSeedAttrib = target.attributes['randomSeed'];

    var sourcePosBuffer = renderer.properties.get(sourcePosAttrib).__webglBuffer;
    var sourceVelBuffer = renderer.properties.get(sourceVelAttrib).__webglBuffer;
    var sourceRandomSeedBuffer = renderer.properties.get(sourceRandomSeedAttrib).__webglBuffer;
    var targetPosBuffer = renderer.properties.get(targetPosAttrib).__webglBuffer;
    var targetVelBuffer = renderer.properties.get(targetVelAttrib).__webglBuffer;
    var targetRandomSeedBuffer = renderer.properties.get(targetRandomSeedAttrib).__webglBuffer;

    if (targetPosBuffer && sourcePosBuffer) {
      shader.bind();

      gl.enableVertexAttribArray( shader.attributes.position );
      gl.bindBuffer(gl.ARRAY_BUFFER, sourcePosBuffer);
      gl.vertexAttribPointer( shader.attributes.position, 4, gl.FLOAT, false, 16, 0 );

      gl.enableVertexAttribArray( shader.attributes.velocity );
      gl.bindBuffer(gl.ARRAY_BUFFER, sourceVelBuffer);
      gl.vertexAttribPointer( shader.attributes.velocity, 4, gl.FLOAT, false, 16, 0 );

      gl.enableVertexAttribArray( shader.attributes.origin );
      gl.bindBuffer(gl.ARRAY_BUFFER, originBuffer);
      gl.vertexAttribPointer( shader.attributes.origin, 4, gl.FLOAT, false, 16, 0 );

      gl.enableVertexAttribArray( shader.attributes.randomSeed );
      gl.bindBuffer(gl.ARRAY_BUFFER, sourceRandomSeedBuffer);
      gl.vertexAttribIPointer( shader.attributes.randomSeed, 1, gl.UNSIGNED_INT, 0, 0 );

      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, targetPosBuffer);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, targetVelBuffer);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, targetRandomSeedBuffer);

      gl.enable(gl.RASTERIZER_DISCARD);
      gl.beginTransformFeedback(gl.POINTS);

      gl.drawArrays(gl.POINTS, 0, sourcePosAttrib.count /* sourcePosAttrib.itemSize*/);

      gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);

      // Unbind the transform feedback buffer so subsequent attempts
      // to bind it to ARRAY_BUFFER work.
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, null);

      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

      // Avoid messing with THREE.js's WebGL state
      // TODO(kbr): Further Diagnosis
      //gl.disableVertexAttribArray( shader.attributes.position );
      //gl.disableVertexAttribArray( shader.attributes.velocity );
      //gl.disableVertexAttribArray( shader.attributes.origin );
      gl.disableVertexAttribArray( shader.attributes.randomSeed );
      //gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }

  var frameId = 0;
  var fixedStep = 16.666666;
  var remainder = 0;
  function render(t) {
    effect.requestAnimationFrame( render );

    if (vrControls) {
      vrControls.update();
    }

    if (isWebGL2 && mesh) {
      updateColliders();

      var lastTime = simulationShader.getTime(t);
      if (t - lastTime > fixedStep * 5) {
        simulationShader.setTime(t);
        lastTime = t - fixedStep;
      }

      while (remainder + t - lastTime >= fixedStep) {
        lastTime += fixedStep;
        simulationShader.setTime(lastTime);

        if ( frameId % 2 === 0 ) {
          transformFeedbackPass( renderer.context, simulationShader, geometry2, geometry );
          mesh.geometry = geometry2;
        } else {
          transformFeedbackPass( renderer.context, simulationShader, geometry, geometry2 );
          mesh.geometry = geometry;
        }

        frameId++;
      }

      material.uniforms.pointSize.value = effect.isPresenting ? pointSize * 2 : pointSize;

      // Ugly hack to make the particle mesh always draw last
      scene.remove( mesh ); scene.add( mesh );

      // Unless asked not to, accumulate the remainder of time for the next frame.
      // Flag acts as a sort of regression test for http://crbug.com/883871 .
      if (!skipRemainder)
        remainder = t - lastTime;

      // If requestAnimationFrame timestamp jumps a lot, reset it.
      simulationShader.setTime(t);
    }

    effect.render( scene, effect.isPresenting ? vrCamera : camera );
  }

  init();

  requestAnimationFrame(render);
}
