/**
 * Created by ornaz on 09/08/2018.
 */
Ext.define('ConfigurationFilesClient.store.NetworkElementsStore', {
    extend: 'Ext.data.Store',
    alias: 'store.networkelementsstore',
    requires: [
        'ExtCore.util.JCoreProxy'
    ],
    listeners: {
        beforeload: function (store, operation, eOpts) {
            store.getProxy().jsonData = this.query_params;
        }
    },

    autoLoad: false,

    proxy: {
        type: 'jcore',
        interconnectPointName: 'ConfigurationFilesClient:BCAPIGenricService',
        //        url: '/getValuesBySubstrings',
        actionMethods: {
            read: 'POST'
        },
        reader: {
            type: 'json',
            transform: {
                fn: function (data) {
                    var results = [];
                    var columns =  null;
                    if (!Ext.isEmpty(data.result)) {
                        columns = data.result.columns;
                        Ext.Array.each(data.result.resultSet.row, function (obj) {
                            var result = {};
                            for (var column in columns) {
                                result[columns[column].name] = obj.item[column] ? Ext.htmlEncode(obj.item[column].value) : null;
                            }
                            results.push(result);
                        });
                    }
                    else if (!Ext.isEmpty(data.columns)) {
                        columns = data.columns;
                        Ext.Array.each(data.resultSet.row, function (obj) {
                            var result = {};
                            for (var column in columns) {
                                result[columns[column].name] = obj.item[column] ? Ext.htmlEncode(obj.item[column].value) : null;
                            }
                            results.push(result);
                        });
                    }
                    return results;
                }
            }
        }
    }
});

