/**
 * Created by igors on 08/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.JobsListNavigatorView', {
    extend: 'Ext.panel.Panel',
    xtype: 'jobs-list-navigator-view',
    // viewModel: {
    //     data: {
    //         resources: LocalizationProvider.resources
    //     }
    // },
    viewModel: 'jobs-list-navigator-view',
    controller: 'Job-list-navigator-view-controller',

    requires: [
    ],
    ui: 'left-panel-jobs-ui',
    header:false,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },


    items: [
        {
            xtype: 'displayfield',
            ui: 'left-panel-title-ui',
            flex:1,
            margin: '11 0 0 8',
            maxHeight: 40,
            bind: {
                value: '{resources.ConfigurationFilesClient.JobsView.JobsListNavigatorView.Title}'
            }
        },
        {
            xtype: 'container',
            flex:1,
            maxHeight: 40,
            layout: 'hbox',
            items: [
                {
                    xtype: 'button',
                    ui: 'jobs-navigator-toolbar-button',
                    cls: 'jobs-navigator-toolbar-button',
                    iconCls: 'add-job-icon',
                    plugins: {
                        ptype: 'authorization',
                        actions: [
                            'manage-jobs'
                        ],
                        effect: 'disable'
                    },
                    listeners: {
                        afterrender: function (c) {
                            Ext.create('Ext.tip.ToolTip', {
                                target: c.getEl(),
                                html: 'Add New Job'

                            });
                        }
                    },
                    handler: function () {
                        var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];
                        var cardContainerController = cardContainer.getController();
                        cardContainerController.openNewJobCard();
                    }
                },
                // {
                //     xtype: 'draw',
                //     cls: 'jobs-toolbar-line',
                //     bind: {
                //         hidden: '{isNoChanges}',
                //     },
                //     width: 8,
                //     height: 20,
                //     sprites: [
                //         {
                //             type: 'path',
                //             path: 'M0,-5 L0,15',
                //             stroke: '#FFFFFF',
                //         }
                //     ]
                // },
                {
                    xtype: 'button',
                    iconCls: 'delete-job-icon',
                    cls: 'jobs-navigator-toolbar-button',
                    ui: 'jobs-navigator-toolbar-button',
                    handler: 'deleteJobs',
                    bind: {
                        disabled: '{isDeleteJobsButtonDisabled}'
                    },
                    listeners: {
                        afterrender: function (c) {
                            Ext.create('Ext.tip.ToolTip', {
                                target: c.getEl(),
                                html: 'Delete Jobs'

                            });
                        }
                    },

                },

            ]
        },
        {
            xtype: 'multiselection-gridpanel',
            layout: 'fit',
            flex:7,
            id: 'jobs-grid',
            cls: 'jobs-grid',
            rowLines: false,
            //dataIndex: 'ObjectId',
            plugins: ['gridfilters', 'tooltips'],
            hideHeaders: true,

            bind: {
                store: '{jobs_store}',
                multiSelection: '{navigatorGridSelection}'
            },
            viewConfig: {
                stripeRows: true
            },
            columns: [
                { text: 'name', dataIndex: 'name', flex: 1 },
                {
                    text: 'enables',
                    dataIndex: 'enabled',
                    disabled: true,
                    hideTooltip: true,
                    flex: 0.1,
                    tooltipFormatFn: function(column, val) { 
                        //if (val.dataIndex ==) 
                        if(val){
                            return "Active"
                        }
                        return "Inactive"
                     },
                    renderer: function (value, meta, record) {
                        var val = '';
                        if (!record.data.enabled) {
                            val = '<img style="border: 0!important align:right;" align="right" class="inactive-job-icon"/>';

                        }
                        return val;
                    }
                },
            ],
            autoScroll: true,
            forceFit: true,
            selModel: {
                selType: 'checkboxmodel'
            },
            scrollable: 'y',

        }
    ]
});