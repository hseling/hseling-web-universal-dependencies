Promise.all([
  fetch('cy-style.json', {mode: 'no-cors'})
    .then(function(res) {
      return res.json()
    }),
  fetch('data.json', {mode: 'no-cors'})
    .then(function(res) {
      return res.json()
    })
])
  .then(function(dataArray) {
    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),

      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,


      layout: {
        name: 'grid',
        condense: true,
        cols: 4,
        sort: function( a, b ){
          if( a.id() < b.id() ){
            return -1;
          } else if( a.id() > b.id() ){
            return 1;
          } else {
            return 0;
          }
        }
      },

      style: dataArray[0],

      elements: dataArray[1]
    });
    cy.on('mousedown', 'node', function(evt){
      var node = evt.target;
      console.log( 'tapped ' + node.id() );
    });
  });

