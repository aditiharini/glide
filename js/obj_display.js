OBJLoader: function() {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };
        var onError = function ( xhr ) {
            console.log ("ERROR", xhr);
        };
        var loader = new THREE.OBJLoader( manager );
        var allParticle = this.scene.getParticles();
        var lg = allParticle.length;
        var scale = this.renderer.scale;
        var obj_filename = $('.controls .3d_mesh option:selected').text();
        loader.load(obj_filename + '.obj', function ( object ) {
            object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                console.log (" === CHILD === ");
                console.log (child.geometry);
                var randomPointPositions = THREE.GeometryUtils.randomPointsInBufferGeometry( child.geometry, lg  );
                console.log (randomPointPositions[0].x, randomPointPositions[0].y, randomPointPositions[0].z );
                for( var i = 0; i < randomPointPositions.length; i++ ){
                   var p = allParticle[i];
                   p.diffX = randomPointPositions[i].x * scale -p.x ;
                   p.diffY = randomPointPositions[i].y * scale -p.y;
                   p.diffZ = randomPointPositions[i].z * scale -p.z;
                }
            }
        } );
      }, onProgress, onError );
  }
