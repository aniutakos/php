/** * The main application class. An instance of this class is created by app.js when it * calls Ext.application(). This is the ideal place to handle application launch and * initialization details. */
Ext.define('ConfigurationFilesClient.Application', {
    extend: 'ExtCore.ux.Application',
    requires: [
        'ExtCore.*',
        'ConfigurationFilesClient.*',
        'Ext.grid.column.*'
    ],

    config: {
        appName: 'ConfigurationFilesClient'
    },
    title: 'Configuration Director',
    bundles: [{
            //module: 'ConfigurationFilesClient',
            //localBundle: 'ConfigurationFilesClient_localizedResources',
            namespace: 'ConfigurationFilesClient'
        },
        {
            package: 'ext-core',
            namespace: 'ExtCore'
        },
        {
            package: 'ext-core',
            namespace: 'QueryBuilder'
        }
    ],


    getAdditionalInitializers: function() {
        var me = this,
            initializers = [];

        AuditService.SubModuleName = 'ConfigurationDirector';

        var properties = [
            { AppName: SessionProvider.getAppName(), PropName: 'max.search.networkelemets', DefaultValue: 500 },
            { AppName: SessionProvider.getAppName(), PropName: 'RunScriptTimeoutSeconds', DefaultValue: 30 },
            { AppName: SessionProvider.getAppName(), PropName: 'StatusIndicationsRefreshIntervalSeconds', DefaultValue: 60 },
            { AppName: SessionProvider.getAppName(), PropName: 'CheckScriptExecutionStatusIntervalSeconds', DefaultValue: 1 },
            { AppName: SessionProvider.getAppName(), PropName: 'CheckScriptLongExecutionStatusIntervalSeconds', DefaultValue: 10 },
            { AppName: SessionProvider.getAppName(), PropName: 'max.files.backupFiles', DefaultValue: 500 }

        ];

        var initProperties = _.map(properties, function(property) {
            return function() {
                return PropertyService.getProperty(property.AppName, property.PropName, false, undefined, property.DefaultValue);
            }
        });

        initializers = initializers.concat(initProperties);

        me.bcMetadataClassName = 'BCAPI:CFM.CFMNetworkElement';
        me.bcMetadataClassName4BackupFiles = 'BCAPI:CFM.CFMMain';
        var getClassMetadata = function() {
            return MetadataClassService.loadMetadataToCache([me.bcMetadataClassName, me.bcMetadataClassName4BackupFiles]);
        };
        initializers.push(getClassMetadata);
        return initializers;
    },

    navigationType: 'tabsNavigator',
    navigation: []


});