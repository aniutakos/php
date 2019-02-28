Ext.define('ConfigurationFilesClient.view.JobDetailsContainerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job-details-container-view-model',

    data: {
        selectedJob: null,
        isNew:false,
    },

    formulas: {
        isAdmin: {
            get: function (data) {
                return AuthorizationProvider.canAct('manage-jobs');                  
            }
        },
        messageTextCard: {
            bind: {
                navigatorGridSelection: '{navigatorGridSelection}',
                noJobSelectedMessage: '{resources.ConfigurationFilesClient.JobDetailsContainerView.noJobSelectedMessage}',
                multipleJobsSelectedMessage:'{resources.ConfigurationFilesClient.JobDetailsContainerView.multipleJobsSelectedMessage}'
            },
            get: function (data) {
                if (!data.navigatorGridSelection || data.navigatorGridSelection.length == 0) {
                        return data.noJobSelectedMessage;
                }
                else{
                    return data.multipleJobsSelectedMessage;
                }
            }
        },
    },
});