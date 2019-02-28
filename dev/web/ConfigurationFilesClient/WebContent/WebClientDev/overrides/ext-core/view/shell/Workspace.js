/**
 * Created by igors on 05/08/2018.
 */
Ext.define('ExtCore.overrides.view.shell.Workspace', {
    override: 'ExtCore.view.shell.Workspace',
    requires: [
        //'ConfigurationFilesClient.view.BackupRestoreView'
    ],

    layout: 'fit',
    flex: 1,
    items: [{
        flex: 1,
        xtype: 'tabpanel',
        tabPosition: 'top',
        tabBar: {
            ui: 'workspace-tabs-bar-ui'
        },
        defaults: {
            //scrollable: 'y'
            tabConfig: {
                ui: 'workspace-tabs-ui',
                margin: '0 2 0 1'
            },
            style: {
                borderTop: "thick solid #B42E34"
            }
        },
        listeners: {
            tabchange: function(tabPanel, newCard, oldCard, eOpts) {

                if (newCard.getTdType() == 'backup-restore-view')
                    newCard.getController().onActivated();
                if (oldCard.getTdType() == 'backup-restore-view')
                    oldCard.getController().onDeactivated();
            }
        },
        items: [{
                xtype: 'backup-restore-view'
            },
            {
                xtype: 'jobs-view'
            }
        ]
    }]

});