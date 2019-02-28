/**
 * Created by igors on 08/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.NetworkElementView', {
    extend: 'Ext.panel.Panel',
    xtype: 'network-elements-view',
    requires: [
        'ConfigurationFilesClient.view.MultiSelectionGridPanel'
    ],

    ui: 'left-panel-ui',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    items: [{
            xtype: 'container',
            height: 50,
            layout: 'hbox',
            items: [{
                    xtype: 'displayfield',
                    ui: 'left-panel-title-ui',
                    margin: '11 0 0 8',
                    flex: 1,
                    bind: {
                        value: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.Title}'
                    }

                },
                {
                    xtype: 'button',
                    ui: 'ne-button',
                    iconCls: 'ne-button',
                    reference: 'ne-filetype-menubutton',
                    margin: '11 10 10 0',
                    //width: 40,
                    bind: {
                        tooltip: '{backupButtonTooltip}',
                        text: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.BackupTooltip}',
                        disabled: '{!shouldEnableBackupButton}'
                    },
                    menu: {
                        reference: 'neFileTypesMenu',
                        defaults: {
                            handler: 'selectBackupMenuItem',
                            cls: 'backup-menu-item',
                            // setting plain=true - fixes at align problem but creates item selection problem
                            //plain: true, 
                            //overCls: 'backup-menu-item-hover'
                            //docked: 'left',
                            //margin: 5,
                            //padding: 10
                        },
                        items: {},
                        layout: { type: 'vbox', align: 'stretch' }

                        // items: [{
                        //         bind: {
                        //             text: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.Startup}'
                        //         },
                        //         handler: 'selectBackupMenuItem'

                        //     },
                        //     {
                        //         bind: {
                        //             text: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.Running}'
                        //         },
                        //         handler: 'selectBackupMenuItem'

                        //     }
                        // ],
                    }

                }
            ]
        },
        {
            xtype: 'panel',
            ui: 'left-panel-inner-panel',
            flex: 1,
            itemId: 'innerPanel',
            padding: 10,
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [


                {
                    xtype: 'textfield',
                    margin: '15 15 5 15',
                    ui: 'settings-text',
                    cls: 'searchField',
                    itemId: 'leftSearch',
                    enableKeyEvents: true,

                    triggers: {
                        removeTrigger: {
                            cls: 'fa-remove',
                            hidden: true,
                            triggerType: 'remove',
                            handler: function() {
                                this.setValue('');
                                this.up('backup-restore-view').getController().getNetworkElements();
                            }
                        },
                        searchTrigger: {
                            cls: 'fa-search',
                            triggerType: 'search',
                            handler: function() {
                                this.up('backup-restore-view').getController().getNetworkElements();
                            }
                        }
                    },
                    bind: {
                        value: '{neSearchText}',
                        emptyText: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.SearchEmptyText}'

                    },
                    listeners: {
                        keypress: function(txt, event) {
                            if (event.getKey() == event.ENTER)
                                this.up('backup-restore-view').getController().getNetworkElements();
                        }
                    }
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [{
                            xtype: 'checkboxfield',
                            boxLabel: 'Select All',
                            margin: '5 10 5 17',
                            flex: 1,
                            cls: 'checkButton',
                            listeners: {
                                change: function(cb, selected) {
                                    var grid = this.up('network-elements-view').down('#ne-grid');
                                    if (selected) {
                                        grid.getSelectionModel().selectAll();
                                    } else {
                                        grid.getSelectionModel().deselectAll();
                                    }
                                }
                            },
                            bind: {
                                boxLabel: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.SelectAll}',
                                value: '{selectAll}'

                            }
                        },
                        {
                            xtype: 'displayfield',
                            flex: 1,
                            margin: '5 0 0 0',
                            ui: 'left-panel-status-ui',
                            bind: {
                                value: '{resultStatus}'
                            }

                        }
                    ]
                },
                {
                    xtype: "multiselection-gridpanel",
                    ui: 'ne-panel',
                    cls: 'ne-panel',
                    itemId: 'ne-grid',
                    id: 'ne-grid',
                    padding: 10,
                    flex: 1,
                    plugins: [{
                        ptype: 'tooltips',
                        anchor: 'top',
                        ui: 'tooltipui'
                    }],
                    forceFit: true,
                    hideHeaders: true,

                    selModel: {
                        selType: 'checkboxmodel',
                        mode: 'MULTI'
                    },


                    rowLines: false,
                    bind: {
                        multiSelection: '{selectedNetworkElements}',
                        store: '{network_elements_store}'
                    },
                    viewConfig: {
                        loadMask: false,
                        stripeRows: true,
                        loadingCls: '',
                    },
                    listeners: {
                        // selectionchange: 'selectedNetworkElementsChanged'
                    },
                    columns: []
                }
            ]
        }
    ],

    onBoxReady: function() {
        var me = this,
            view = me.up('backup-restore-view'),
            vm = view.getViewModel(),
            grid = me.down('#ne-grid'),
            controller = view.getController(),
            trigger = me.down('#leftSearch').getTriggers().removeTrigger;

        controller.initNetworkElementsView(grid);

        controller.onActivated();

        vm.bind('{neSearchText}', function(newValue, oldValue) {
            if (Ext.isDefined(oldValue)) {
                if (!Ext.isEmpty(newValue))
                    trigger.show()
                else
                    trigger.hide();
            }
        });
    }


});