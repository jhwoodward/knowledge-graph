﻿angular.module('neograph.neo.client', ['ngResource', 'neograph.settings'])
.factory('neoClient', ['$resource', 'settings', function ($resource, settings) {
    // return $resource('http://localhost:1337/node/match', {txt:'@txt',restrict:'@restrict'}, {
    //    matchNodes: {
    //        method: 'POST',
    //        isArray:true
    //    }
    // });

    // return $resource(null,null, {
    //    matchNodes: {
    //        url: 'http://localhost:1337/node/match',
    // //       params: {txt:'',restrict:''},
    //        method: 'POST',
    //        isArray: true
    //    }
    // });

  var root = settings.apiRoot;

  return {

    node:$resource(null, null, {
      search: {
        url: root + '/search',
        method: 'POST',
        isArray: true
      },
      get: {
        url: root + '/node/get/:id',
        method: 'GET',
      },
      getWithRels: {
        url: root + '/node/getWithRels/:id',
        method: 'GET',
      },
      save: {
        url: root + '/node/save',
        method: 'POST'
      },
      saveImage: {
        url: root + '/node/saveImage',
        method: 'POST'
      },
      saveProps: {
        url: root + '/node/saveProps',
        method: 'POST'
      },
      saveRels: {
        url: root + '/node/saveRels',
        method: 'POST'
      },
      saveWikipagename: {
        url: root + '/node/saveWikipagename',
        method:'POST'
      },
      saveMultiple: {
        url: root + '/node/saveMultiple',
        method: 'POST'
      },
      del: {
        url: root + '/node/delete',
        method: 'POST'
      },
      destroy: {
        url: root + '/node/destroy',
        method: 'POST'
      },
      restore: {
        url: root + '/node/restore',
        method: 'POST'
      }

    }),
    picture: $resource(null, null, {
      labelled: {
        url: root + '/pictures/labelled/:label',
        method: 'GET'
      },
      search: {
        url: root + '/pictures/search',
        method: 'POST'
      }
    }),
    edge: $resource(null, null, {
      save: {
        url: root + '/edge/save',
        method: 'POST'
      },
      del: {
        url: root + '/edge/delete',
        method: 'POST'

      }
    }),
    user:$resource(null, null, {
      saveFavourite: {
        url: root + '/user/saveFavourite',

        method: 'POST'

      },
      get: {
        url: root + '/user/:user',
        method: 'GET'
      }
    }),
     utils:$resource(null, null, {
      getDistinctLabels: {
        url: root + '/labels/distinct',
        method: 'POST'
      }
    }),
    graph: $resource(null, null, {
      get: {
        url: root + '/graph',
        method: 'POST'
      }
    }),
    type: $resource(null, null, {
      getAll: {
        url: root + '/type/getall',
        method: 'GET'
      }
    }),
    predicate: $resource(null, null, {
      getAll: {
        url: root + '/predicates',
        method: 'GET'
      }
    })
    ,
    graphql:$resource(null, null, {
      query: {
        url: root + '/graphql',
        method: 'POST'
      }
    }),
    relationship:$resource(null, null, {
      shortest: {
        url: root + '/relationship/shortest/:from/:to',
        method: 'GET'
      },
      allshortest: {
        url: root + '/relationship/allshortest/:from/:to',
        method: 'GET'
      },
      visual: {
        url: root + '/relationship/visual/:from/:to',
        method: 'GET',
        isArray:true
      },
    })

  };

}]);
