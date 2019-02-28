Ext.define('ConfigurationFiles.Client.view.BackupFilesView.BackupOperationStatusWidget', {
    flex: 1,
    extend: 'Ext.form.Label',
    xtype: 'widget.BackupOperationStatus',
    margin: '0 0 0 0',
    width: '16px',
    height: '16px',
    align: 'center',
    //ui: 'compare-button2',
    padding: '1',
    hidden: true,
    hideMode: 'visibility',
    //userCls: 'green-circle-left-icon',
    // html: 'right',
    // tip: 'default Tooltip',
    // setTip: function(value) {
    //     if (this.tip != value)
    //         this.tip = value;
    // },
    // getTip: function() {
    //     return this.tip;
    // },
    // bind: {
    //     //html: '{toolTipValue}'
    //     tip: '{toolTipValue}',
    // },
    // listeners: {
    //     afterrender: function(c) {
    //         Ext.create('Ext.tip.ToolTip', {
    //             target: c.getEl(),
    //             viewModel: c.getRefOwner().getViewModel(),
    //             bind: {
    //                 html: 'State: {toolTipValue}',
    //                 //hidden: '{showProgress}',
    //                 // userCls: '{backupOperationUserClass}',
    //             }
    //         });
    //     }
    // },
});

Ext.define('ConfigurationFilesClient.view.BackupFilesView.BackOperationsStatusUi', {
    extend: 'Ext.container.Container',
    xtype: 'widget.BackOperationsStatusUi',
    layout: {
        type: 'hbox',
        align: 'middle',
        padding: 0
    },
    style: {
        backgroundColor: 'transparent'
    },
    maxWidth: 36,
    minWidth: 20,

    items: [{
            xtype: 'BackupOperationStatus',
            flex: 1,
            name: 'left',
            bind: {
                hidden: '{showProgress}',
                userCls: '{backupOperationUserClass}'
            },
            listeners: {
                afterrender: function(c) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: c.getEl(),
                        viewModel: c.getRefOwner().getViewModel(),
                        bind: {
                            html: '{backupOperationToolTip}',
                            //hidden: '{showProgress}',
                            // userCls: '{backupOperationUserClass}',
                        }
                    });
                }
            },
        },
        {
            xtype: 'BackupOperationStatus',
            flex: 1,
            name: 'right',
            bind: {
                hidden: '{showProgress}',
                userCls: '{restoreOperationUserClass}'
            },
            listeners: {
                afterrender: function(c) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: c.getEl(),
                        viewModel: c.getRefOwner().getViewModel(),
                        bind: {
                            html: 'State: {toolTipValue}',
                            //hidden: '{showProgress}',
                            // userCls: '{backupOperationUserClass}',
                        }
                    });
                }
            },
        },
        {
            xtype: 'BackupOperationStatus',
            flex: 2,
            name: 'inProgress',
            userCls: 'in-progress-icon',
            bind: {
                hidden: '{!showProgress}'
            },
            listeners: {
                afterrender: function(c) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: c.getEl(),
                        viewModel: c.getRefOwner().getViewModel(),
                        bind: {
                            html: '{inProgressTooltip}',
                            //hidden: '{showProgress}',
                            // userCls: '{backupOperationUserClass}',
                        }
                    });
                }
            },
        },

        // {
        //     // getTip: function(value, metedata, record) {
        //     //     var me = this,
        //     //         tooltip = '<div style="font-weight: normal;background-color: white;width: 350px;padding: 15px;margin:-10px">';

        //     //     for (var i = 0; i < 4; i++) {

        //     //         tooltip += ((i % 2 == 0) ? '<div class="attribute-row">' : '<div class="attribute-row-alt">');
        //     //         tooltip += '<div class="attribute-name">' + "attr.label" + '</div><div class="attribute-value">' + "value" + '</div> </div>';
        //     //     }

        //     //     tooltip += '</div>';
        //     //     return tooltip;
        //     // },

        //     bind: {
        //         hidden: '{!showProgress}'
        //     },

        //     flex: 1,
        //     xtype: 'label',
        //     margin: '0 0 0 0',
        //     width: '16px',
        //     height: '16px',
        //     align: 'center',
        //     //ui: 'compare-button2',
        //     padding: '1',
        //     userCls: 'red-circle-left-icon',
        //     tip: 'This is a tip',
        //     listeners: {
        //         render: function(c) {
        //             Ext.create('Ext.tip.ToolTip', {
        //                 target: c.getEl(),
        //                 html: c.tip //c.getTip(), //c.tip
        //             });
        //         }
        //     },
        //     //html: 'left',
        // },
        // {
        //     flex: 1,
        //     xtype: 'label',
        //     margin: '0 0 0 0',
        //     width: '16px',
        //     height: '16px',
        //     align: 'center',
        //     //ui: 'compare-button2',
        //     padding: '1',
        //     userCls: 'green-circle-left-icon',
        //     // html: 'right',
        //     tip: 'This is a tip',
        //     setTip: function(value) {
        //         if (this.tip != value)
        //             this.tip = value;
        //     },
        //     getTip: function() {
        //         return this.tip;
        //     },
        //     bind: {
        //         //     html: '{toolTipValue}'
        //         tip: '{toolTipValue}',
        //     },
        //     listeners: {
        //         render: function(c) {
        //             Ext.create('Ext.tip.ToolTip', {
        //                 target: c.getEl(),
        //                 viewModel: c.getRefOwner().getViewModel(),
        //                 bind: {
        //                     html: 'State: {toolTipValue}',
        //                     hidden: '{showProgress}'
        //                 }
        //                 //html: c.tip //c.getTip(), //c.tip
        //             });
        //         }
        //     },
        // }
    ],
    viewModel: {
        formulas: {
            toolTipValue: function(get) {
                var record = get('record');
                if (record)
                    return 'True';
                return 'False';
            },
            backupOperationToolTip: function(get) {
                var record = get('record');
                if (!record)
                    return null;
                var opStatus = record.getData().LastBackupStatus;
                return 'backup Status = ' + opStatus;
            },
            inProgressTooltip: {
                get: function(data) {
                    return "In Progress";
                }
            },

            showProgress: function(get) {
                var record = get('record');
                if (record == null || record == undefined)
                    return false;
                var isInProgress = record.getData().myField == true;
                if (isInProgress)
                    return true;
                return false;
            },
            backupOperationUserClass: function(get) {
                var record = get('record');
                if (record == null || record == undefined)
                    return false;
                var operationStatus = record.data.LastBackupStatus;
                if (operationStatus == null || operationStatus == undefined)
                    return 'grey-status-circle-icon';
                if (operationStatus == "success")
                    return 'green-status-circle-icon';
                if (operationStatus == "failed")
                    return 'red-status-circle-icon';
            },
            restoreOperationUserClass: function(get) {
                var record = get('record');
                if (record == null || record == undefined)
                    return false;
                var operationStatus = record.data.LastRestoreStatus;
                if (operationStatus == null || operationStatus == undefined)
                    return 'grey-status-circle-icon';
                if (operationStatus == "success")
                    return 'green-status-circle-icon';
                if (operationStatus == "failed")
                    return 'red-status-circle-icon';
            }
        },

    }
});