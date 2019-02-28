Ext.define('ConfigurationFilesClient.view.AddNEsWindow', {
    extend: 'ExtCore.ux.Dialog',
    xtype: 'add-nes-window',

    closeable: true,
    clickOutside: true,
    draggable: true,
    config: {
        constrain: true,
    },
    liveDrag: true,
    resizable: true,
    modal: true,
    maximizable: true,
    header: true,
    layout: 'fit',
    closeAction: 'destroy',
    title:'Add NEs',
    controller: 'add-nes-window-view-controller',
    viewModel: 'add-nes-window-view',

    onBoxReady: function () {
        var me = this;
        var gridPanel = me.down('gridpanel');

        var NEStore = Ext.create('ConfigurationFilesClient.store.NetworkElementsStore', {

        });


        var displayProjection = MetadataClassService.getProjectionWithAttributesDefinitions('BCAPI:CFM.CFMNEScriptMapping', 'Display');
        // var count = Math.min(2, displayProjection.AttributeRef.length);
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

        gridPanel.reconfigure(null, columns);

        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        var searchProjection = MetadataClassService.getProjectionWithAttributesDefinitions('BCAPI:CFM.CFMNEScriptMapping', 'Criteria');
        var entFilters = _.map(searchProjection.AttributeRef, function (attr) {
            return { id: 'CONFIG|' + attr.name, label: attr.label, input: "text", validation: { allow_empty_value: false } };
        });
        var controller = me.getController();
        var operators = controller.getOperators();
        var drawheight = Ext.getBody().getViewSize().height * 0.8 - 50;

        me.items = [
            {
                xtype: 'panel',
                layout: {
                    type: 'hbox',
                    pack: 'start',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'panel',
                        flex: 1,
                        //ui: 'helixui-grid-or-tree-type-A',
                        margin: 10,

                        header: {
                            xtype: 'header',
                            cls: 'AddNesHeader',
                            titlePosition: 2,
                            margin: '15 0 20 0',
                            title: {
                                xtype: 'title',
                                margin: '0 0 0 20',
                                text: 'Search NEs',
                                cls: 'AddNesHeader'
                            },
                            items: [
                                {
                                    xtype: 'image',
                                    cls: 'red-circle-icon'
                                },
                                {
                                    xtype: 'container',
                                    html: '<span class="red-circle-text">1</span>',
                                    margin: '0 0 0 -20'
                                }
                            ]
                        },
                        scrollable: 'y',
                        layout: 'fit',
                        itemId: 'rule-panel',
                        items: [
                            {
                                xtype: 'query-builder',
                                ui: 'query-builder-white',
                                watermark: 'Select criteria',
                                attributes: entFilters,
                                operators: operators,
                            }
                        ],
                        bbar: ['->',
                            {
                                xtype: 'button',
                                text: 'Search',
                                ui: 'red-button-border-radius',

                                handler: 'searchInstances',
                                listeners: {
                                    afterrender: function (c) {
                                        Ext.create('Ext.tip.ToolTip', {
                                            target: c.getEl(),
                                            html:'Search'
                                        });
                                    }
                                },
                                // bind: {
                                //     disabled: '{entityIsEmpty}'
                                // }
                            }
                        ]
                    },
                    {
                        xtype: 'draw',
                        renderTo: document.body,
                        width: 8,
                        height: drawheight - 50,
                        sprites: [
                            {

                                type: 'path',
                                path: Ext.String.format('M5,10 L5,{0}', drawheight),
                                stroke: '#4D4D4D'
                            }
                        ]
                    },
                    {
                        xtype: 'panel',
                        flex: 2,
                        header: {
                            xtype: 'header',
                            titlePosition: 2,
                            cls: 'AddNesHeader',
                            margin: '15 0 0 0',
                            title: {
                                xtype: 'title',
                                margin: '0 0 0 20',
                                text: 'Add Selected NEs',
                                cls: 'AddNesHeader'
                            },
                            items: [
                                {
                                    xtype: 'image',
                                    cls: 'red-circle-icon'
                                },
                                {
                                    xtype: 'container',
                                    html: '<span class="red-circle-text">2</span>',
                                    margin: '0 0 0 -20'
                                }
                            ]
                        },
                        margin: 10,
                        layout: 'fit',
                        // ui: 'helixui-grid-or-tree-type-A',
                        // bind: {
                        //     hidden: '{matchedInstances}'
                        // },
                        items: [
                            {
                                xtype: 'gridpanel',
                                layout: 'fit',
                                //store: Ext.data.StoreManager.lookup('network_elements_store'),
                                dataIndex: 'ObjectId',
                                cls:'grid-cls',
                                plugins: [
                                    'tooltips',
                                    {
                                        ptype: 'gridfilters',
                                        onCheckChange: function (menu, value) {
                                            // Locking grids must lookup the correct grid.
                                            var parentTable = this.isLocked ? item.up('tablepanel') : this.grid,
                                                filter = this.getMenuFilter(parentTable.headerCt);
                                            filter.setActive(value);

                                            if (value === false && filter instanceof Ext.grid.filters.filter.String)
                                                filter.setValue('');
                                        }
                                    }],
                                //flex: 2,
                                bind: {
                                    store: '{network_elements_filtered_store}',
                                    selection:'{selectedNetworkElements}'
                                },
                                autoScroll: true,
                                forceFit: true,
                                // columns: [
                                //     { text: 'NE Name', dataIndex: 'Name', flex: 2 },
                                //     { text: 'NE Type', dataIndex: 'Type', flex: 1 },
                                //     { text: 'Vendor', dataIndex: 'Vendor', flex: 1 },
                                //     { text: 'IP Adress', dataIndex: 'IpAdress', flex: 1 }
                                // ],
                                itemId: 'AddNEsgrid',
                                //ui: 'helixui-grid-or-tree-type-A',
                                //cls:'grid-cls',
                                //margin: '-10 0 0 0',
                                // viewConfig: {
                                //     loadMask: false,
                                //     stripeRows: true
                                // },

                                selModel: {
                                    selType: 'checkboxmodel'
                                },
                                rowLines: false,



                                //bufferedRenderer: false,
                                scrollable: 'y',
                                //reserveScrollbar: false,


                            }
                        ],
                        bbar: [
                            '->',
                            {
                                xtype: 'button',
                                text: 'Add Selected',
                                ui: 'red-button-border-radius',
                                handler: 'AddSelected',
                                listeners: {
                                    afterrender: function (c) {
                                        Ext.create('Ext.tip.ToolTip', {
                                            target: c.getEl(),
                                            html:'Add Selected'
                                        });
                                    }
                                },
                                bind:{
                                    disabled:'{!areNetworkElementsSelected}'
                                }

                            }
                        ]
                    },


                ]
            }
        ],
            me.callParent(arguments);

    }

});