/**
 * Created by igors on 08/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.JobDetailsView', {
    extend: 'Ext.tab.Panel',
    xtype: 'job-details-view',
    ui: 'jobs-tabs-ui',
    controller: 'job-details-view-controller',
    viewModel: 'job-details-view-model',

    requires: [
    ],
    layout: 'fit',

    onBoxReady: function () {
        var me = this;
        me.getController().initializeState();
    },
    tabBar: {
        items: [{
            xtype: 'tbfill'
        },
        {
            xtype: 'toggle-switch',
            cls: 'active-job-toggle',
            bind: {
                value: '{jobActivity}',
                disabled: '{!isAdmin}'
            }
        },
        {
            xtype: 'displayfield',
            //value:'Active',
            fieldCls: 'ActiveJobTitleCls',

            bind: {
                value: '{jobActivityText}'
            },
        },
        {
            xtype: 'button',
            ui: 'red-button-border-radius',
            iconCls: 'save-job-icon',
            text: 'Save Job',
            handler: function () {
                var me = this;
                var cardContainer = this.up('job-details-container-view');
                var cardContainerController = cardContainer.getController();
                var vm = cardContainer.getViewModel();
                var isNew = vm.get('isNew');
                cardContainerController.saveJob();
            },
            plugins: {
                ptype: 'authorization',
                actions: [
                    'manage-jobs'
                ],
                effect: 'disable'
            }
        }]
    },
    items: [
        {
            //title: "Job Definition",
            xtype: 'job-definition-panel'
        },
        {
            //title: "Job Schedule",
            xtype: 'job-schedule-panel'
        }

    ]


});