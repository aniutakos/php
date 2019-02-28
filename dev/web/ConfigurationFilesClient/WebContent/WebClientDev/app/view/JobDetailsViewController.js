Ext.define('ConfigurationFilesClient.view.JobDetailsViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.job-details-view-controller',

    initializeState: function () {
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionVM = jobDefinition.getViewModel();
        var state = {
            configurationFileType: jobDefinitionVM.get('configurationFileType'),
            //enabled: view.query('toggle-switch')[0].getValue() ? true : false,
            enabled: vm.get('jobActivity') ? true : false,
            description: jobDefinitionVM.get('description'),
            selectedNEs: vm.get('NeList'),
            schedule:me.getJobSchedule()            
        };
        if(jobDefinitionVM.get('isSelectInstances')){
            var neList = jobDefinitionVM.get('NeList');
            var neListSorted = JSON.parse("[" + neList + "]").sort();
            state.selectedNEs ={"neList": neListSorted.toString(),"neCriteria":null};
            //var neCriteria = view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery());
            //state.selectedNEs = {"neList": null,"neCriteria":neCriteria};

        }
        else{
           // state.selectedNEs = {"neList": null,"neCriteria":view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery())}
         state.selectedNEs = {"neList": null,"neCriteria":me.getDyamicRuleQuery()};
//var neCriteria = view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery());
            //state.selectedNEs = {"neList": null,"neCriteria":neCriteria};

        }
        vm.set('initialState',state);
    },

    initCriteria: function(){
        var me = this;
        var view =  me.getView();
        var vm = view.getViewModel();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionVM = jobDefinition.getViewModel();
        if(!view.stateInitFinished){
            var state = vm.get('initialState');
            state.selectedNEs =me.getSelectedNes();
            view.stateInitFinished = true;
            if(jobDefinitionVM.get('isDynamicRule')){
                state.selectedNEs ={"neList": null,"neCriteria":me.getDyamicRuleQuery()};
                //state.selectedNEs = view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery());
                //var neCriteria = view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery());
                //state.selectedNEs = {"neList": null,"neCriteria":neCriteria};

            }
        }
        
       
    },

    getCurrentState : function(){
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionVM = jobDefinition.getViewModel();
        var state = {
            configurationFileType: jobDefinitionVM.get('configurationFileType'),
            enabled: view.query('toggle-switch')[0].getValue() ? true : false,
            description: jobDefinitionVM.get('description'),
            selectedNEs: me.getSelectedNes() ,          
            schedule:me.getJobSchedule()
        };
        if(jobDefinitionVM.get('isDynamicRule')){
            state.selectedNEs ={"neList": null,"neCriteria":me.getDyamicRuleQuery()};
            //var neCriteria = view.up('job-details-container-view').getController().convertFilter(me.getDyamicRuleQuery());
            //state.selectedNEs = {"neList": null,"neCriteria":neCriteria};
        }
        return state;
    },

    isJobChanged: function(){
        var me = this;
        var view = me.getView();
        var vm = view.getViewModel();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionViewModel = jobDefinition.getViewModel();
       
        var initState = vm.get('initialState');
        var currentState = me.getCurrentState();

        var jobNotChanged =  JSON.stringify(initState).replace(/"null"/g, "null") == JSON.stringify(currentState).replace(/"null"/g, "null");

        if(jobDefinitionViewModel.get("isSelectInstances")){
            var storeFinishedToLoad = jobDefinition.down('gridpanel[name=gridpanelSelectInstances]').getStore().isLoaded();
            if(!storeFinishedToLoad){
                jobNotChanged = true;
            }
        }
        var message = !jobNotChanged ? LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.JobDetailsContainerView.saveJobMessage') :"";

                if(jobDefinitionViewModel.get("isSelectInstances") && jobDefinitionViewModel.get('ExistDeletedNes')){
                    jobNotChanged = false;
                    message = "Changes found in the job details.<BR>"+
                   "Some of the job's network elements were deleted from the configuration model.<BR>"+
                    "Do you want to save the job details?";
                }
        return {value:!jobNotChanged , message:message}; 
        
    },

    getSelectedNes: function () {
        var me = this;
        var view = me.getView();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionViewModel = jobDefinition.getViewModel();
        //var selectNesType = view.down('radiogroup[name=SelectedNEsRadio]').getValue();
        var selectNesType = jobDefinitionViewModel.get('isDynamicRule') ? 'DynamicRule' : (jobDefinitionViewModel.get('isSelectInstances') ? 'SelectInstances' : null);
        var result = { "neList": null, "neCriteria": null };

        if (selectNesType == "DynamicRule") {
            //var gridpanel = view.down('gridpanel[name=gridpanelDynamicRule]');


            result.neCriteria = me.getDyamicRuleQuery();

            return result;
        } else if (selectNesType == "SelectInstances") {
            var gridpanel = jobDefinition.down('gridpanel[name=gridpanelSelectInstances]');
            var gridpanelStore = gridpanel.getStore();
            var neList = [];
            gridpanelStore.data.each(function (item, index, totalItems) {
                neList.push(item.data.ObjectId);
            });
            var sortedNeList = neList.sort()
            result.neList = neList.toString();

            return result;
        } else {
            return result;
        }
    },
    setSelectedNes: function (selectedNE) {
        var me = this;
        var view = me.getView();
        var jobDefinition = view.down('job-definition-panel');
        var jobDefinitionViewModel = jobDefinition.getViewModel();
        if (selectedNE.neCriteria) {
            //if (true) {
            jobDefinitionViewModel.set('isDynamicRule', true);
            jobDefinitionViewModel.set('NeCriteria', selectedNE.neCriteria);
            var expression = selectedNE.neCriteria;
            expression = me.removeFileConfigurationFromFilter(expression);
            jobDefinitionViewModel.set('NeCriteria', expression);

            // var queryRules = me.convertFilter(expression);
            // var query = jobDefinition.down('query-builder');
            // query.setRules(queryRules);

        } else if (selectedNE.neList) {
            jobDefinitionViewModel.set('isSelectInstances', true);
            jobDefinitionViewModel.set('NeList', selectedNE.neList);
        }
    },

    getDyamicRuleQuery: function () {
        var me = this;
        var view = me.getView();
        var definitionView = view.down('job-definition-panel');
        var dynamicView = definitionView.down('job-dynamic-rule-view');
        var dynamicViewController = dynamicView.getController();
        return dynamicViewController.getQueryFilter();
    },

    removeFileConfigurationFromFilter: function (expression) {
        if (expression.expression.operator.operand2) {
            return expression.expression.operator.operand2;
        } else {
            return null;
        }
    },

    getJobSchedule: function () { // if job name is not given , takes the current active card
        var me = this;
        var view = me.getView();
        var schedule = '';
        var scheduleView = view.down('job-schedule-panel');

        var vm = scheduleView.getViewModel();
        var scheduleType = vm.get('ScheduleType');
        var startTime = '';
        var every = 0;
        var interval = 0;
        var iterationNum = 0;
        var iterationEnd = null;
        var noEndDate = false;
        switch (scheduleType) {
            case 0:
                startTime = Ext.Date.format(vm.data.onceDateTimeValue, "m/d/Y H:i:s");
                schedule = { "startAt": { "dateTimeValue": startTime, "format": "MM/dd/yyyy HH:mm:ss" }, "recurring": null };
                break;
            case 1:
                every = vm.get('recurringEveryValue');
                interval = vm.get('recurringIntervalValueAsString');
                startTime = Ext.Date.format(vm.get('startDateTimeValue'), "m/d/Y H:i:s");
                if (vm.data.endRadioEndAfter) {
                    iterationNum = vm.get('endAfterOccurancesValue');
                } else if (vm.data.endRadioEndBy) {
                    iterationEnd = { "dateTimeValue": Ext.Date.format(vm.data.endByTimeDateValue, "m/d/Y H:i:s"), "format": "MM/dd/yyyy HH:mm:ss" }
                    iterationNum = null;

                }
                else {
                    noEndDate = true;
                }
                schedule = {
                    "startAt": { "dateTimeValue": startTime, "format": "MM/dd/yyyy HH:mm:ss" },
                    "recurring": { "iterationLimit": { "iterationNum": iterationNum, "iterationEnd": iterationEnd }, "interval": { "simple": { "every": every, "timeUnits": interval }, "weekly": null, "monthly": null, "yearly": null } }
                };
                if (noEndDate) {
                    schedule.recurring.iterationLimit = null;
                }

                break;
            case 2:
                var days = vm.get('daysSelected');
                startTime = Ext.Date.format(vm.data.startDateTimeValue, "m/d/Y H:i:s");
                if (vm.get('endRadioEndAfter')) {
                    iterationNum = vm.get('endAfterOccurancesValue');
                } else if (vm.get('endRadioEndBy')) {
                    iterationEnd = { "dateTimeValue": Ext.Date.format(vm.data.endByTimeDateValue, "m/d/Y H:i:s"), "format": "MM/dd/yyyy HH:mm:ss" };
                    iterationNum = null;
                }
                else {
                    noEndDate = true;
                }
                schedule = {
                    "startAt": { "dateTimeValue": startTime, "format": "MM/dd/yyyy HH:mm:ss" },
                    "recurring": { "iterationLimit": { "iterationNum": iterationNum, "iterationEnd": iterationEnd }, "interval": { "simple": null, "weekly": { 'day': days }, "monthly": null, "yearly": null } }
                };
                if (noEndDate) {
                    schedule.recurring.iterationLimit = null;
                }

                break;
        }
        return schedule;
    },
    setJobSchedule: function (schedule) {
        var me = this;
        var view = me.getView();
        var scheduleView = view.down('job-schedule-panel');

        var scheduleViewModel = scheduleView.getViewModel();
        if (!schedule.recurring) { // once option
            scheduleViewModel.set('ScheduleType', ScheduleTypeValues.ONCE);
            scheduleViewModel.set('onceDateTimeValue', Ext.Date.parse(schedule.startAt.dateTimeValue, 'm/d/Y H:i:s'));
        } else if (schedule.recurring.interval.simple) { // every x time
            scheduleViewModel.set('ScheduleType', ScheduleTypeValues.RECURRING);
            scheduleViewModel.set('startDateTimeValue', Ext.Date.parse(schedule.startAt.dateTimeValue, 'm/d/Y H:i:s'));
            scheduleViewModel.set('recurringEveryValue', schedule.recurring.interval.simple.every);
            scheduleViewModel.set('recurringIntervalValue', me.fromStringToDate(schedule.recurring.interval.simple.timeUnits));
            me.setEndDate(schedule.recurring.iterationLimit);
        } else if (schedule.recurring.interval.weekly) { // weekly
            scheduleViewModel.set('ScheduleType', ScheduleTypeValues.DAYOFWEEK);
            scheduleViewModel.set('startDateTimeValue', Ext.Date.parse(schedule.startAt.dateTimeValue, 'm/d/Y H:i:s'));
            //      "recurring":{"iterationLimit":{"iterationNum":20,"iterationEnd":null},"interval":{"simple":null,"weekly":{"day":["SU","WE","TH"]},"monthly":null,"yearly":null}}}}
            scheduleViewModel.set('daysSelected', schedule.recurring.interval.weekly.day);
            me.setEndDate(schedule.recurring.iterationLimit);
        }
    },

    setEndDate: function(iterationLimit) {
        if(!iterationLimit){
            return;
        }
        var me = this;
        var view = me.getView();
        //var scheduleView = view.getLayout().getActiveItem().down('job-schedule-panel');
        var scheduleView = view.down('job-schedule-panel');
        var scheduleViewModel = scheduleView.getViewModel();
        if (iterationLimit.iterationNum) {
            scheduleViewModel.set('endRadioEndAfter', true);
            scheduleViewModel.set('endAfterOccurancesValue', iterationLimit.iterationNum);
        } else if (iterationLimit.iterationEnd) {
            scheduleViewModel.set('endRadioEndBy', true);
            scheduleViewModel.set('endByTimeDateValue', Ext.Date.parse(iterationLimit.iterationEnd.dateTimeValue, 'm/d/Y H:i:s'));
        }
    },

    fromStringToDate: function(dateAsString) {
        var result = 0;
        switch (dateAsString) {
            case 'MINUTES':
                result = 0;
                break;
            case 'HOURS':
                result = 1;
                break;
            case 'DAYS':
                result = 2;
                break;
            case 'WEEKS':
                result = 3;
                break;
            case 'MONTHS':
                result = 4;
                break;
            case 'YEARS':
                result = 5;
                break;
        }
        return result;
    },

});