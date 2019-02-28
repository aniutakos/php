/**
 * Created by igors on 08/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.BackupRestoreView', {
    extend: 'Ext.panel.Panel',
    xtype: 'backup-restore-view',
    requires: [],

    controller: 'backuprestoreview',
    viewModel: {
        type: 'backuprestoreview'
    },
    //title: 'Backup & Restore',
    bind: {
        title: '{resources.ConfigurationFilesClient.BackupRestoreView.Title}'
    },
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'network-elements-view',
        id: 'network-elements-view',
        minWidth: 230,
        //  layout: 'fit',
        flex: 1,
        autoScroll: true
    }, {
        xtype: 'splitter'
    }, {
        xtype: 'backup-files-view',
        flex: 3,
        autoScroll: true
    }]
});