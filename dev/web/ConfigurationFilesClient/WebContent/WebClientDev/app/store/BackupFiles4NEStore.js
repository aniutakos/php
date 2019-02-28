/**
 * Created by igors on 13/08/2018.
 */
Ext.define('ConfigurationFilesClient.store.BackupFiles4NEStore', {
    extend: 'Ext.data.Store',
    alias: 'store.backupfiles4nestore',
    requires: [
        'ExtCore.util.JCoreProxy'
    ],
    listeners: {
        beforeload: function(store, operation, eOpts) {
            store.getProxy().jsonData = this.query_params;
        }
    },

    autoLoad: false,

    proxy: {
        type: 'jcore',
        interconnectPointName: 'ConfigurationFilesClient:BCAPIGenricService',
        url: '/getValues',
        actionMethods: {
            read: 'POST'
        },
        reader: {
            type: 'json',
            transform: {
                fn: function(data) {
                    var me = this;
                    var results = [];
                    var columns = data.columns;

                    capitalizeFirstLetter = function(str) {
                        if (str.Length <= 0)
                            return str;
                        if (str.Length == 1)
                            return str.charAt(0).toUpperCase();
                        return str.charAt(0).toUpperCase() + str.slice(1);
                    };

                    var columnsNamesForUppercase = ["SourceType"];

                    Ext.Array.each(data.resultSet.row, function(obj) {
                        var result = {},
                            val;
                        Ext.Array.each(columns, function(column, colIndex) {
                            val = obj.item[colIndex] ? obj.item[colIndex].value : null;
                            if (val != null && column.dataType == "dateTime")
                                val = Ext.Date.parse(val, 'm/d/Y H:i:s');
                            if (val != null && columnsNamesForUppercase.indexOf(column.name) >= 0)
                                val = capitalizeFirstLetter(val);
                            result[column.name] = val;

                        });
                        result['compare1'] = false;
                        result['compare2'] = false;
                        results.push(result);
                    });

                    return results;
                }
            }
        }
    }
});