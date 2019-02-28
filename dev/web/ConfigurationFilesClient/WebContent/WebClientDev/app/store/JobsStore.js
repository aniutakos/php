Ext.define('ConfigurationFilesClient.store.JobsStore', {
    extend: 'Ext.data.Store',
    alias: 'store.jobsStore',
    //id:'jobsStore',
    requires: [
        'ExtCore.util.JCoreProxy'
    ],
    listeners: {
        beforeload: function (store, operation, eOpts) {
           // store.getProxy().jsonData = null;
        }
    },

    sorters: [{
        transform: function(item) {
            return item.toLowerCase();
        },
        property: 'name',
        direction: 'ASC' // or 'ASC'
    }],
    
    autoLoad : true,

    proxy: {
        type: 'jcore',
        interconnectPointName: 'ConfigurationFilesClient:CFMGenericService',
        url: '/getScheduledJobs',
        actionMethods: {
            read   : 'POST'
        },
        reader: {
            type: 'json',
            transform:{
                fn: function (data) {
                    var results = [];
                    if(!Ext.isEmpty(data.jobs)) {
                        var columns = data.jobs;
                        Ext.Array.each(data.jobs.job, function (obj) {
                            var result = obj.job;
                            result.schedule = obj.schedule;
                            results.push(result);
                        });
                    }

                    return results;
                }
            }
        }
    }
});

