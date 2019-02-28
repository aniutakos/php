Ext.define('ConfigurationFilesClient.view.JobDetailsViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job-details-view-model',

    data:{
        jobActivity:0,
        initialState:{}
    },
    formulas: {

        jobActivityText: {
            bind: {
                jobActivity: '{jobActivity}'
            },
            get: function(data) {
                if (data.jobActivity)
                    return 'Active';
                return 'Inactive';
            }
        }
    }
});