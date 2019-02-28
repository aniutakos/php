Ext.define('ConfigurationFilesClient.view.JobsViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.jobs-view-model',

    data: {
        navigatorGridSelection: null,
        cardMessageTextId:'messageCard-' + UuidGenerator.getUuIDValid()
    },

    formulas: {
        numberOfSelectedJobs: {
            bind: {
                navigatorGridSelection: '{navigatorGridSelection}',
            },
            get: function (data) {
                if (data.navigatorGridSelection) {
                    return data.navigatorGridSelection.length ;
                }
                return 0;
            }
        }
    }

});