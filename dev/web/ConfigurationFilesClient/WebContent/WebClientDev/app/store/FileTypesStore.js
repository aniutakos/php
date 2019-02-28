const FILE_TYPE_CONFIG_ID_COLUMN_NAME = "ConfFileTypeConfigId";
const FILE_TYPE_DISPLAY_NAME_COLUMN_NAME = "ConfFileTypeDisplayName";
const FILE_TYPE_OBJECT_IF_COLUMN_NAME = "ObjectId";

Ext.define('ConfigurationFilesClient.store.FileTypesStore', {
    extend: 'Ext.data.Store',
    alias: 'store.fileTypesStore',
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

                    var results = [];
                    var columns = data.columns;

                    var displayNameColumn = 1;
                    var configIdColumn = 0;
                    var neIdColumn = 0;

                    Ext.Array.each(columns, function(column, colIndex) {
                        if (column.name == FILE_TYPE_DISPLAY_NAME_COLUMN_NAME)
                            displayNameColumn = colIndex;
                        if (column.name == FILE_TYPE_CONFIG_ID_COLUMN_NAME)
                            configIdColumn = colIndex;
                        if (column.name == FILE_TYPE_OBJECT_IF_COLUMN_NAME)
                            neIdColumn = colIndex;

                    });

                    Ext.Array.each(data.resultSet.row, function(obj) {
                        var result = {};

                        var fileTypeName = obj.item[displayNameColumn] ? obj.item[displayNameColumn].value : "";
                        var configId = obj.item[configIdColumn] ? obj.item[configIdColumn].value : "";
                        var neId = obj.item[neIdColumn] ? obj.item[neIdColumn].value : "";
                        result.text = fileTypeName;
                        result.value = configId;
                        result.neId = neId;

                        results.push(result);
                    });

                    return results;
                },
            },
        },
    },

});