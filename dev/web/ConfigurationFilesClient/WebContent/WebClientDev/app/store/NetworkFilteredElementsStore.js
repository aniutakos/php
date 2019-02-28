// Removed by Igor S.
//Ext.define('ConfigurationFilesClient.store.NetworkFilteredElementsStore', {
//    extend: 'Ext.data.Store',
//    alias: 'store.networkfilteredelementsstore',
//    requires: [
//        'ExtCore.util.JCoreProxy'
//    ],
//    listeners: {
//        beforeload: function (store, operation, eOpts) {
//            store.getProxy().jsonData = this.query_params;
//        }
//    },
//
//    autoLoad : false,
//
//    proxy: {
//        type: 'jcore',
//        interconnectPointName: 'ConfigurationFilesClient:BCAPIGenricService',
//        //interconnectPointName: 'ConfigurationFilesClient:CFMNEScriptMapping',
//        url: '/getValues',
//        actionMethods: {
//            read   : 'POST'
//        },
//        reader: {
//            type: 'json',
//            transform:{
//                fn: function (data) {
//                    var results = [];
//                    if(!Ext.isEmpty(data.columns)) {
//                        var columns = data.columns;
//                        Ext.Array.each(data.resultSet.row, function (obj) {
//                            var result = {};
//                            for (var column in columns) {
//                                result[columns[column].name] = obj.item[column] ? Ext.htmlEncode(obj.item[column].value) : null;
//                            }
//                            results.push(result);
//                        });
//                    }
//
//                    return results;
//                }
//            }
//        }
//    }
//});
//
