﻿angular.module('neograph.node.edit',['neograph.cache', 'neograph.session', 'neograph.utils'])
    .controller('EditNodeCtrl',  function (neo, session, utils,$scope,$stateParams,cache) {
       
                 if ($stateParams.node){
                    cache.getNode($stateParams.node).then(function(node){
                            $scope.node = node;
                        }); 
                }
                
                $scope.deleteNode = function (n) {
                    
                    neo.deleteNode(n)
                    .then(function (deleted) {
                        
                        $scope.selection.selectedNode = deleted;
                        //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
                        //let view handle its own data ?
                        delete $scope.activeView.data.nodes[n.id];
                        $scope.publish("deleted", { selection: { nodes: [n] } });

                    });
                }
                
                
                $scope.destroyNode = function (n) {
                    
                    neo.destroyNode(n)
                    .then(function (deleted) {
                        
                        $scope.selection.selectedNode = undefined;
                        
                        //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
                        //let view handle its own data ?
                        delete $scope.activeView.data.nodes[n.id];
                        
                        $scope.publish("deleted", { selection: { nodes: [n] } });

                    });

                }
                
                $scope.saveNode = function (n) {
        
                    neo.saveNode(n, session.user)
                    .then(function (node) {
                        
                        $scope.node = node;
                        
                        var newData = {};
                        newData[node.id] = node;
                        $scope.publish("dataUpdate", newData)
                        //if type, refresh types
                        if (node.Type == "Type") {
                            utils.refreshTypes();
                        }
                        
                        $(node.temp.links).each(function (i, e) { e.editing = undefined; })

                    });
                }
                
                
                $scope.restoreNode = function (n) {
                    
                    neo.restoreNode(n).then(function (node) {
                        $scope.node = node;
                        var newData = {};
                        newData[node.id] = node;
                        $scope.publish("dataUpdate", newData)
                    });
                }
                
                
                $scope.$watch("node", function (node) {
                    if (node) {
                        
                        node.temp.labelled = node.temp.labelled || [];
                        
                        $(".labelEdit input").val('');
                        
                        $scope.deleted = node.labels.indexOf('Deleted') > -1;
                    }

                });
                
                
                
                
                //tie label value to lookup if empty or the same already
                $scope.$watch("node.Lookup", function (lookup, beforechange) {
                    if (lookup) {
                        
                        if ($scope.node.Label != undefined && $scope.node.Label.trim() == "" || $scope.node.Label == beforechange) {
                            $scope.node.Label = lookup;

                        }
                 

                    }

                });
                
                $scope.isAutogeneratedField = function (key) {
                    
                    
                    return key != 'Lookup' && key != 'Type' && key != 'Label' && key != 'Description' && key != 'Text' && key != 'Name' && key != 'SystemInfo' &&
                    key.indexOf('FB_') != 0 &&
                    key.indexOf('Wiki') != 0 &&
                    key.indexOf('Image') != 0 &&
                    key != 'temp' &&
                    key != 'labels' &&
                    key != 'id' &&
                    key != 'created';

                }
                
                
                
                
                $scope.addItem = function (col, item) {
                    
                    
                    
                    if ($scope.node[col].indexOf(item.Label) === -1) {
                        $scope.node[col].push(item.Label);
                    }
                //else highlight the item momentarily


                }
                
                $scope.removeItem = function (col, label) {
                    
                    var ind = $scope.node[col].indexOf(label);
                    if (ind > -1) {
                        $scope.node[col].splice(ind, 1);
                        if ($scope.node.Type == label) {
                            $scope.node.Type = undefined;
                        }
                    }

                }
                
                
                $scope.nodeTypes = [];
                
                $scope.$watchCollection("node.labels", function (labels) {
                    console.log('labels changed')
                    console.log(labels);
                    if (labels) {
                        
                        var selectedTypes = [];
                        angular.forEach($scope.node.labels, function (l) {
                            if (utils.types[l]) {
                                selectedTypes.push({ Lookup: l, Type: 'Type' });
                            }
                        });
                        
                        $scope.nodeTypes = selectedTypes;
                        
                        //     console.log(selectedTypes);
                        
                        //set type if not yet set and one label added that is a type
                        if (!$scope.node.Type && $scope.nodeTypes.length === 1) {
                            
                            $scope.node.Type = $scope.nodeTypes[0].Lookup; //for types the lookup will always be the label

                        }

                    //get properties relating to chosen labels and extend node to enable them
                    //neo.getProps(labels).then(function (out) {
                    //    console.log('extending node');
                    //    console.log(out);
                    //    console.log(out.props);
                    //    $scope.node = $.extend(out.props,$scope.node);
                    //    console.log($scope.node);
                    //});


                    }

                });
                
                //can be called from clicking label, in which case item is text value, or from the typeahead in which case it is an object with Lookup property
                $scope.setType = function (item) {
                    //   var itemtext = item.Label ||item.Lookup
                    console.log(item);
                    if (utils.isType(item.Label)) {
                        $scope.node.Type = item.Label;
                    }
                }
                
                
                $scope.reverseRelprop = function (prop) {
                    
                    var reversedProp = angular.copy(prop);
                    reversedProp.predicate.Reverse();
                    
                    //disallow if prop already exists
                    if ($scope.node.temp.relProps[reversedProp.predicate.Key()]) {
                        return;
                    }
                    else {
                        
                        //remove prop and replace with cloned prop
                        delete $scope.node.temp.relProps[prop.predicate.Key()];
                        $scope.node.temp.relProps[reversedProp.predicate.Key()] = reversedProp;
                    }


                }
                
                
                $scope.$watch('newPredicate', function (v) {
                    
                    if (v) {
                        $scope.addRelationship({ Lookup: v.toUpperCase().replace(/ /g, "_") });
                    }
                });
                
                
                
                
                $scope.addRelationship = function (item) {
                    
                    
                    var p = new utils.Predicate(item.Lookup, "out");//currently no way to select 'in' relationships
                    
                    $scope.node.temp = $scope.node.temp || {};
                    $scope.node.temp.relProps = $scope.node.temp.relProps || {};
                    if (!$scope.node.temp.relProps[p.Key()]) {
                        $scope.node.temp.relProps[p.Key()] = { predicate: p, items: [] };
                    }



                }




           


            });