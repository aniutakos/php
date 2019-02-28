Ext.define('ConfigurationFilesClient.view.JobSelectInstancesViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job-select-instances-view-model',

    data:{
        selectInstancesGridSelection:null
    },
formulas:{
    
    isDeleteNesButtonDisabled:{
        bind: {
            selectInstancesGridSelection: '{selectInstancesGridSelection}',
            isAdmin:'{isAdmin}'
        },
        get: function(data) {
            if (!data.selectInstancesGridSelection || !data.isAdmin) {
                return true;
            }
            return false;
        }
    },
}   
});