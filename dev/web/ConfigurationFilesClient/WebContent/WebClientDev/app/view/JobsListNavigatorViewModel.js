Ext.define('ConfigurationFilesClient.view.JobsListNavigatorViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.jobs-list-navigator-view',

    data: {
    },
    formulas: {
        isAdmin: {
            get: function (data) {
                return AuthorizationProvider.canAct('manage-jobs');                  
            }
        },
        isDeleteJobsButtonDisabled: {
            bind: {
                navigatorGridSelection: '{navigatorGridSelection}',
                isAdmin: '{isAdmin}'
            },
            get: function (data) {
                if (!data.navigatorGridSelection || data.navigatorGridSelection.length == 0 || !data.isAdmin) {
                    return true;
                }
                return false;
            }
        },
    },

    stores: {
        jobs_store: {
            type: 'jobsStore',
            storeId: 'jobs_store',
        }
    }
});