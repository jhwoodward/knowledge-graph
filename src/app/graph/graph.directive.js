﻿(function() {

  'use strict';

  angular.module('neograph.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, stateManager, $window, $timeout, _) {
   
    var options = {
        edges: { widthSelectionMultiplier: 1 },
        hierarchicalLayout: {
          enabled: false,
          levelSeparation: 10, // make this inversely proportional to number of nodes
          nodeSpacing: 200,
          direction: 'UD', //LR
                  //    layout: "hubsize"
        },
        dataManipulation: {
          enabled: true,
          initiallyVisible: true
        },
              // stabilize: true,
              // stabilizationIterations: 1000,
        physics: {
          barnesHut: {
            enabled: true,
            gravitationalvarant: -6000,
            centralGravity: 1,
            springLength: 20,
            springvarant: 0.04,
            damping: 0.09
          },
          repulsion: {
            centralGravity: 0.1,
            springLength: 0.5,
            springvarant: 0.05,
            nodeDistance: 100,
            damping: 0.09
          },
          hierarchicalRepulsion: {
            enabled: false,
            centralGravity: 0,
            springLength: 270,
            springvarant: 0.01,
            nodeDistance: 300,
            damping: 0.09
          }
        },
        onDelete: function(data, callback) {
        }
      }

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/graph/graph.html',
      scope: {
        node: '=',
        comparison: '='
      },
      controller: 'GraphCtrl as vm',
      bindToController: true,
      link: linkFn
    }

    function linkFn(scope, element, attrs, vm) {

      options.onConnect = onNetworkConnect;
      var visNetwork = new vis.Network(element[0], vm.graph, options);

      $timeout(setGraphSize);
      $('.network-manipulationUI.connect').hide();
      // Add event listeners
    
      stateManager.subscribe('loaded', function(state) {
        focusNode(state.node);
      });
      angular.element($window).on('resize', setGraphSize);
      visNetwork.on('resize', onNetworkResize);
      visNetwork.on('select', onNetworkSelect);
      element.on('mousemove', onContainerMouseMove);
      vm.graph.nodes.on('*', onNodeDatasetChanged);

      function onNetworkConnect(data, callback) {
        var newEdge = {
          start: vm.data.nodes[data.from],
          type: graphService.defaultEdgeType(
                  vm.data.nodes[data.from].Type,
                  vm.data.nodes[data.to].Type),
          end: vm.data.nodes[data.to],
          properties: { Weight: 3 }
        };
        scope.publish('newEdge', newEdge);
      }

      function getSelectedNodeId() {
        var selectedNodes = visNetwork.getSelectedNodes();
        if (selectedNodes.length === 1) {
          return selectedNodes[0];
        }
        return undefined;
      };

      function focusNode(node) {
        if (node) {
          Object.keys(vm.data.nodes).forEach(function(key) {
            if (vm.data.nodes[key].label === node.label) {
              if (vm.data.nodes[key].id !== getSelectedNodeId()) {

          //      vm.data.nodes[key].fontSize = 100;

                visNetwork.selectNodes([key]);
                visNetwork.focusOnNode(key, {
                  //scale: 1.5,
                  animation: {
                    duration: 1000,
                    easingFunction: 'easeOutCubic'
                  }
                });
              }
            }
          });
        }
      }

      function setGraphSize() { 
        visNetwork.setSize($window.innerWidth + 'px', $window.innerHeight + 'px'); 
      }

      function onNetworkResize() {
        if (getSelectedNodeId()) {
          visNetwork.focusOnNode(getSelectedNodeId(), {
            scale: 1,
            animation: {
              duration: 1000,
              easingFunction: 'easeOutCubic'
            }
          });
        } else {
          visNetwork.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
        }
      }

      function onNodeDatasetChanged() {
        if (vm.graph.nodes.length) {
          $('.network-manipulationUI.connect').css('display', 'inline-block');
        } else {
          $('.network-manipulationUI.connect').hide();
        }

      }

      function onNetworkSelect(params) {
        var selection = {};
        if (params.nodes.length === 1) {
          selection.node = vm.data.nodes[params.nodes[0]];
        } 
        if (params.edges.length) {
          selection.edges = [];
          params.edges.forEach(function(id) {
            var edge = vm.data.edges[id];
            var startNode = vm.data.nodes[edge.startNode];
            var endNode = vm.data.nodes[edge.endNode];
            selection.edges.push({
              id,
              start: startNode,
              end: endNode,
              type: edge.type,
              properties: edge.properties
            });
          })
        }
        scope.$apply(function() {
           vm.onSelect(selection);
        })
       
      }

      
      
      function onGlobalFocus(nodeid) {
        visNetwork.focusOnNode(nodeid, {
          scale: 1,
          animation: {
            duration: 1000,
            easingFunction: 'easeOutCubic'
          } });
      }

      function onContainerMouseMove(event) {
        var n = visNetwork._getNodeAt({
          x: event.pageX,
          y: event.pageY
        });
        scope.$apply(function() {
          if (n) {
            var dataNode = vm.data.nodes[n.id];
            scope.hoverNode = dataNode;
          //  scope.publish('hover', dataNode);
          } else {
           // scope.publish('hover', undefined);
            scope.hoverNode = undefined;
          }
        });
      }
    }
  }

})();
