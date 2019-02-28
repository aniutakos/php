Ext.define('ConfigurationFilesClient.view.JobSchedulePanelViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.jobschedulepanel',

    data: {
        resources: LocalizationProvider.resources,
        ScheduleType: ScheduleTypeValues.RECURRING,
        dayOfWeekSundaySelected: false,
        dayOfWeekMondaySelected: false,
        dayOfWeekTuesdaySelected: false,
        dayOfWeekWednesdaySelected: false,
        dayOfWeekThursdaySelected: false,
        dayOfWeekFridaySelected: false,
        dayOfWeekSaturdaySelected: false,
        onceDateTimeValue: new Date(Ext.Date.now()),
        recurringEveryValue: 1,
        recurringIntervalValue: ScheduleIntervalValues.DAYS,
        //recurringIntervalRawValue:ScheduleIntervalValues.DAYS,
        startDateTimeValue: new Date(Ext.Date.now()),
        endRadioGroupValue: true,
        endAfterOccurancesValue: 1,
        endByTimeDateValue: new Date(Ext.Date.now()),
        endRadioEndAfter:false,
        endRadioEndBy:false
    },

    formulas: {
        daysSelected:{
            bind: {
                dayOfWeekSundaySelected: '{dayOfWeekSundaySelected}',
                dayOfWeekMondaySelected: '{dayOfWeekMondaySelected}',
                dayOfWeekTuesdaySelected: '{dayOfWeekTuesdaySelected}',
                dayOfWeekWednesdaySelected: '{dayOfWeekWednesdaySelected}',
                dayOfWeekThursdaySelected: '{dayOfWeekThursdaySelected}',
                dayOfWeekFridaySelected: '{dayOfWeekFridaySelected}',
                dayOfWeekSaturdaySelected: '{dayOfWeekSaturdaySelected}',
            },
            get: function(data) {
                var result = [];
                if(data.dayOfWeekSundaySelected){
                    result.push('SU');
                }
                if(data.dayOfWeekMondaySelected){
                    result.push('MO');
                }
                if(data.dayOfWeekTuesdaySelected){
                    result.push('TU');
                }
                if(data.dayOfWeekWednesdaySelected){
                    result.push('WE');
                }
                if(data.dayOfWeekThursdaySelected){
                    result.push('TH');
                }
                if(data.dayOfWeekFridaySelected){
                    result.push('FR');
                }
                if(data.dayOfWeekSaturdaySelected){
                    result.push('SA');
                }
                return result;
            },
            set:function(data) {
                if(data){
                    var me = this;
                    for(indx in data){ 
                        var elemnt = data[indx];
                        switch(elemnt){
                            case 'SU':
                            me.set('dayOfWeekSundaySelected',true);
                            break;
                            case 'MO':
                            me.set('dayOfWeekMondaySelected',true);
                            break;
                            case 'TU':
                            me.set('dayOfWeekTuesdaySelected',true);
                            break;
                            case 'WE':
                            me.set('dayOfWeekWednesdaySelected',true);
                            break;
                            case 'TH':
                            me.set('dayOfWeekThursdaySelected',true);
                            break;
                            case 'FR':
                            me.set('dayOfWeekFridaySelected',true);
                            break;
                            case 'SA':
                            me.set('dayOfWeekSaturdaySelected',true);
                            break;
                        }
                    };
                }
                 
            }
        },
        recurringIntervalValueAsString:{
            bind: {
                recurringIntervalValue: '{recurringIntervalValue}'
            },

            get: function(data) {
                var result = '';
                switch(data.recurringIntervalValue){
                    case 0:
                        result = 'MINUTES';
                        break;
                    case 1:
                        result = 'HOURS';
                        break;
                    case 2:
                        result = 'DAYS';
                        break;
                    case 3:
                        result = 'WEEKS';
                        break;
                    case 4:
                        result = 'MONTHS';
                        break;
                    case 5:
                        result = 'YEARS';
                        break;
                }
                return result;
            }
        },
        onceModeActive: {
            bind: {
                currentScheduleType: '{ScheduleType}'
            },

            get: function(data) {
                return data.currentScheduleType == ScheduleTypeValues.ONCE;
            }
        },

        recurringModeActive: {
            bind: {
                currentScheduleType: '{ScheduleType}'
            },

            get: function(data) {
                return data.currentScheduleType == ScheduleTypeValues.RECURRING;
            }
        },

        dayOfWeekModeActive: {
            bind: {
                currentScheduleType: '{ScheduleType}'
            },

            get: function(data) {
                return data.currentScheduleType == ScheduleTypeValues.DAYOFWEEK;
            }
        },

        recurringOrDayOfWeekModeActive: function(get) {
            return get('dayOfWeekModeActive') || get('recurringModeActive');
        }

    }

});