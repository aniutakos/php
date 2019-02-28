Ext.define('ConfigurationFilesClient.view.JobDynamicRuleViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job-dynamic-rule-view',

    data: {
        neSearchText: '',
        selectAll: false,
        selectedNetworkElements: null,
        resultStatus: ''
    },

    // constructor: function() {
    //     var me = this;
    //     me.callParent(arguments);

    //     me.bind('{selectedNetworkElements}', function(selectedNes) {

    //         var areNetworkElementsSelected = !Ext.isEmpty(selectedNes);
    //         if (!areNetworkElementsSelected)
    //             return;

    //         var store = me.getStore('fileTypesPerNesStore');
    //         store.load(function(records, operation, success) {
    //             if (!success) {
    //                 console.warn('failed to load records for fileTypesPerNesStore.');
    //             }
    //         });
    //     })
    // },
    formulas: {

        areNetworkElementsSelected: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return false;
                return true;
            }
        },

        query_params: {
            bind: {
                neSearchText: '{neSearchText}'
            },
            get: function(data) {
                var query = {
                    searchString: data.neSearchText,
                    searchProjection: "Search",
                    getValuesParameters: {
                        mdClass: 'BCAPI:CFM.CFMNEScriptMapping',
                        limit: PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'max.search.networkelemets'),
                        orderBy: 'lower(Name)'
                    }
                };
                return query;
            }
        }
    },

    stores: {
        network_elements_filtered_store: {
            type: 'networkelementsstore',
            storeId: 'network_filtered_elements_store',
            query_params: '{query_params}',
            proxy: {
                url: '/getValues'
            }
        }
    }
});