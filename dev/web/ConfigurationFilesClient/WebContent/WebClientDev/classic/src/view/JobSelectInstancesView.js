Ext.define('ConfigurationFilesClient.view.JobSelectInstancesView', {
    extend: 'Ext.panel.Panel',
    xtype: 'job-select-instances-view',
    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },
    controller: 'job-select-instances-view-controller',
    viewModel: 'job-select-instances-view-model',

    onBoxReady: function () {
        var me = this;
        var vm = me.getViewModel();
        //var cardId = me.up('job-details-view').id;
        var gridPanel = me.down('gridpanel');
        me.getController().setNesGridData(vm.get('NeList'),vm.get('configurationFileType'));
    },

    initComponent: function () {
        var me = this;
        var displayProjection = MetadataClassService.getProjectionWithAttributesDefinitions('BCAPI:CFM.CFMNEScriptMapping', 'Display');

        // var count = Math.min(2, displayProjection.AttributeRef.length);
        
        // var columns = _.map(displayProjection.AttributeRef, function (column) {
        //     return { text: column.label, dataIndex: column.name, tooltipFormatFn: me.getToolTip };
        // });
        var columns = _.map(displayProjection.AttributeRef, function (column) {
            var resCol = { text: column.label, dataIndex: column.name, tooltipFormatFn: me.getToolTip };
            switch (column.type) {
                case 'string':
                    resCol.filter = { type: 'string' };
                    break;
                case 'dateTime':
                    resCol.filter = { type: 'date' };
                    resCol.xtype = 'datecolumn';
                    resCol.format = 'd/m/Y H:i';
                    resCol.tooltipFormatFn = me.gridTooltipFormatFn;
                    break;
            }
            return resCol;
        });
        me.items = [
            {
                xtype: 'container',

                flex: 0.5,
                minHeight: 50,
                items: [
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch',
                        },
                        defaults: {
                            margin: '5 5 5 0'
                        },
                        items: [
                            {
                                xtype: 'button',
                                ui: 'jobs-toolbar-button',
                                iconCls: 'job-add-ne-icon',
                                // plugins: {
                                //     ptype: 'authorization',
                                //     actions: [
                                //         'manage-jobs'
                                //     ],
                                //     effect: 'disable'
                                // },
                                listeners: {
                                    afterrender: function (c) {
                                        Ext.create('Ext.tip.ToolTip', {
                                            target: c.getEl(),
                                            viewModel: c.up('job-definition-panel').getViewModel(),
                                            bind: {
                                                html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.AddNesText}',
                                            }
                                        });
                                    }
                                },
                                handler: function () {
                                    var window = Ext.ComponentQuery.query('add-nes-window')[0];
                                    var vm = this.getViewModel();
                                    if (window) {
                                        window.destroy();
                                    }
                                    window = Ext.create('ConfigurationFilesClient.view.AddNEsWindow', {});
                                    window.center();
                                    window.show();
                                },
                                bind: {
                                    text: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.AddNesText}'
                                }
                            },
                            {
                                xtype: 'button',
                                iconCls: 'delete-file-icon',
                                // plugins: {
                                //     ptype: 'authorization',
                                //     actions: [
                                //         'manage-jobs'
                                //     ],
                                //     effect: 'disable'
                                // },
                                bind: {
                                    disabled: '{isDeleteNesButtonDisabled}'
                                },
                                ui: 'jobs-toolbar-button',
                                listeners: {
                                    afterrender: function (c) {
                                        Ext.create('Ext.tip.ToolTip', {
                                            target: c.getEl(),
                                            viewModel: c.up('job-definition-panel').getViewModel(),
                                            bind: {
                                                html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.Delete}',
                                            }
                                        });
                                    }
                                },
                                handler: function () {
                                    var me = this;
                                    var grid = me.up('job-definition-panel').down('gridpanel[name=gridpanelSelectInstances]');
                                    //var grid = me.up('job-definition-panel').down('gridpanel');

                                    grid.getStore().remove(grid.getSelection());
                                    if (grid.getStore().getData().items.length == 0) {
                                        me.up('job-definition-panel').getViewModel().set('isNesNumberPositive', false);
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'gridpanel',
                flex: 3,
                name: 'gridpanelSelectInstances',
                //id:'gridPanelSelectInstance',
                selModel: Ext.create('Ext.selection.CheckboxModel', {}),
                dataIndex: 'ObjectId',
                store: Ext.create('Ext.data.Store', { id: UuidGenerator.getUuID() }),
                columns: columns,
                bind: {
                    selection: '{selectInstancesGridSelection}'
                },
                plugins: ['gridfilters', 'tooltips'],
                autoScroll: true,
                forceFit: true,
            }
        ];
        me.callParent(arguments);

    }
    //   items:[
    //     {
    //         xtype: 'container',

    //         flex: 1,
    //         items: [
    //             {
    //                 xtype: 'container',
    //                 layout: {
    //                     type: 'hbox',
    //                     align: 'stretch',
    //                 },
    //                 defaults: {
    //                     margin: '5 5 5 0'
    //                 },
    //                 items:[
    //                     {
    //                         xtype: 'button',
    //                         ui: 'jobs-toolbar-button',
    //                         iconCls: 'job-add-ne-icon',
    //                         // plugins: {
    //                         //     ptype: 'authorization',
    //                         //     actions: [
    //                         //         'manage-jobs'
    //                         //     ],
    //                         //     effect: 'disable'
    //                         // },
    //                         listeners: {
    //                             afterrender: function(c) {
    //                                 Ext.create('Ext.tip.ToolTip', {
    //                                     target: c.getEl(),
    //                                     viewModel: c.up('job-definition-panel').getViewModel(),
    //                                     bind: {
    //                                         html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.AddNesText}',                            
    //                                     }
    //                                 });
    //                             }
    //                         },
    //                         handler:function(){
    //                             var window = Ext.ComponentQuery.query('add-nes-window')[0];
    //                             var vm = this.getViewModel();
    //                             if (!window) {
    //                                 window = Ext.create('ConfigurationFilesClient.view.AddNEsWindow', {});
    //                             }
    //                             window.center();
    //                             window.show();
    //                         },
    //                         bind: {
    //                             text: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.AddNesText}'
    //                         }
    //                     },
    //                     {
    //                         xtype: 'button',
    //                         iconCls: 'delete-file-icon',
    //                         // plugins: {
    //                         //     ptype: 'authorization',
    //                         //     actions: [
    //                         //         'manage-jobs'
    //                         //     ],
    //                         //     effect: 'disable'
    //                         // },
    //                         bind:{
    //                             disabled:'{isDeleteNesButtonDisabled}'
    //                         },
    //                         ui: 'jobs-toolbar-button',
    //                         listeners: {
    //                             afterrender: function(c) {
    //                                 Ext.create('Ext.tip.ToolTip', {
    //                                     target: c.getEl(),
    //                                     viewModel: c.up('job-definition-panel').getViewModel(),
    //                                     bind: {
    //                                         html: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.Delete}',                            
    //                                     }
    //                                 });
    //                             }
    //                         },
    //                         handler: function () {
    //                             var me = this;
    //                             var grid = me.up('job-definition-panel').down('gridpanel[name=gridpanelSelectInstances]');
    //                             //var grid = me.up('job-definition-panel').down('gridpanel');

    //                             grid.getStore().remove(grid.getSelection());
    //                             if(grid.getStore().getData().items.length == 0){
    //                                 me.up('job-definition-panel').getViewModel().set('isNesNumberPositive',false);
    //                             }
    //                         }
    //                     }
    //                 ]
    //             }
    //         ]
    //     },
    //     {
    //         xtype: 'gridpanel',
    //         flex: 3,
    //         name:'gridpanelSelectInstances',
    //         //id:'gridPanelSelectInstance',
    //         selModel: Ext.create('Ext.selection.CheckboxModel', {}),
    //         dataIndex: 'ObjectId',
    //         //store: Ext.create('Ext.data.Store', {              }),
    //         //columns:columns,
    //         bind:{
    //             selection:'{selectInstancesGridSelection}'
    //         },
    //         plugins: ['gridfilters', 'tooltips'],
    //         autoScroll: true,
    //         forceFit: true,
    //     }
    // ]

});