/**
 * Created by igors on 08/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.JobsView', {
    extend: 'Ext.panel.Panel',
    xtype: 'jobs-view',
    requires: [
        'Ext.resizer.Splitter'
    ],

    viewModel:'jobs-view-model',
    controller:'Jobs-view-controller',
    //title: 'Jobs',
    bind: {
        title: '{resources.ConfigurationFilesClient.JobsView.Title}'
    },

    layout: {
        type: 'hbox',
        align: 'stretch',
        //padding: 5
    },

    onBoxReady: function() {
        // var me = this;
        // var vm = me.getViewModel();

        // var cardMessageTextId = 'messageCard-' + UuidGenerator.getUuIDValid();

        // vm.set('cardMessageTextId',cardMessageTextId);  
    },
    items: [{
        xtype: 'jobs-list-navigator-view',
        //width: 220,
        flex: 1,
        autoScroll: true,
        bind: {
            title: '{resources.ConfigurationFilesClient.JobsView.JobsListNavigatorView.Title}'
        }
    }, {
        xtype: 'splitter'
    }, {
        xtype: 'job-details-container-view',
        flex: 3,
        autoScroll: true
    }]
});
