/**
 * Created by igors on 08/08/2018.
 */

//Ext.override(Ext.grid.filters.Filters, {
//    onCheckChange: function(menu, value) {
//        // Locking grids must lookup the correct grid.
//        var parentTable = this.isLocked ? item.up('tablepanel') : this.grid,
//            filter = this.getMenuFilter(parentTable.headerCt);
//        filter.setActive(value);
//
//        if (value === false && filter instanceof Ext.grid.filters.filter.String)
//            filter.setValue('');
//    }
//
//});

Ext.define('ConfigurationFilesClient.view.BackupFilesView', {
    extend: 'Ext.panel.Panel',
    xtype: 'backup-files-view',
    controller: 'backupfilesview',
    viewModel: {
        type: 'backupfilesview'
    },
    requires: [
        //        'Ext.form.Panel'
    ],
    padding: 3,
    layout: {
        type: 'vbox',
        align: 'stretch',
        padding: 3
    },
    listeners: {
        boxready: "onBoxReady"
    },
    dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            padding: 5,
            defaults: {
                xtype: 'button',
                margin: 3,
                height: 30
            },
            items: [{
                    ui: 'files-toolbar-button',
                    iconCls: 'restore-file-icon',
                    text: 'Restore',
                    handler: 'restoreSelectedFile',
                    bind: {
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.RestoreFile}',
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Restore}',
                        disabled: '{restoreDisabled}'
                    },
                    margin: '3 3 3 0'
                },
                {
                    ui: 'files-toolbar-button',
                    iconCls: 'open-file-icon',
                    handler: 'showSelectedFile',
                    bind: {
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.ShowFile}',
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Open}',
                        disabled: '{!isOneFileSelected}'
                    }

                },
                {
                    ui: 'files-toolbar-button',
                    iconCls: 'download-file-icon',
                    handler: 'downloadSelectedFile',
                    bind: {
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.DownloadFile}',
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Download}',
                        disabled: '{!isOneFileSelected}'
                    }

                },
                {
                    ui: 'files-toolbar-button',
                    iconCls: 'delete-file-icon',
                    handler: 'deleteFilesClick',
                    bind: {
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.DeleteFiles}',
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Delete}',
                        disabled: '{deleteDisabled}'
                    }
                },
                '->',
                {
                    xtype: 'label',
                    padding: '10 10 5 10',
                    bind: {
                        text: '{filesCountText}',
                        hidden: '{!isSingleElementSelected}'
                    },
                    style: {
                        //fontWeight: 'bold',
                        fontWeight: 'normal',
                        fontSize: '14px'
                    }

                },
                {
                    iconCls: 'refresh-icon',
                    margin: '3 0 3 3',
                    ui: 'files-toolbar-button2',
                    handler: 'refreshFilesClick',
                    bind: {
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Refresh}',
                        disabled: '{!isSingleElementSelected}'
                    }
                },
                // {
                //     iconCls: 'autorefresh-icon',
                //     margin: '3 3 3 0',
                //     ui: 'files-toolbar-button2',
                //     bind: {
                //         tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.AutoRefresh}',
                //         disabled: '{!isSingleElementSelected}'
                //     }
                // }
            ]
        },
        {
            xtype: 'toolbar',
            dock: 'bottom',
            style: {
                background: 'rgba(79,85,95,0.5)',
                borderRadius: '5px'
            },
            padding: 3,
            defaultType: 'textfield',

            items: [{
                    xtype: 'label',
                    bind: {
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.CompareFiles}'
                    },
                    margin: 3,
                    style: {
                        color: 'white',
                        fontWeight: 'normal',
                        fontSize: '14px'
                    }
                },
                {
                    xtype: 'button',
                    margin: '0 0 0 10',
                    ui: 'compare-button2',
                    iconCls: 'compare1-icon',
                    iconAlign: 'top',
                    padding: '5'
                        //disabled: true
                        //text:'1'
                },
                {
                    name: 'file1',
                    flex: 1,
                    triggers: {
                        clear: {
                            cls: 'x-fa fa-close',
                            //tooltip: 'Clear',
                            hideOnReadOnly: false
                        }
                    },
                    bind: {
                        value: '{compareFile1Desc}',
                        hideTrigger: '{!compareFile1Desc}',
                        emptyText: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.DragFile1Here}'
                    },
                    cls: 'file-compare-input',
                    readOnly: true,
                    enableKeyEvents: true,
                    margin: '3 3 3 0',
                    listeners: {
                        boxready: 'initDropFileTarget',
                        afterrender: 'initClearTextTrigger',
                        change: 'textChanged',
                        keydown: 'fileKeyDown'
                    }
                },
                {
                    xtype: 'button',
                    margin: '0 0 0 10',
                    ui: 'compare-button2',
                    iconCls: 'compare2-icon',
                    iconAlign: 'top',
                    padding: '5'
                        //disabled: true
                        //text:'2'
                },
                {
                    name: 'file2',
                    triggers: {
                        clear: {
                            cls: 'x-fa fa-close',
                            //tooltip: 'Clear',
                            hideOnReadOnly: false
                        }
                    },
                    bind: {
                        value: '{compareFile2Desc}',
                        hideTrigger: '{!compareFile2Desc}',
                        emptyText: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.DragFile2Here}'
                    },
                    flex: 1,
                    cls: 'file-compare-input',
                    readOnly: true,
                    margin: '3 3 3 0',
                    enableKeyEvents: true,
                    listeners: {
                        boxready: 'initDropFileTarget',
                        afterrender: 'initClearTextTrigger',
                        change: 'textChanged',
                        keydown: 'fileKeyDown'
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'compare3-icon',
                    ui: 'compare-button1',
                    handler: 'compareFilesClick',
                    height: 32,
                    //width:120,
                    bind: {
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Compare}',
                        tooltip: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.CompareTip}',
                        disabled: '{!isCompareAllowed}'
                    },
                    margin: 3
                }
            ]
        }

    ],
    items: [],

    initComponent: function() {
        this.items = [{
                xtype: 'multiselection-gridpanel',
                cls: 'grid-cls grid-backup-files',
                rowLines: false,
                //features: [{ ftype: 'grouping' }],
                plugins: [
                    'tooltips',
                    {
                        ptype: 'gridfilters',
                        onCheckChange: function(menu, value) {
                            // Locking grids must lookup the correct grid.
                            var parentTable = this.isLocked ? item.up('tablepanel') : this.grid,
                                filter = this.getMenuFilter(parentTable.headerCt);
                            filter.setActive(value);

                            if (value === false) {
                                if (filter instanceof Ext.grid.filters.filter.String)
                                    filter.setValue('');
                                else if (filter instanceof Ext.grid.filters.filter.List) {
                                    filter.menu.items.each(function(checkbox) {
                                        // go over all inner checkbox and turn them all off, if set to true
                                        if (checkbox.checked)
                                            checkbox.setChecked(false, false);
                                    });
                                }
                            }
                        }
                    }
                ],
                forceFit: true,
                autoScroll: true,
                viewConfig: {
                    markDirty: false,
                    stripeRows: true,
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: 'compareDDGroup',
                        pluginId: 'gridviewdragdrop',
                        dragText: LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.DragTheRowMsg'),
                        enableDrop: false
                    }
                },
                selModel: {
                    selType: 'checkboxmodel',
                    mode: 'MULTI',
                    //showHeaderCheckbox: false,
                    listeners: {
                        selectionChange: 'selectFiles'
                    }
                },
                listeners: {
                    rowdblclick: 'fileRowDblClick'
                },
                columns: [],
                bind: {
                    store: '{backup_files_store}',
                    multiSelection: '{selectedFiles}',
                    flex: '{gridFlex}',
                    disabled: '{isDisplayMessage}'
                }
            },
            {
                xtype: 'panel',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                    xtype: 'label',
                    cls: 'grey-label-20',
                    margin: '100 0 10 0',
                    bind: {
                        html: '{messageText}',
                        hidden: '{!isDisplayMessage}',
                        flex: '{messageFlex}'
                    }
                }]
            }

        ];
        this.callParent(arguments);
    }
});