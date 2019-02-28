Ext.define('ConfigurationFilesClient.view.JobDefinitionPanelViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.job-definition-panel-view-model',

    data: {
        jobId:'',
        jobName:'',
        jobType:'Backup',
        configurationFileType:'',
        description:'',
        jobEnabled:true,
        resources: LocalizationProvider.resources,
        //SelectedNEsRadio: null,
        isDynamicRule:false,
        isSelectInstances:false,
        neSearchText: '',
        selectAll: false,
        //selectedNetworkElements: null,
        NetworkElementsSelected:null,
        resultStatus: '',
        isSavePressed:false,
        isNesNumberPositive:false,
        NeCriteria:null,
        NeList:'',
        ExistDeletedNes:false

    },


    formulas: {
        isNameEditable: {
            bind: {
                isNew: '{isNew}',
                isAdmin:'{isAdmin}'
            },
            get: function(data) {
                if (data.isNew && data.isAdmin) {
                    return true;
                }
                return false;
            }
        },

        isConfigurationFileTypeSelected: {
            bind: {
                ConfigurationFileType: '{configurationFileType}'
            },
            get: function(data) {
                if (data.ConfigurationFileType === '' || data.ConfigurationFileType === null || data.ConfigurationFileType === undefined) {
                    return false;
                }
                return true;
            }
        },
        
        isRadioDisabled:{
            bind: {
                isConfigurationFileTypeSelected: '{isConfigurationFileTypeSelected}',
                isAdmin:'{isAdmin}'
            },
            get: function(data) {
                if (!data.isConfigurationFileTypeSelected || !data.isAdmin) {
                    return true;
                }
                return false;
            }
        },
        
        jobNameLabel:{
            bind: {
                jobName: '{jobName}',
                isSavePressed:'{isSavePressed}',
                msg: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}',
                errMsg:'<span style="color: red">*</span>{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.JobNameLabel}'
            },
            get: function(data) {
                if (data.isSavePressed && (!data.jobName || data.jobName.trim() == '' ) ) {
                    return data.errMsg;
                }
                else{
                    return data.msg;
                }
            }
        },
        configFileTypeLabel:{
            bind: {
                configurationFileType: '{configurationFileType}',
                isSavePressed:'{isSavePressed}',
                msg: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.ConfigFileTypeLabel}',
                errMsg:'<span style="color: red">*</span>{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.ConfigFileTypeLabel}'
            },
            get: function(data) {
                if (data.isSavePressed && (data.configurationFileType == '' || !data.configurationFileType) ) {
                    return data.errMsg;
                }
                else{
                    return data.msg;
                }
            }
        },
        selectedNesLabel:{
            bind: {
                NeList:'{NeList}',
                isSavePressed:'{isSavePressed}',
                isDynamicRule:'{isDynamicRule}',
                isSelectInstances:'{isSelectInstances}',
                msg: '{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.selectedNEs}',
                errMsg:'<span style="color: red">*</span>{resources.ConfigurationFilesClient.JobsView.JobDefinitionPanel.selectedNEs}'
            },
            get: function(data) {
                var list = data.NeList.split(',');
                if ((data.isSelectInstances || (!data.isSelectInstances && !data.isDynamicRule)) && data.isSavePressed && (list.length == 0) ) {
                    return data.errMsg;
                }
                else{
                    return data.msg;
                }
            }
        },
        //TODO
        isNesFromGridSelected:{
            bind: {
                NetworkElementsSelected: '{NetworkElementsSelected}'
            },
            get: function(data) {
                if(!data.NetworkElementsSelected){
                    return false;
                }
               
                return true;
            }
        },
        available_file_types_query_params: {
            get: function(data) {
                return {
                    mdClass: 'BCAPI:CFM.CFMFileTypes',
                    projection: null,
                    filter: null,
                };
            }
        },
    },



    stores: {
        fileTypesStore: {
            type: 'fileTypesStore',
            query_params: '{available_file_types_query_params}',
            autoLoad: true,
        }
    },



});